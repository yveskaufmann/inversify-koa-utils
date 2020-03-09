import 'reflect-metadata';
import { decorate, injectable } from 'inversify';

import { interfaces } from './interfaces';
import { METADATA_KEY, PARAMETER_TYPE } from './constants';

export function HttpController(path: string, ...middleware: interfaces.Middleware[]) {
  return function(target: any) {
    let controllerMetadata: interfaces.ControllerMetadata = {
      path,
      middleware,
      target,
    };

    decorate(injectable(), target);
    Reflect.defineMetadata(METADATA_KEY.controller, controllerMetadata, target);

    const previousControllerMetadata: interfaces.ControllerMetadata[] =
      Reflect.getOwnMetadata(METADATA_KEY.controller, Reflect) ?? [];

    previousControllerMetadata.push(controllerMetadata);

    Reflect.defineMetadata(METADATA_KEY.controller, previousControllerMetadata, Reflect);
  };
}

export function Get(path: string, ...middleware: interfaces.Middleware[]) {
  return HttpMethod('get', path, ...middleware);
}

export function Post(path: string, ...middleware: interfaces.Middleware[]) {
  return HttpMethod('post', path, ...middleware);
}

export function Put(path: string, ...middleware: interfaces.Middleware[]) {
  return HttpMethod('put', path, ...middleware);
}

export function Patch(path: string, ...middleware: interfaces.Middleware[]) {
  return HttpMethod('patch', path, ...middleware);
}

export function Head(path: string, ...middleware: interfaces.Middleware[]) {
  return HttpMethod('head', path, ...middleware);
}

export function Delete(path: string, ...middleware: interfaces.Middleware[]) {
  return HttpMethod('delete', path, ...middleware);
}

export function HttpMethod(method: string, path: string, ...middleware: interfaces.Middleware[]) {
  return function(target: any, key: string, propertyDescriptor: PropertyDescriptor) {
    const methodMetadata: interfaces.ControllerMethodMetadata = {
      key,
      method: method.toLowerCase(),
      middleware,
      path,
      target: target.constructor,
    };
    let methodMetadataList: interfaces.ControllerMethodMetadata[] = [];

    if (!Reflect.hasMetadata(METADATA_KEY.controllerMethod, target.constructor)) {
      Reflect.defineMetadata(METADATA_KEY.controllerMethod, methodMetadataList, target.constructor);
    } else {
      methodMetadataList = Reflect.getMetadata(METADATA_KEY.controllerMethod, target.constructor);
    }

    methodMetadataList.push(methodMetadata);
  };
}

export function HttpParam(type: PARAMETER_TYPE, parameterName?: string) {
  return function(target: Object, methodeName: string | symbol, index: number) {
    let controllerParameterMetadata: interfaces.ControllerParameterMetadata = {};
    if (!Reflect.hasMetadata(METADATA_KEY.controllerParameter, target.constructor)) {
      Reflect.defineMetadata(METADATA_KEY.controllerParameter, controllerParameterMetadata, target.constructor);
    } else {
      controllerParameterMetadata = Reflect.getMetadata(METADATA_KEY.controllerParameter, target.constructor);
    }

    if (!Reflect.has(controllerParameterMetadata, methodeName)) {
      Reflect.set(controllerParameterMetadata, methodeName, []);
    }

    const parameterMetadata: interfaces.ParameterMetadata = {
      index,
      type,
      injectRoot: parameterName === undefined,
      parameterName,
    };

    controllerParameterMetadata[methodeName.toString()].unshift(parameterMetadata);
  };
}
