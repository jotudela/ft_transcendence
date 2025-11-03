import { OpenAPIV3 } from 'openapi-types';
import { userApiPaths } from './src/users/v1/doc_users';
import { friendshipsApiPaths } from './src/friendships/v1/doc_friendships';
import {
	gamesHistoryApiPaths,
	gamesHistorySchemas
} from './src/games_history/v1/doc_games_history';
import { gh_stats_api_paths } from './src/gh_stats/v1/doc_gh_stats';
import { tournamentsApiPaths } from './src/tournamentes/v1/doc_tournaments';

export const userApiDoc: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'API DB',
    version: '1.0.0',
    description: 'API documentation that will handle the Database in SQLite',
  },
  servers: [
    {
      url: 'http://localhost:3020',
      description: 'Local server',
    },
  ],
  tags: [
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Friendships', description: 'Friendship relationships management endpoints between users' },
    {
      name: 'Statistics',
      description: 'Endpoints for user game statistics "global", "1vs1", "tournaments"'
    },
    { name: 'Tournaments', description: '4 players, 3 "1vs1" games. 1 winner, for stats check the feature "Statistics"' },
    { name: 'Game History', description: 'Two games types "1vs1" (1winner) or "2vs2" (2 winners), depending on the type' },
  ],
  paths: {
    ...userApiPaths,
    ...friendshipsApiPaths,
		...gamesHistoryApiPaths,
		...gh_stats_api_paths,
		...tournamentsApiPaths
  },
  components: {
    schemas: {
			...gamesHistorySchemas
		}
  },
};

export const apiPaths = {
	...userApiPaths,
	...friendshipsApiPaths,
	...gh_stats_api_paths,
	...tournamentsApiPaths,
};