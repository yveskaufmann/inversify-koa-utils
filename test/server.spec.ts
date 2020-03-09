import inversify, { Container } from 'inversify';
import supertest from 'supertest';

import { Delete, Get, Head, HttpMethod, HttpParam, Patch, Post, Put, HttpController } from '../src/decorators';
import { InversifyKoaServer } from '../src/server';
import { cleanUpControllerListMetadata } from '../src/utils';
import { PARAMETER_TYPE } from '../src/constants';

describe('Request Handling', () => {
  let server: InversifyKoaServer;
  let container: inversify.Container;

  function supertestFactory(server?: InversifyKoaServer) {
    if (!server) {
      server = new InversifyKoaServer(container);
    }
    return supertest(server.build().callback());
  }

  beforeEach(() => {
    container = new Container();
    cleanUpControllerListMetadata();
  });

  it('should work for get methods', async () => {
    //

    @HttpController('/users')
    class UserController {
      @Get('/')
      getUserNames(): string[] {
        return ['user1', 'user2'];
      }
    }

    server = new InversifyKoaServer(container);

    await supertestFactory(server)
      .get('/users')
      .expect(200, ['user1', 'user2']);
  });

  it('should pass decorated parameters', async () => {
    //

    @HttpController('/users')
    class UserController {
      @Get('/:customerId')
      getUserNamesByCustomer(@HttpParam(PARAMETER_TYPE.PARAMS, 'customerId') customerId: string): string[] {
        return [`${customerId}-user1`];
      }
    }

    server = new InversifyKoaServer(container);

    await supertestFactory(server)
      .get('/users/fov')
      .expect(200, ['fov-user1']);
  });
});
