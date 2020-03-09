import inversify from 'inversify';
import koa from 'koa';
import { PARAMETER_TYPE } from './constants';

export namespace interfaces {
  export type Middleware<StateT = koa.DefaultState, CustomT = koa.DefaultContext> =
    | inversify.interfaces.ServiceIdentifier<any>
    | koa.Middleware<ApplicationContext<StateT, CustomT>>;

  export interface ApplicationContext<StateT = koa.DefaultState, CustomT = koa.DefaultContext>
    extends koa.ParameterizedContext {
    /**
     * Gets access to the application inversify container.
     */
    container: inversify.Container;
  }

  export interface ControllerMetadata {
    path: string;
    middleware: Middleware[];
    target: any;
  }

  export interface ControllerMetadata {
    path: string;
    middleware: Middleware[];
    target: any;
  }

  export interface ControllerMethodMetadata extends ControllerMetadata {
    method: string;
    key: string;
  }

  export interface ControllerParameterMetadata {
    [methodName: string]: ParameterMetadata[];
  }

  export interface ParameterMetadata {
    parameterName?: string;
    injectRoot: boolean;
    index: number;
    type: PARAMETER_TYPE;
  }

  export interface Controller {}

  export interface ConfigFunction {
    (app: koa): void;
  }
}
