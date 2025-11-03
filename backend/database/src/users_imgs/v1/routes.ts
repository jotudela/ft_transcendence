import { FastifyInstance } from 'fastify';
import { global_schemas } from '../../global_parsing_schemas';
import {users_img_handlers} from './handlers'

export default async function usersImgV1Routes(fastify: FastifyInstance, opts: any) {
  const db = opts.db;

  // Add profile image update endpoint
  fastify.put<{ Params: { user_id: string } }>('/profile_image/:user_id', {
    schema: { params: global_schemas.userIdParamSchema}
  }, async (request, reply) => {
    await users_img_handlers.handlerUpdateProfileImg(request, reply, db);
  });

  fastify.get<{ Params: { user_id: string } }>('/profile_image/:user_id', {
    schema: { params: global_schemas.userIdParamSchema}
  }, async (request, reply) => {
    await users_img_handlers.handlerGetProfileImg(request, reply, db);
  });

  fastify.delete<{ Params: { user_id: string } }>('/profile_image/:user_id', {
    schema: { params: global_schemas.userIdParamSchema}
  }, async (request, reply) => {
    await users_img_handlers.handlerEraseProfileImg(request, reply, db);
  });
}
