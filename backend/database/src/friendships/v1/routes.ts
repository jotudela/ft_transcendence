import { FastifyInstance } from 'fastify';
import { friends_handlers } from './handlers';
import { friends_schemas } from './parse_schemas';
import { global_schemas } from '../../global_parsing_schemas';
import { IncomeFriendRequest, UpdateIncomeFriendRequest } from '../interfaces';

export default async function friendsV1Routes(fastify: FastifyInstance, opts: any) {
	const db = opts.db;

	// Create a new friend request
	fastify.post<{ Body: IncomeFriendRequest }>('/add', {
		schema: { body: friends_schemas.friendRequestCreateSchema }
	}, async (request, reply) => {
		await friends_handlers.handlerAddFriendRequest(request, reply, db);
	});

	// Get all friends for a user ("accepted" only)
	fastify.get<{ Params: { user_id: string } }>('/all_requests/accepted/user_id/:user_id', {
		schema: { params: global_schemas.userIdParamSchema }
	}, async (request, reply) => {
		await friends_handlers.handlerGetAllFriendshipsByUserIdAndStatus(request, reply, db, 'accepted');
	});

	// Get all friends for a user ("pending" only)
	fastify.get<{ Params: { user_id: string } }>('/all_requests/pending/user_id/:user_id', {
		schema: { params: global_schemas.userIdParamSchema }
	}, async (request, reply) => {
		await friends_handlers.handlerGetAllFriendshipsByUserIdAndStatus(request, reply, db, 'pending');
	});

	// Get all friends for a user ("rejected" only)
	fastify.get<{ Params: { user_id: string } }>('/all_requests/rejected/user_id/:user_id', {
		schema: { params: global_schemas.userIdParamSchema }
	}, async (request, reply) => {
		await friends_handlers.handlerGetAllFriendshipsByUserIdAndStatus(request, reply, db, 'rejected');
	});

	// Get all friends for a user (accepted only)
	fastify.get<{ Params: { user_id: string } }>('/all_requests/all/user_id/:user_id', {
		schema: { params: global_schemas.userIdParamSchema }
	}, async (request, reply) => {
		await friends_handlers.handlerGetAllFriendshipsByUserIdAndStatus(request, reply, db, 'all');
	});

	// Get a specific friendship by id
	fastify.get<{ Params: { id: string } }>('/by_id/:id', {
		schema: { params: global_schemas.idParamSchema }
	}, async (request, reply) => {
		await friends_handlers.handlerGetFriendshipById(request, reply, db);
	});

	// Update friendship status (accept/reject)
	fastify.put<{ Body: UpdateIncomeFriendRequest }>('/update_status', {
		schema: { body: friends_schemas.friendRequestUpdateSchema }
	}, async (request, reply) => {
		await friends_handlers.handlerUpdateFriendshipStatus(request, reply, db);
	});

	// Delete friendship by user ids
	fastify.delete<{ Body: IncomeFriendRequest }>('/by_friendship_users_id', {
		schema: { body: friends_schemas.friendRequestDeleteSchema }
	}, async (request, reply) => {
		await friends_handlers.handlerDeleteFriendshipByUserIds(request, reply, db);
	});

	// Delete friendship by id
	fastify.delete<{ Params: { id: string } }>('/by_id/:id', {
		schema: { params: global_schemas.idParamSchema }
	}, async (request, reply) => {
		await friends_handlers.handlerDeleteFriendshipById(request, reply, db);
	});
};


