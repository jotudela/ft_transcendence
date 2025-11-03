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

const gamesHistoryUpdateSchema = {
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

export const gh_schemas = {
	gamesHistoryCreateSchema,
	gamesHistoryUpdateSchema,
};
