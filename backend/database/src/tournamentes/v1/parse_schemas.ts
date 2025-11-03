import { gh_schemas } from '../../games_history/v1/parse_schemas';

const tournamentSchema = {
	type: 'object',
	required: [
		'tournament_type',
		'tournament_name',
		'contract_id',
		'contract_id_created_at',
		'started_at',
		'ended_at',
		'first_position_user_id_1',
		'second_position_user_id_1',
		'winner_user_id_1'
	],
	properties: {
		tournament_type: { type: 'string', enum: ['1vs1', '2vs2'] },
		tournament_name: { type: 'string' },
		contract_id: { type: 'string' },
		contract_id_created_at: { type: 'string' },
		started_at: { type: 'string' },
		ended_at: { type: 'string' },
		first_position_user_id_1: { type: 'integer' },
		first_position_user_id_2: { type: ['integer', 'null'] },
		second_position_user_id_1: { type: 'integer' },
		second_position_user_id_2: { type: ['integer', 'null'] },
		thirth_position_user_id_1: { type: ['integer', 'null'] },
		thirth_position_user_id_2: { type: ['integer', 'null'] },
		fourth_position_user_id_1: { type: ['integer', 'null'] },
		fourth_position_user_id_2: { type: ['integer', 'null'] },
		winner_user_id_1: { type: 'integer' },
		winner_user_id_2: { type: ['integer', 'null'] }
	}
};

const tournamentCreateSchema = {
	type: 'object',
	required: ['tournament', 'games_history'],
	properties: {
		tournament: tournamentSchema,
		games_history: {
			type: 'array',
			items: gh_schemas.gamesHistoryCreateSchema,
			minItems: 3,
			maxItems: 3
		}
	}
};

const idTournamentSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', pattern: '^[0-9]+$' }
    },
    required: ['tournament_id']
};

export const tournament_schemas = {
	tournamentCreateSchema,
	idTournamentSchema,
}