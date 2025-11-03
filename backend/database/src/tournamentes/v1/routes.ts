import { FastifyInstance } from 'fastify';
import { tournaments_handlers } from './handlers';
import { global_schemas } from '../../global_parsing_schemas';
import { tournament_schemas } from './parse_schemas';
import { TournamentPayload } from '../interfaces';

export default async function tournamentsV1Routes(fastify: FastifyInstance, opts: any) {
	const db = opts.db;

	// REMINDER : these POST is a transaction.
	fastify.post<{ Body: TournamentPayload }>('/', {
		schema: { body: tournament_schemas.tournamentCreateSchema }
	}, async (request, reply) => {
		await tournaments_handlers.handlerAddTournament({ body: request.body as TournamentPayload }, reply, db);
	});

	fastify.get('/all', async (request, reply) => {
		await tournaments_handlers.handlerGetAllTournaments(request, reply, db);
	});

	fastify.get<{ Params: { id: string } }>('/:id', {
		schema: { params: global_schemas.idParamSchema }
	}, async (request, reply) => {
		await tournaments_handlers.handlerGetTournamentById(request, reply, db);
	});

	// Will respond tournament data and each 3 games data related to the tournament.
	fastify.get<{ Params: { tournament_id: string } }>('/complet_data/:tournament_id', {
		schema: { params: tournament_schemas.idTournamentSchema }
	}, async (request, reply) => {
		await tournaments_handlers.handlerGetCompleteTournamentData(request, reply, db);
	});

	fastify.delete<{ Params: { tournament_id: string } }>('/:tournament_id', {
		schema: { params: tournament_schemas.idTournamentSchema }
	}, async (request, reply) => {
		await tournaments_handlers.handlerDeleteTournamentById(request, reply, db);
	});
}
