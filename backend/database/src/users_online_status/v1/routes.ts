import { FastifyInstance } from 'fastify';
import { uos_handlers } from './handlers';
import { uos_schemas } from './parse_schemas';
import { global_schemas  } from '../../global_parsing_schemas'
import { IAddUos } from '../interfaces';


export default async function UOSV1Routes(fastify: FastifyInstance, opts: any) {
	const db = opts.db;

	fastify.post<{ Body: IAddUos; Params: { user_id: string } }>('/add/:user_id', {
		schema: {
			body: uos_schemas.uosAdd,
			params: global_schemas.userIdParamSchema
		}
	}, async (request, reply) => {
		await uos_handlers.handlerAddUos(request, reply, db);
	});

	fastify.get<{ Params: { id: string } }>('/:id', {
		schema: {
			params: global_schemas.idParamSchema
		}
	}, async (request, reply) => {
		await uos_handlers.handlerGetUosById(request, reply, db);
	});



	fastify.get('/global/latest_statuses', async (request, reply) => {
		await uos_handlers.handlerGetAllLatestStatuses(request, reply, db);
	});

	fastify.post<{ Body: { user_ids: number[] } }>('/targeted_array/latest_statuses', {
		schema: {
			body: uos_schemas.uosTargetedArray
		}
	}, async (request, reply) => {
		await uos_handlers.handlerGetLatestStatusesForUserIds(request, reply, db);
	});

	fastify.delete<{ Params: { id: string } }>('/:id', {
		schema: {
			params: global_schemas.idParamSchema
		}
	}, async (request, reply) => {
		await uos_handlers.handlerDeleteUosById(request, reply, db);
	});
}
