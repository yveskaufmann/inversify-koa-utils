import { interfaces as inversifyInterfaces } from 'inversify';

import { METADATA_KEY, TYPE } from './constants';
import { interfaces } from './interfaces';
import { NoControllersFoundError } from './error';

export function cleanUpControllerListMetadata() {
  Reflect.deleteMetadata(METADATA_KEY.controller, Reflect);
}

export function getControllersFromContainer(container: inversifyInterfaces.Container, forceControllers: boolean) {
  if (container.isBound(TYPE.Controller)) {
    return container.getAll<interfaces.Controller>(TYPE.Controller);
  } else if (forceControllers) {
    throw new NoControllersFoundError();
  } else {
    return [];
  }
}

export function getControllersFromMetadata() {
  let arrayOfControllerMetadata: interfaces.ControllerMetadata[] =
    Reflect.getMetadata(METADATA_KEY.controller, Reflect) || [];
  return arrayOfControllerMetadata.map((metadata) => metadata.target);
}

export function getControllerMetadata(constructor: any) {
  let controllerMetadata: interfaces.ControllerMetadata = Reflect.getMetadata(METADATA_KEY.controller, constructor);
  return controllerMetadata;
}

export function getControllerMethodMetadata(constructor: any) {
  let methodMetadata: interfaces.ControllerMethodMetadata[] = Reflect.getMetadata(
    METADATA_KEY.controllerMethod,
    constructor
  );
  return methodMetadata;
}

export function getControllerParameterMetadata(constructor: any) {
  let parameterMetadata: interfaces.ControllerParameterMetadata = Reflect.getMetadata(
    METADATA_KEY.controllerParameter,
    constructor
  );
  return parameterMetadata;
}
