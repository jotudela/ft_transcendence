// User API paths for OpenAPI documentation
import { OpenAPIV3 } from 'openapi-types';

export const createUserPath: OpenAPIV3.PathItemObject = {
	post: {
		summary: 'Create user',
		description: 'Creates a new user. `created_at` and `updated_at` are handled automatically by SQLite.',
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
							required: ['username', 'password', 'email'],
							properties: {
								username: { type: 'string' },
								username_in_tournaments: { type: 'string' }, 
								password: { type: 'string' },
								email: { type: 'string' },
							},
							example: {
								username: 'Happy_poem',
								username_in_tournaments: 'Happy_poem_tourney', 
								password: 'securepassword',
								email: 'Happy_poem2@example.com',
							}
					},
				},
			},
		},
		responses: {
			'200': {
				description: 'User created',
				content: {
					'application/json': {
						schema: {
							type: 'object',
									properties: {
										id: { type: 'integer' },
										username: { type: 'string' },
										username_in_tournaments: { type: 'string' }, 
										email: { type: 'string' },
									},
									example: {
										id: 1,
										username: 'Happy_poem',
										username_in_tournaments: 'Happy_poem_tourney', 
										email: 'Happy_poem2@example.com',
									}
						},
					},
				},
			},
		},
		tags: ['Users'],
	},
};

export const getAllUsersPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get all users',
		description: 'Returns a list of all users.',
		responses: {
			'200': {
				description: 'List of users',
				content: {
					'application/json': {
						schema: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									id: { type: 'integer' },
									username: { type: 'string' },
									username_in_tournaments: { type: 'string' }, 
									email: { type: 'string' },
									is_bot: { type: 'boolean' },
								},
								example: {
									id: 1,
									username: 'Happy_poem',
									username_in_tournaments: 'Happy_poem_tourney', 
									email: 'Happy_poem2@example.com',
									is_bot: false
								}
							},
						},
					},
				},
			},
		},
		tags: ['Users'],
	},
};

export const userByIdPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get user by ID',
		description: 'Returns a user by their ID.',
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'integer' },
			},
		],
		responses: {
			'200': {
				description: 'User found',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								id: { type: 'integer' },
								username: { type: 'string' },
								username_in_tournaments: { type: 'string' }, 
								password: { type: 'string' },
								email: { type: 'string' },
								is_bot: { type: 'boolean' },
							},
							example: {
								id: 1,
								username: 'Happy_poem',
								username_in_tournaments: 'Happy_poem_tourney', 
								password: 'securepassword',
								email: 'Happy_poem2@example.com',
								is_bot: false
							}
						},
					},
				},
			},
		},
		tags: ['Users'],
	},
	put: {
		summary: 'Update user by ID',
		description: 'Updates a user by their ID. `updated_at` is handled automatically by SQLite.',
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'integer' },
			},
		],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							username: { type: 'string' },
							username_in_tournaments: { type: 'string' }, 
							password: { type: 'string' },
							email: { type: 'string' },
							is_bot: { type: 'boolean' },
						},
						example: {
							username: 'Updated_poem',
							username_in_tournaments: 'Updated_poem_tourney', 
							password: 'securepassword',
							email: 'updated_poem@example.com',
							is_bot: true
						}
					},
				},
			},
		},
		responses: {
			'200': {
				description: 'User updated',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								id: { type: 'integer' },
								username: { type: 'string' },
								username_in_tournaments: { type: 'string' }, 
								password: { type: 'string' },
								email: { type: 'string' },
								is_bot: { type: 'boolean' },
							},
							example: {
								id: 1,
								username: 'Updated_poem',
								username_in_tournaments: 'Updated_poem_tourney', 
								password: 'securepassword',
								email: 'updated_poem@example.com',
								is_bot: true
							}
						},
					},
				},
			},
		},
		tags: ['Users'],
	},
	delete: {
		summary: 'Delete user by ID',
		description: 'Deletes a user by their ID.',
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'integer' },
			},
		],
		responses: {
			'200': {
				description: 'User deleted',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								success: { type: 'boolean' },
							},
							example: {
								success: true
							}
						},
					},
				},
			},
		},
		tags: ['Users'],
	},
};

export const userExistsByIdPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Check if user exists by ID',
		description: 'Returns true if a user exists with the given ID.',
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'integer' },
			},
		],
		responses: {
			'200': {
				description: 'User existence check',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								exists: { type: 'boolean' },
							},
							example: {
								exists: true
							}
						},
					},
				},
			},
		},
		tags: ['Users'],
	},
};

export const updateUserByTypePath: OpenAPIV3.PathItemObject = {
	put: {
		summary: 'Update user field by type and ID',
		description: 'Updates a specific field of a user by their ID. The `types` parameter determines which field to update.',
		parameters: [
			{
				name: 'types',
				in: 'path',
				required: true,
				schema: {
					type: 'string',
					enum: ['username', 'password', 'email', 'username_in_tournaments', 'sub', 'two_fa_secret', 'is_fa_enabled'],
				},
			},
			{
				name: 'user_id',
				in: 'path',
				required: true,
				schema: { type: 'integer' },
			},
		],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						required: ['data'],
						properties: {
							data: { type: 'string' },
						},
						example: {
							data: 'test',
						},
					},
				},
			},
		},
		responses: {
			'200': {
				description: 'User field updated',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								msg: { type: 'string' },
							},
							example: {
								msg: 'User updated',
							},
						},
					},
				},
			},
			'404': {
				description: 'User not found',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								msg: { type: 'string' },
							},
							example: {
								msg: 'User not found.',
							},
						},
					},
				},
			},
			'409': {
				description: 'Conflict - Data already exists',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								msg: { type: 'string' },
							},
							example: {
								msg: 'data already in db',
							},
						},
					},
				},
			},
			'500': {
				description: 'Internal server error',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								msg: { type: 'string' },
							},
							example: {
								msg: 'Internal server error',
							},
						},
					},
				},
			},
		},
		tags: ['Users'],
	},
};

export const userApiPaths: OpenAPIV3.PathsObject = {
	'/v1/users': createUserPath,
	'/v1/users/all': getAllUsersPath,
	'/v1/users/{id}': userByIdPath,
	'/v1/users/exists/{id}': userExistsByIdPath,
	'/v1/users/{types}/{user_id}': updateUserByTypePath,
};
