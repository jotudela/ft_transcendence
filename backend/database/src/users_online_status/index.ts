import { FastifyInstance } from 'fastify';
import UOSV1Routes from './v1/routes';

export default async function UOSRoutes(fastify: FastifyInstance, opts: any) {
	const db = opts.db;
	fastify.register(UOSV1Routes, { prefix: '/', db });
}
