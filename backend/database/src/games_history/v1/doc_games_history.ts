import { OpenAPIV3 } from 'openapi-types';

export const createGamesHistoryPath: OpenAPIV3.PathItemObject = {
	post: {
		summary: 'Create game history',
		description: 'Creates a new game history record. Supports both 1vs1 and 2vs2 games.',
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
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
							tournament_id: { type: 'integer', nullable: true },
							game_type: { type: 'string', enum: ['1vs1', '2vs2'] },
							team_1_player_user_id_1: { type: 'integer' },
							team_1_player_user_id_2: { type: 'integer', nullable: true },
							team_2_player_user_id_3: { type: 'integer' },
							team_2_player_user_id_4: { type: 'integer', nullable: true },
							started_at: { type: 'string' },
							ended_at: { type: 'string' },
							score_team_1: { type: 'integer' },
							score_team_2: { type: 'integer' },
							winner_user_id_1: { type: 'integer' },
							winner_user_id_2: { type: 'integer', nullable: true },
						},
						example: {
							tournament_id: null,
							game_type: '2vs2',
							team_1_player_user_id_1: 2,
							team_1_player_user_id_2: 3,
							team_2_player_user_id_3: 4,
							team_2_player_user_id_4: 5,
							started_at: '2025-09-16T11:00:00Z',
							ended_at: '2025-09-16T11:00:00Z',
							score_team_1: 10,
							score_team_2: 8,
							winner_user_id_1: 2,
							winner_user_id_2: 3
						}
					}
				}
			}
		},
		responses: {
			'201': {
				description: 'Game history created',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/GamesHistory' }
					}
				}
			},
			'400': { description: 'Invalid payload' },
			'409': { description: 'Duplicate game history' }
		},
		tags: ['Game History']
	}
};

export const getAllGamesHistoryPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get all games history',
		description: 'Returns a list of all games history records.',
		responses: {
			'200': {
				description: 'List of games history',
				content: {
					'application/json': {
						schema: {
							type: 'array',
							items: { $ref: '#/components/schemas/GamesHistory' }
						}
					}
				}
			}
		},
		tags: ['Game History']
	}
};

export const getGamesHistoryByIdPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get game history by ID',
		description: 'Returns a single game history record by its ID.',
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'integer' }
			}
		],
		responses: {
			'200': {
				description: 'Game history found',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/GamesHistory' }
					}
				}
			},
			'404': { description: 'Game history not found' }
		},
		tags: ['Game History']
	}
};

export const updateGamesHistoryByIdPath: OpenAPIV3.PathItemObject = {
	put: {
		summary: 'Update game history by ID',
		description: 'Updates a game history record by its ID.',
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'integer' }
			}
		],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/GamesHistory' }
				}
			}
		},
		responses: {
			'200': {
				description: 'Game history updated',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/GamesHistory' }
					}
				}
			},
			'404': { description: 'Game history not found' },
			'409': { description: 'No changes to update' }
		},
		tags: ['Game History']
	}
};

export const deleteGamesHistoryByIdPath: OpenAPIV3.PathItemObject = {
	delete: {
		summary: 'Delete game history by ID',
		description: 'Deletes a game history record by its ID.',
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'integer' }
			}
		],
		responses: {
			'200': { description: 'Game history deleted' },
			'404': { description: 'Game history not found' }
		},
		tags: ['Game History']
	}
};

export const getAllGamesByUserIdPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get all games by user ID',
		description: 'Returns all games history records where the user participated.',
		parameters: [
			{
				name: 'user_id',
				in: 'path',
				required: true,
				schema: { type: 'integer' }
			}
		],
		responses: {
			'200': {
				description: 'List of games for user',
				content: {
					'application/json': {
						schema: {
							type: 'array',
							items: { $ref: '#/components/schemas/GamesHistory' }
						}
					}
				}
			},
			'404': { description: 'User not found' }
		},
		tags: ['Game History']
	}
};

export const gamesHistoryApiPaths: OpenAPIV3.PathsObject = {
	'/v1/games_history': createGamesHistoryPath,
	'/v1/games_history/all': getAllGamesHistoryPath,
	'/v1/games_history/{id}': {
		...getGamesHistoryByIdPath,
		...updateGamesHistoryByIdPath,
		...deleteGamesHistoryByIdPath
	},
	'/v1/games_history/stats/all_matches/{user_id}': getAllGamesByUserIdPath
};

export const gamesHistorySchemas: OpenAPIV3.ComponentsObject['schemas'] = {
	GamesHistory: {
		type: 'object',
		properties: {
			id: { type: 'integer' },
			tournament_id: { type: 'integer', nullable: true },
			game_type: { type: 'string', enum: ['1vs1', '2vs2'] },
			team_1_player_user_id_1: { type: 'integer' },
			team_1_player_user_id_2: { type: 'integer', nullable: true },
			team_2_player_user_id_3: { type: 'integer' },
			team_2_player_user_id_4: { type: 'integer', nullable: true },
			started_at: { type: 'string' },
			ended_at: { type: 'string' },
			created_at: { type: 'string' },
			score_team_1: { type: 'integer' },
			score_team_2: { type: 'integer' },
			winner_user_id_1: { type: 'integer' },
			winner_user_id_2: { type: 'integer', nullable: true }
		},
		example: {
			id: 1,
			tournament_id: null,
			game_type: '2vs2',
			team_1_player_user_id_1: 2,
			team_1_player_user_id_2: 3,
			team_2_player_user_id_3: 4,
			team_2_player_user_id_4: 5,
			started_at: '2025-09-16T11:00:00Z',
			ended_at: '2025-09-16T11:00:00Z',
			created_at: '2025-09-16T11:00:00Z',
			score_team_1: 10,
			score_team_2: 8,
			winner_user_id_1: 2,
			winner_user_id_2: 3
		}
	}
};
