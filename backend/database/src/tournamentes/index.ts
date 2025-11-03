import { FastifyInstance } from 'fastify';
import v1Routes from './v1/routes';

export default async function tournamentsRoutes(fastify: FastifyInstance, opts: any) {
	const db = opts.db;
	fastify.register(v1Routes, { prefix: '/v1', db });
}
