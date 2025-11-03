import { FastifyInstance } from 'fastify';
import { games_history_handlers } from './handlers';
import { gh_schemas } from './parse_schemas';
import { global_schemas } from '../../global_parsing_schemas';
import { GamesHistory } from '../interfaces';

export default async function gamesHistoryV1Routes(fastify: FastifyInstance, opts: any) {
	const db = opts.db;

	fastify.post<{ Body: GamesHistory }>('/', {
		schema: { body: gh_schemas.gamesHistoryCreateSchema }
	}, async (request, reply) => {
		await games_history_handlers.handlerAddGame(request, reply, db);
	});

	fastify.get('/all', async (request, reply) => {
		await games_history_handlers.handlerGetAllGames(request, reply, db);
	});

	fastify.get<{ Params: { id: string } }>('/:id', {
		schema: { params: global_schemas.idParamSchema }
	}, async (request, reply) => {
		await games_history_handlers.handlerGetGameById(request, reply, db);
	});

	// GET all games by user_id
	fastify.get<{ Params: { user_id: string } }>('/stats/all_matches/:user_id', {
		schema: { params: global_schemas.userIdParamSchema }
	}, async (request, reply) => {
		return games_history_handlers.handlerGetAllGamesByUserId(request, reply, db);
	});

	// TODO we could create endpoints that will get games related to tournaments and only "1vs1".

	fastify.put<{ Params: { id: string }; Body: GamesHistory }>('/:id', {
		schema: { body: gh_schemas.gamesHistoryUpdateSchema }
	}, async (request, reply) => {
		await games_history_handlers.handlerUpdateGameById(request, reply, db);
	});

	fastify.delete<{ Params: { id: string } }>('/:id', {
		schema: { params: global_schemas.idParamSchema }
	}, async (request, reply) => {
		await games_history_handlers.handlerDeleteGameById(request, reply, db);
	});
}
