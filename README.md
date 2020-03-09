# inversify-koa-utils

![Node.js CI](https://github.com/yveskaufmann/inversify-koa-utils/workflows/Node.js%20CI/badge.svg)

Use Inversify in your koa based applications.

## Installation

You can install `inversify-koa-utils` using npm:

```bash
npm install inversify inversify-koa-utils --save
```

## The Basics

### Step 1: Decorate your controllers

To use a class as a "controller" for your restify app, simply add the `@Controller` decorator to the class. Similarly, decorate methods of the class to serve as request handlers.
The following example will declare a controller that responds to `GET /foo'.

```ts
import { inject } from 'inversify';
import { HttpController } from 'inversify-koa-utils';

@HttpController('/users')
class UserController {
  @inject('logService')
  private logService: LogService;

  @Get('/:id')
  getUserById(@HttpParam(PARAMETER_TYPE.PARAMS, 'Id') id: string) {
    this.logService.info(`Found user with userId=${id}`);
    return {
      id,
      name: `${user}-id`,
    };
  }
}
```

### Step 2: Configure container and server

Configure the inversify container in your composition root as usual.

Then, pass the container to the InversifyKoaServer constructor. This will allow it to register all controllers and their dependencies from your container and attach them to the koa app.
Then just call server.build() to prepare your app.

In order for the InversifyKoaServer to find your controllers, you must import them along the InversifyKoaServer.

```ts
import { Container } from 'inversify';
import { interfaces, InversifyKoaServer, TYPE } from 'inversify-koa-utils';

// set up container
let container = new Container();

container.bind<LogService>('logService').to(LogService);

// create server
let server = new InversifyRestifyServer(container);

// start listening on port 3000
let app = server.build();
app.listen(3000);
```
