export const tournamentCreateShema = {
    type: 'object',
    required: ['nicknames', 'ranks', 'points', 'name'],
    properties: {
        id: {
            type: 'array',
            items: { type: 'integer', minimum: 1 },
            minItems: 1,
            maxItems: 4,
            uniqueItems: true
        },
        nicknames: {
            type: 'array',
            items: { type: 'string', minLength: 3, maxLength: 32 },
            minItems: 1,
            maxItems: 4,
            uniqueItems: true
        },
        ranks: {
            type: 'array',
            items: { type: 'integer', minimum: 1, maximum: 4 },
            minItems: 1,
            maxItems: 4
        },
        points: {
            type: 'array',
            items: { type: 'integer', minimum: 0, maximum: 20 },
            minItems: 1,
            maxItems: 4
        },
        name: { type: 'string', minLength: 1, maxLength: 20 }
    }
};

const tournamentSchema = {
	type: 'object',
	required: [
		'tournament_type',
		'tournament_name',
		'started_at',
		'ended_at',
		'first_position_user_id_1',
		'second_position_user_id_1',
		'winner_user_id_1'
	],
	properties: {
		tournament_type: { type: 'string', enum: ['1vs1', '2vs2'] },
		tournament_name: { type: 'string' },
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

const gamesHistoryCreateSchema = {
	type: 'object',
	required: [
		'game_type',
		'team_1_player_user_id_1',
		'team_2_player_user_id_3',
		'started_at',
		'ended_at',
		'score_team_1',
		'score_team_2',
		'winner_user_id_1'
	],
	properties: {
		tournament_id: { type: ['integer', 'null'] },
		game_type: { type: 'string', enum: ['1vs1', '2vs2'] },
		team_1_player_user_id_1: { type: 'integer' },
		team_1_player_user_id_2: { type: ['integer', 'null'] },
		team_2_player_user_id_3: { type: 'integer' },
		team_2_player_user_id_4: { type: ['integer', 'null'] },
		started_at: { type: 'string' },
		ended_at: { type: 'string' },
		score_team_1: { type: 'integer' },
		score_team_2: { type: 'integer' },
		winner_user_id_1: { type: 'integer' },
		winner_user_id_2: { type: ['integer', 'null'] },
	}
};

export const tournamentCreateSchemaForDB = {
	type: 'object',
	required: ['tournament', 'games_history'],
	properties: {
		tournament: tournamentSchema,
		games_history: {
			type: 'array',
			items: gamesHistoryCreateSchema,
			minItems: 3,
			maxItems: 3
		}
	}
};