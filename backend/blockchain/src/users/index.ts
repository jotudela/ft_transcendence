import Fastify from "fastify";
import { FastifyInstance } from 'fastify';
import { DeployBody } from './interfaces';
import userV1Routes from './v1/routes';

export default async function usersRoutes(fastify: FastifyInstance, opts: any) {

  const db = opts.db;
	fastify.register(userV1Routes, { prefix: '/v1', db });

}