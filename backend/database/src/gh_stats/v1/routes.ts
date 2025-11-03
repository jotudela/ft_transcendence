import { FastifyInstance } from 'fastify';
import { gh_stats_handlers } from './handlers';
import { gh_stats_schemas } from './parse_schemas';

export default async function ghStatsV1Routes(fastify: FastifyInstance, opts: any) {
	const db = opts.db;

	fastify.get<{ Params: { scale: string, user_id: string } }>('/detailed/:scale/:user_id', {
		schema: { params: gh_stats_schemas.scaleAndUserIdSchema }
	}, async (request, reply) => {
		return gh_stats_handlers.handlerGetDetailedStats(request, reply, db);
	});

	fastify.get<{ Params: { scale: string, user_id: string } }>('/:scale/:user_id', {
		schema: { params: gh_stats_schemas.scaleAndUserIdSchema }
	}, async (request, reply) => {
		return gh_stats_handlers.handlerGetStats(request, reply, db);
	});

}