import { METADATA_KEY, PARAMETER_TYPE } from '../src/constants';

import { HttpController, HttpMethod, Post, HttpParam, Get } from '../src/decorators';
import { interfaces } from '../src/interfaces';
import { cleanUpControllerListMetadata } from '../src/utils';

describe('Controller Decorators', () => {
  beforeEach(() => {
    cleanUpControllerListMetadata();
  });

  it('should add controller metadata to a class when decorated with @controller', () => {
    const path = '/users';

    @HttpController(path)
    class UserController {}

    const controllerMetadata: interfaces.ControllerMetadata = Reflect.getMetadata(
      METADATA_KEY.controller,
      UserController
    );

    expect(controllerMetadata.path).toBe(path);
    expect(controllerMetadata.middleware).toEqual([]);
    expect(controllerMetadata.target).toBe(UserController);
  });

  it('should collect all controller metadata along the Reflect metadata', () => {
    @HttpController('/users')
    class UserController {}

    @HttpController('/posts')
    class PostController {}

    const controllerMetadata: interfaces.ControllerMetadata[] = Reflect.getMetadata(METADATA_KEY.controller, Reflect);

    expect(controllerMetadata).toBeInstanceOf(Array);
    expect(controllerMetadata).toHaveLength(2);
    expect(controllerMetadata).toEqual([
      {
        path: '/users',
        middleware: [],
        target: UserController,
      },
      {
        path: '/posts',
        middleware: [],
        target: PostController,
      },
    ]);
  });

  it('should add method metadata for decorated methods with httpMethod', () => {
    @HttpController('/users')
    class UserController {
      @HttpMethod('GET', '/')
      getUsers() {
        return [];
      }

      @Post('/byTemplate/{templateId}')
      createUser() {
        return null;
      }
    }

    const methodMetadataList: interfaces.ControllerMethodMetadata[] = Reflect.getMetadata(
      METADATA_KEY.controllerMethod,
      UserController
    );

    expect(methodMetadataList).toHaveLength(2);
    expect(methodMetadataList[0].target).toBe(UserController);
    expect(methodMetadataList[0].key).toBe('getUsers');
    expect(methodMetadataList[0].path).toBe('/');
    expect(methodMetadataList[0].method).toBe('get');
    expect(methodMetadataList[0].middleware).toEqual([]);

    expect(methodMetadataList[1].target).toBe(UserController);
    expect(methodMetadataList[1].key).toBe('createUser');
    expect(methodMetadataList[1].path).toBe('/byTemplate/{templateId}');
    expect(methodMetadataList[1].method).toBe('post');
    expect(methodMetadataList[1].middleware).toEqual([]);
  });

  it('should add parameter metadata to a parameter when decorated with @params', () => {
    class UserController {
      //  @Get('/:id')
      public getUserById(@HttpParam(PARAMETER_TYPE.PARAMS, 'id') id: string) {}

      @Post('/:projectId')
      public createUser(
        @HttpParam(PARAMETER_TYPE.PARAMS, 'projectId') id: string,
        @HttpParam(PARAMETER_TYPE.BODY) body: any
      ) {}
    }

    const controllerParameterMetadata: interfaces.ControllerParameterMetadata = Reflect.getMetadata(
      METADATA_KEY.controllerParameter,
      UserController
    );

    expect(controllerParameterMetadata['getUserById']).toHaveLength(1);
    expect(controllerParameterMetadata['getUserById']).toEqual([
      {
        index: 0,
        type: PARAMETER_TYPE.PARAMS,
        injectRoot: false,
        parameterName: 'id',
      },
    ]);

    expect(controllerParameterMetadata['createUser']).toHaveLength(2);
    expect(controllerParameterMetadata['createUser']).toEqual([
      {
        index: 0,
        type: PARAMETER_TYPE.PARAMS,
        injectRoot: false,
        parameterName: 'projectId',
      },
      {
        index: 1,
        type: PARAMETER_TYPE.BODY,
        injectRoot: true,
        parameterName: undefined,
      },
    ]);
  });
});
