import Fastify from "fastify";
import { FastifyInstance } from 'fastify';
import globalStatsV1Routes from './v1/routes';

export default async function globalStatsRoutes(fastify: FastifyInstance, opts: any) {
    
    const db = opts.db;
	fastify.register(globalStatsV1Routes, { prefix: '/v1', db });

}