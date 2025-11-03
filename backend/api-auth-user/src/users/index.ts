import Fastify from "fastify";
import { FastifyInstance } from 'fastify';
import { DeployBody1, DeployBody2 } from './interfaces';
import userV1Routes from './v1/routes';
import userV2Routes from './v2/routes';

export default async function usersRoutes(fastify: FastifyInstance, opts: any) {
    
    const db = opts.db;
	fastify.register(userV1Routes, { prefix: '/v1', db });

    fastify.register(userV2Routes, { prefix: '/v2', db });

}