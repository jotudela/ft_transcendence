import { FastifyInstance } from 'fastify';
import { Users } from './interfaces.ts';
import v1Routes from './v1/routes';

export default async function usersRoutes(fastify: FastifyInstance, opts: any) {
		const db = opts.db;
		fastify.register(v1Routes, { prefix: '/v1', db });

		// v2 endpoints (example)
		fastify.register(async function (v2, opts) {
			v2.post<{ Body: Users }>('/', async (request, reply) => {
				const user = await addUser(db, request.body);
				reply.send({ user, message: "hellos fede from v2" });
			});
		}, { prefix: '/v2' });
}
 