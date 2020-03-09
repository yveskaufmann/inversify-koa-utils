export class DuplicatedControllerNameError extends Error {
  constructor(public controllerName: string) {
    super(`There is already a controller with the name ${controllerName}`);
    Error.captureStackTrace(this, DuplicatedControllerNameError.constructor);
  }
}

export class NoControllersFoundError extends Error {
  constructor() {
    super(`No controllers found!`);
    Error.captureStackTrace(this, NoControllersFoundError.constructor);
  }
}
