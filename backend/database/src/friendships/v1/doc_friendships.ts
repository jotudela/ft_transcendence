import { OpenAPIV3 } from 'openapi-types';

// Create a new friend request
export const createFriendRequestPath: OpenAPIV3.PathItemObject = {
	post: {
		summary: 'Create a new friend request',
		description: 'Creates a new friend request between two users.',
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						required: ['user_id_1', 'user_id_2', 'requested_by'],
						properties: {
							user_id_1: { type: 'integer' },
							user_id_2: { type: 'integer' },
							requested_by: { type: 'integer' },
						},
						example: {
							user_id_1: 1,
							user_id_2: 6,
							requested_by: 1
						}
					}
				}
			}
		},
		responses: {
			'201': {
				description: 'Friend request created',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: { id: { type: 'integer' } },
							example: { id: 5 }
						}
					}
				}
			},
			'400': {
				description: 'Invalid payload or failed to create request',
				content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } }
			}
		},
		tags: ['Friendships']
	}
};

// Get all friendships by user_id and status
function makeGetFriendshipsByStatusPath(status: string): OpenAPIV3.PathItemObject {
	return {
		get: {
			summary: `Get all "${status}" friendships by user_id`,
			description: `Returns all friendships for a user with status "${status}".`,
			parameters: [
				{ name: 'user_id', in: 'path', required: true, schema: { type: 'integer' } }
			],
			responses: {
				'200': {
					description: `List of "${status}" friendships`,
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										id: { type: 'integer' },
										user_id_min: { type: 'integer' },
										user_id_max: { type: 'integer' },
										requested_by: { type: 'integer' },
										status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] }
									}
								}
							}
						}
					}
				}
			},
			tags: ['Friendships']
		}
	};
}

export const getAcceptedFriendshipsPath = makeGetFriendshipsByStatusPath('accepted');
export const getPendingFriendshipsPath = makeGetFriendshipsByStatusPath('pending');
export const getRejectedFriendshipsPath = makeGetFriendshipsByStatusPath('rejected');

// Get all friendships by user_id (all statuses)
export const getAllFriendshipsPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get all friendships by user_id',
		description: 'Returns all friendships for a user (all statuses).',
		parameters: [
			{ name: 'user_id', in: 'path', required: true, schema: { type: 'integer' } }
		],
		responses: {
			'200': {
				description: 'List of all friendships',
				content: {
					'application/json': {
						schema: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									id: { type: 'integer' },
									user_id_min: { type: 'integer' },
									user_id_max: { type: 'integer' },
									requested_by: { type: 'integer' },
									status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] }
								}
							}
						}
					}
				}
			}
		},
		tags: ['Friendships']
	}
};

// Get and Delete a specific friendship by id
export const friendshipByIdPath: OpenAPIV3.PathItemObject = {
	get: {
		summary: 'Get a specific friendship by id',
		description: 'Returns a friendship by its id.',
		parameters: [
			{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
		],
		responses: {
			'200': {
				description: 'Friendship found',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								id: { type: 'integer' },
								user_id_min: { type: 'integer' },
								user_id_max: { type: 'integer' },
								requested_by: { type: 'integer' },
								status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] }
							}
						}
					}
				}
			},
			'404': {
				description: 'Friendship not found',
				content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } }
			}
		},
		tags: ['Friendships']
	},
	delete: {
		summary: 'Delete friendship by id',
		description: 'Deletes a friendship by its id.',
		parameters: [
			{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
		],
		responses: {
			'200': {
				description: 'Friendship deleted',
				content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } }, example: { success: true } } } }
			},
			'400': {
				description: 'Friendship not found',
				content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } }
			}
		},
		tags: ['Friendships']
	}
};

// Update friendship status
export const updateFriendshipStatusPath: OpenAPIV3.PathItemObject = {
	put: {
		summary: 'Update friendship status',
		description: 'Updates the status of a friendship (accept/reject).',
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						required: ['id', 'status'],
						properties: {
							id: { type: 'integer' },
							status: { type: 'string', enum: ['accepted', 'rejected'] }
						},
						example: { id: 5, status: 'rejected' }
					}
				}
			}
		},
		responses: {
			'200': {
				description: 'Friendship updated',
				content: { 'application/json': { schema: { type: 'object', properties: { msg: { type: 'string' } }, example: { msg: 'Friendship updated' } } } }
			},
			'400': {
				description: 'Invalid payload or update failed',
				content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } }
			}
		},
		tags: ['Friendships']
	}
};

// Delete friendship by user ids
export const deleteFriendshipByUserIdsPath: OpenAPIV3.PathItemObject = {
	delete: {
		summary: 'Delete friendship by user ids',
		description: 'Deletes a friendship by the user ids.',
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						required: ['user_id_1', 'user_id_2'],
						properties: {
							user_id_1: { type: 'integer' },
							user_id_2: { type: 'integer' }
						},
						example: { user_id_1: 1, user_id_2: 3 }
					}
				}
			}
		},
		responses: {
			'200': {
				description: 'Friendship deleted',
				content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } }, example: { success: true } } } }
			},
			'400': {
				description: 'Friendship not found',
				content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } }
			}
		},
		tags: ['Friendships']
	}
};

export const friendshipsApiPaths: OpenAPIV3.PathsObject = {
	'/v1/friendships/add': createFriendRequestPath,
	'/v1/friendships/all_requests/accepted/user_id/{user_id}': getAcceptedFriendshipsPath,
	'/v1/friendships/all_requests/pending/user_id/{user_id}': getPendingFriendshipsPath,
	'/v1/friendships/all_requests/rejected/user_id/{user_id}': getRejectedFriendshipsPath,
	'/v1/friendships/all_requests/all/user_id/{user_id}': getAllFriendshipsPath,
	'/v1/friendships/by_id/{id}': friendshipByIdPath, // merged GET and DELETE here
	'/v1/friendships/update_status': updateFriendshipStatusPath,
	'/v1/friendships/by_friendship_users_id': deleteFriendshipByUserIdsPath,
};
