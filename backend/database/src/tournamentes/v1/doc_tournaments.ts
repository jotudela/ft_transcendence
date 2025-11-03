import { OpenAPIV3 } from 'openapi-types';

export const createTournamentPath: OpenAPIV3.PathItemObject = {
	post: {
		summary: 'Create tournament',
		description: 'Creates a new tournament and its games history. The payload must include tournament data and exactly 3 games in the games_history array.',
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						required: ['tournament', 'games_history'],
						properties: {
							tournament: {
								type: 'object',
								required: [
									'tournament_type', 'tournament_name', 'contract_id', 'contract_id_created_at',
									'started_at', 'ended_at', 'first_position_user_id_1', 'second_position_user_id_1', 'winner_user_id_1'
								],
								properties: {
									tournament_type: { type: 'string', enum: ['1vs1', '2vs2'] },
									tournament_name: { type: 'string' },
									contract_id: { type: 'string' },
									contract_id_created_at: { type: 'string' },
									started_at: { type: 'string' },
									ended_at: { type: 'string' },
									first_position_user_id_1: { type: 'integer' },
									first_position_user_id_2: { type: 'integer', nullable: true },
									second_position_user_id_1: { type: 'integer' },
									second_position_user_id_2: { type: 'integer', nullable: true },
									thirth_position_user_id_1: { type: 'integer', nullable: true },
									thirth_position_user_id_2: { type: 'integer', nullable: true },
									fourth_position_user_id_1: { type: 'integer', nullable: true },
									fourth_position_user_id_2: { type: 'integer', nullable: true },
									winner_user_id_1: { type: 'integer' },
									winner_user_id_2: { type: 'integer', nullable: true }
								}
							},
							games_history: {
								type: 'array',
								description: 'Must contain exactly 3 games.',
								minItems: 3,
								maxItems: 3,
								items: {
									type: 'object',
									required: [
										'game_type', 'team_1_player_user_id_1', 'team_2_player_user_id_3',
										'started_at', 'ended_at', 'score_team_1', 'score_team_2', 'winner_user_id_1'
									],
									properties: {
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
										winner_user_id_2: { type: 'integer', nullable: true }
									}
								}
							}
						},
						example: {
							tournament: {
								tournament_type: "1vs1",
								tournament_name: "Summer Cup 2025 '1vs1'",
								contract_id: "0x123456789abcdef0000",
								contract_id_created_at: "2025-05-01T12:00:00Z",
								started_at: "2025-07-01T14:00:00Z",
								ended_at: "2025-07-15T18:00:00Z",
								first_position_user_id_1: 1,
								first_position_user_id_2: null,
								second_position_user_id_1: 2,
								second_position_user_id_2: null,
								thirth_position_user_id_1: 3,
								thirth_position_user_id_2: null,
								fourth_position_user_id_1: 4,
								fourth_position_user_id_2: null,
								winner_user_id_1: 3,
								winner_user_id_2: null
							},
							games_history: [
								{
									game_type: "1vs1",
									team_1_player_user_id_1: 1,
									team_1_player_user_id_2: null,
									team_2_player_user_id_3: 2,
									team_2_player_user_id_4: null,
									started_at: "2025-07-01T15:00:00Z",
									ended_at: "2025-07-01T15:30:00Z",
									score_team_1: 17,
									score_team_2: 4,
									winner_user_id_1: 1,
									winner_user_id_2: null
								},
								{
									game_type: "1vs1",
									team_1_player_user_id_1: 3,
									team_1_player_user_id_2: null,
									team_2_player_user_id_3: 4,
									team_2_player_user_id_4: null,
									started_at: "2025-07-03T16:00:00Z",
									ended_at: "2025-07-03T16:30:00Z",
									score_team_1: 2,
									score_team_2: 8,
									winner_user_id_1: 4,
									winner_user_id_2: null
								},
								{
									game_type: "1vs1",
									team_1_player_user_id_1: 1,
									team_1_player_user_id_2: null,
									team_2_player_user_id_3: 4,
									team_2_player_user_id_4: null,
									started_at: "2025-07-10T17:00:00Z",
									ended_at: "2025-07-10T17:30:00Z",
									score_team_1: 6,
									score_team_2: 12,
									winner_user_id_1: 4,
									winner_user_id_2: null
								}
							]
						}
					}
				}
			}
		},
		responses: {
			'200': {
				description: 'Tournament and games batch added to DB',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								msg: { type: 'string' },
								tournament_inserted_id: { type: 'integer' }
							},
							example: {
								msg: "Tournament and games batch added to DB",
								tournament_inserted_id: 1
							}
						}
					}
				}
			},
			'400': {
				description: 'Invalid payload',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: { error: { type: 'string' } }
						}
					}
				}
			}
		},
		tags: ['Tournaments']
	}
};

export const getAllTournamentsPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get all tournaments',
		description: 'Returns a list of all tournaments.',
		responses: {
			'200': {
				description: 'List of tournaments',
				content: {
					'application/json': {
						schema: {
							type: 'array',
							items: { type: 'object' }
						}
					}
				}
			}
		},
		tags: ['Tournaments']
	}
};

export const getTournamentByIdPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get tournament by ID',
		description: 'Returns a tournament by its ID.',
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
				description: 'Tournament found',
				content: {
					'application/json': {
						schema: { type: 'object' }
					}
				}
			},
			'404': {
				description: 'Tournament not found',
				content: {
					'application/json': {
						schema: { type: 'object', properties: { error: { type: 'string' } } }
					}
				}
			}
		},
		tags: ['Tournaments']
	}
};

export const getCompleteTournamentDataPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get complete tournament data',
		description: 'Returns tournament and its games history by tournament ID.',
		parameters: [
			{
				name: 'tournament_id',
				in: 'path',
				required: true,
				schema: { type: 'integer' }
			}
		],
		responses: {
			'200': {
				description: 'Tournament and games history',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								tournament: { type: 'object' },
								games_history: { type: 'array', items: { type: 'object' } }
							}
						}
					}
				}
			},
			'404': {
				description: 'Tournament not found',
				content: {
					'application/json': {
						schema: { type: 'object', properties: { error: { type: 'string' } } }
					}
				}
			}
		},
		tags: ['Tournaments']
	}
};

export const deleteTournamentByIdPath: OpenAPIV3.PathItemObject = {
	delete: {
		summary: 'Delete tournament by ID',
		description: 'Deletes a tournament and its related games by tournament ID.',
		parameters: [
			{
				name: 'tournament_id',
				in: 'path',
				required: true,
				schema: { type: 'integer' }
			}
		],
		responses: {
			'200': {
				description: 'Tournament and related games deleted',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: { msg: { type: 'string' } },
							example: { msg: 'Tournament and related games deleted' }
						}
					}
				}
			},
			'404': {
				description: 'Tournament not found',
				content: {
					'application/json': {
						schema: { type: 'object', properties: { error: { type: 'string' } } }
					}
				}
			}
		},
		tags: ['Tournaments']
	}
};

export const tournamentsApiPaths: OpenAPIV3.PathsObject = {
	'/v1/tournamentes': createTournamentPath,
	'/v1/tournamentes/all': getAllTournamentsPath,
	'/v1/tournamentes/{id}': getTournamentByIdPath,
	'/v1/tournamentes/complet_data/{tournament_id}': getCompleteTournamentDataPath,
	'/v1/tournamentes/{tournament_id}': deleteTournamentByIdPath
};
