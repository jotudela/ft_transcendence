import Fastify from "fastify";
import { FastifyInstance } from 'fastify';
import matchHistoryV1Routes from './v1/routes';

export default async function matchHistoryRoutes(fastify: FastifyInstance, opts: any) {
    
    const db = opts.db;
	fastify.register(matchHistoryV1Routes, { prefix: '/v1', db });

}