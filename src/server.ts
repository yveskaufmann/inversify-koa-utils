import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBodyParser from 'koa-bodyparser';
import inversify from 'inversify';
import {
  getControllersFromMetadata,
  getControllersFromContainer,
  getControllerMetadata,
  getControllerMethodMetadata,
  getControllerParameterMetadata,
} from './utils';
import { TYPE, PARAMETER_TYPE } from './constants';
import { DuplicatedControllerNameError } from './error';
import { interfaces } from './interfaces';

export class InversifyKoaServer {
  //
  //
  private container: inversify.Container;
  private koaApp: Koa;
  private configFn?: interfaces.ConfigFunction;

  constructor(container: inversify.Container) {
    this.container = container;
    this.koaApp = new Koa();
  }

  public setConfig(fn: interfaces.ConfigFunction): this {
    this.configFn = fn;
    return this;
  }

  public build(): Koa {
    if (this.configFn) {
      this.configFn.apply(undefined, [this.koaApp]);
    }

    this.registerControllers();

    return this.koaApp;
  }

  private registerControllers() {
    for (const controller of getControllersFromMetadata()) {
      const controllerName = controller.name;

      if (this.container.isBoundNamed(TYPE.Controller, controllerName)) {
        throw new DuplicatedControllerNameError(controllerName);
      }

      this.container
        .bind(TYPE.Controller)
        .to(controller)
        .whenTargetNamed(controllerName);
    }

    for (const controller of getControllersFromContainer(this.container, true)) {
      const controllerMetadata = getControllerMetadata(controller.constructor);
      const methodListMetadata = getControllerMethodMetadata(controller.constructor);
      const parameterListMetadata = getControllerParameterMetadata(controller.constructor);

      if (controllerMetadata && methodListMetadata) {
        const router = new KoaRouter({
          prefix: controllerMetadata.path,
        });

        router.use(this.resolveMiddleware(...(controllerMetadata.middleware ?? [])));

        for (const methodMetadata of methodListMetadata) {
          const parameterList = parameterListMetadata?.[methodMetadata.key] ?? [];
          router.register(
            methodMetadata.path,
            [methodMetadata.method],
            [
              this.handlerFactory(parameterList, controllerMetadata, methodMetadata),
              ...this.resolveMiddleware(...methodMetadata.middleware),
            ]
          );
        }

        this.koaApp.use(router.routes());
      }
    }
  }

  private resolveMiddleware(...middleware: interfaces.Middleware[]) {
    return middleware.map((middleware) => {
      if (!this.container.isBound(middleware)) {
        return middleware;
      }

      const boundMiddleware = this.container.get(middleware);
      return boundMiddleware;
    });
  }

  private handlerFactory(
    parameterList: interfaces.ParameterMetadata[],
    controllerMetadata: interfaces.ControllerMetadata,
    methodMetadata: interfaces.ControllerMethodMetadata
  ) {
    return async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
      try {
        const paramArgs = this.extractParameters(ctx, next, parameterList);
        // TODO: scoped container
        const container = this.container;
        const value = await container
          .getNamed<any>(TYPE.Controller, controllerMetadata.target.name)
          [methodMetadata.key](...paramArgs);
        if (!ctx.headerSent) {
          if (value === undefined) {
            ctx.status = 204;
          }
          ctx.body = value;
        }
      } finally {
        await next();
      }
    };
  }

  public extractParameters(
    ctx: Koa.ParameterizedContext,
    next: Koa.Next,
    parameterList: interfaces.ParameterMetadata[]
  ) {
    let args: any[] = [];
    if (!parameterList || !parameterList.length) {
      return [ctx, next];
    }

    for (const param of parameterList) {
      switch (param.type) {
        case PARAMETER_TYPE.REQUEST:
          args[param.index] = ctx.request;
          break;
        case PARAMETER_TYPE.BODY:
          args[param.index] = ctx.request?.body ?? undefined;
          break;
        case PARAMETER_TYPE.COOKIES:
          args[param.index] = this.getParam(ctx, 'cookies', param.injectRoot, param.parameterName);
          break;
        case PARAMETER_TYPE.HEADERS:
          args[param.index] = this.getParam(ctx, 'headers', param.injectRoot, param.parameterName);
          break;
        case PARAMETER_TYPE.PARAMS:
          args[param.index] = this.getParam(ctx, 'params', param.injectRoot, param.parameterName);
          break;
        case PARAMETER_TYPE.QUERY:
          args[param.index] = this.getParam(ctx, 'query', param.injectRoot, param.parameterName);
          break;
        case PARAMETER_TYPE.RESPONSE:
          args[param.index] = ctx.response;
          break;
        case PARAMETER_TYPE.CONTEXT:
          args[param.index] = ctx;
          break;
        case PARAMETER_TYPE.NEXT:
          args[param.index] = next;
          break;
      }
    }

    args.push(ctx, next);
    return args;
  }

  private getParam(
    source: Koa.ParameterizedContext,
    paramType: keyof Koa.ParameterizedContext,
    injectRoot: boolean,
    name?: string
  ) {
    if (paramType === 'headers' && name) {
      name = name.toLowerCase();
    }
    let param = source[paramType];

    if (injectRoot) {
      return param;
    } else {
      if (paramType === 'cookies') {
        return param.get(name) ?? undefined;
      }

      return param && name ? param[name] : undefined;
    }
  }
}
