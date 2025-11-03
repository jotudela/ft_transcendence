import { FastifyInstance } from 'fastify';
import v1Routes from './v1/routes';

export default async function usersRoutes(fastify: FastifyInstance, opts: any) {
		const db = opts.db;
		fastify.register(v1Routes, { prefix: '', db });
}
 