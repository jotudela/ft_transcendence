import { OpenAPIV3 } from 'openapi-types';

export const getGlobalStatsPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get global stats for a user',
		description: 'Returns total wins, losses, and score for all games played by the user.',
		parameters: [
			{
				name: 'user_id',
				in: 'path',
				required: true,
				schema: { type: 'integer' },
				description: 'User ID'
			}
		],
		responses: {
			'200': {
				description: 'Global stats for user',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								amount_wins: { type: 'integer' },
								amount_losts: { type: 'integer' },
								total_score: { type: 'integer' }
							},
							example: {
								amount_wins: 12,
								amount_losts: 8,
								total_score: 120
							}
						}
					}
				}
			},
			'404': {
				description: 'User not found'
			}
		},
		tags: ['Statistics']
	}
};

export const getOnly1vs1StatsPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get stats for only 1vs1 games',
		description: 'Returns stats for games not related to tournaments (only 1vs1).',
		parameters: [
			{
				name: 'user_id',
				in: 'path',
				required: true,
				schema: { type: 'integer' },
				description: 'User ID'
			}
		],
		responses: {
			'200': {
				description: '1vs1 stats for user',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								amount_wins: { type: 'integer' },
								amount_losts: { type: 'integer' },
								total_score: { type: 'integer' }
							},
							example: {
								amount_wins: 5,
								amount_losts: 3,
								total_score: 50
							}
						}
					}
				}
			},
			'404': {
				description: 'User not found'
			}
		},
		tags: ['Statistics']
	}
};

export const getOnlyTournamentStatsPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get stats for only tournament games',
		description: 'Returns stats for games related to tournaments.',
		parameters: [
			{
				name: 'user_id',
				in: 'path',
				required: true,
				schema: { type: 'integer' },
				description: 'User ID'
			}
		],
		responses: {
			'200': {
				description: 'Tournament stats for user',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								amount_wins: { type: 'integer' },
								amount_losts: { type: 'integer' },
								total_score: { type: 'integer' }
							},
							example: {
								amount_wins: 7,
								amount_losts: 5,
								total_score: 70
							}
						}
					}
				}
			},
			'404': {
				description: 'User not found'
			}
		},
		tags: ['Statistics']
	}
};

export const gh_stats_api_paths: OpenAPIV3.PathsObject = {
	'/v1/stats/global/{user_id}': getGlobalStatsPath,
	'/v1/stats/only_1vs1/{user_id}': getOnly1vs1StatsPath,
	'/v1/stats/only_tournaments/{user_id}': getOnlyTournamentStatsPath,
};
