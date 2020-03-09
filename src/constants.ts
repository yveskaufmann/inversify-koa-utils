export const TYPE = {
  Controller: Symbol.for('KoaController'),
  HttpContext: Symbol.for('KoaContext'),
};

export const METADATA_KEY = {
  controller: 'inversify-koa-utils:controller',
  controllerMethod: 'inversify-koa-utils:controller-method',
  controllerParameter: 'inversify-koa-utils:controller-parameter',
  httpContext: 'inversify-koa-utils:httpcontext',
};

export enum PARAMETER_TYPE {
  REQUEST,
  RESPONSE,
  PARAMS,
  QUERY,
  BODY,
  HEADERS,
  COOKIES,
  NEXT,
  PRINCIPAL,
  CONTEXT,
}
