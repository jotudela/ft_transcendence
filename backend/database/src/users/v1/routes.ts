import { FastifyInstance } from 'fastify';
import { users_handlers } from './handlers';
import { schemas } from './parse_schemas';
import { global_schemas } from '../../global_parsing_schemas';
import { Users, UsersUpdateData } from '../interfaces';


export default async function usersV1Routes(fastify: FastifyInstance, opts: any) {
  const db = opts.db;

  fastify.post<{ Body: Users }>('/', {
    schema: {
      body: schemas.userCreateSchema
    }
  }, async (request, reply) => {
    await users_handlers.handlerAddUser(request, reply, db);
  });

  fastify.get('/all', async (request, reply) => {await users_handlers.handlerGetAllUsers(request, reply, db);});

  fastify.get<{ Params: { id: string } }>('/:id', {
		  schema: { params: global_schemas.idParamSchema }
	},async (request, reply) => {
    await users_handlers.handlerGetUserById(request, reply, db);
  });

  // Changed route to avoid conflict with /:id
  fastify.get<{ Params: { email: string } }>('/by_email/:email', {
		  schema: { params: schemas.userEmailParamSchema }
	}, async (request, reply) => {
    await users_handlers.handlerGetUserByEmail(request, reply, db);
  });

  fastify.put<{ Params: { id: string }; Body: Users }>('/:id', {
    schema: {
      body: schemas.userUpdateSchema
    }
  }, async (request, reply) => {
    await users_handlers.handlerUpdateUserById(request, reply, db);
  });

  fastify.put<{ Params: { id: string, types: string }; Body: UsersUpdateData }>('/:types/:id', {
    schema: {
      params: schemas.userUpdateTypesParams, 
      body: schemas.userUpdateSchemaTypes,
    }
  }, async (request, reply) => {
    await users_handlers.handlerUpdateByTypesAndId(request, reply, db);
  });


  fastify.delete<{ Params: { id: string } }>('/:id', {
		schema: { params: global_schemas.idParamSchema }
	},async (request, reply) => {
    await users_handlers.handlerDeleteUserById(request, reply, db);
  });

  fastify.get<{ Params: { id: string } }>('/exists/:id',{
		schema: { params: global_schemas.idParamSchema }
	}, async (request, reply) => {
    await users_handlers.handlerIsUserIdExists(request, reply, db);
  });
}
