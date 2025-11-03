import { FastifyRequest, FastifyReply } from 'fastify';
import { friends_model } from './models';
import { IncomeFriendRequest, UpdateIncomeFriendRequest } from '../interfaces';
import { f_logic } from './logic';
import { users_model } from '../../users/v1/models';

// Create a new friend request
async function handlerAddFriendRequest(request: FastifyRequest<{ Body: IncomeFriendRequest }>, reply: FastifyReply, db: any) {
    try {
		if (!(await f_logic.IsPostPayloadCorrect(db, request.body)))
			return reply.code(400).send({ error: "payload fail at parsing" });
        const resPost = await friends_model.addFriendRequest(db, request.body);
		if (!resPost.lastID)
			return reply.code(400).send({ error: "failed to insert request frienship" });
        reply.code(201).send({ id: resPost.lastID });
    } catch (err) {
        console.error(err);
        reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
}

// Get all friendships related to one single user, filtered by status (status is passed as argument)
async function handlerGetAllFriendshipsByUserIdAndStatus(
    request: FastifyRequest<{ Params: { user_id: string } }>,
    reply: FastifyReply,
    db: any,
    status: 'pending' | 'accepted' | 'rejected' | 'all'
) {
    try {
        const id = Number(request.params.user_id);
        if (!(await users_model.getUserById(db, id)))
            return reply.code(404).send({ error: "failed at parsing" });
        if (status == 'all') {
            const resAcceptedfriendships = await friends_model.getAllFriendshipsByUserId(db, id);
            return reply.send(resAcceptedfriendships);
        }
        const friendships = await friends_model.getAllFriendshipsByUserIdAndStatus(db, id, status);
        reply.send(friendships);
    } catch (err) {
        console.error(err);
        reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
}

// Get all status friendships by user_id
async function handlerGetAllFriendshipsByUserId(request: FastifyRequest<{ Params: { user_id: string } }>, reply: FastifyReply, db: any) {
    try {
        const id =  Number(request.params.user_id);
        if (!(await users_model.getUserById(db, id)))
            return reply.code(404).send({ error: "failed at parsing" }); 
        const resAcceptedfriendships = await friends_model.getAllFriendshipsByUserId(db, id);
        reply.send(resAcceptedfriendships);
    } catch (err) {
        console.error(err);
        reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
}


async function handlerGetFriendshipById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply, db: any) {
    try {
        const friendship = await friends_model.getFriendshipById(db, Number(request.params.id));
        if (!friendship)
            return reply.code(404).send({ error: "Friendship not found" });
        reply.send(friendship);
    } catch (err) {
        console.error(err);
        reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
}

// Update friendship status (accept/reject)
async function handlerUpdateFriendshipStatus(request: FastifyRequest<{ Body: UpdateIncomeFriendRequest }>, reply: FastifyReply, db: any) {
    try {
        if (!(await f_logic.IsUpdatePayloadCorrect(db, request.body)))
            return reply.code(400).send({ error: "payload fail at parsing" });

        const resUpdatePayload = await f_logic.createUpdatePayload(db, request.body);
        if (!resUpdatePayload)
            return reply.code(404).send({ error: "Friendship not found" });

        await friends_model.updateFriendshipStatus(db, resUpdatePayload);
        reply.send({ msg: "Friendship updated" });
    } catch (err) {
        console.error(err);
        reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
}

// Delete friendship by user ids
async function handlerDeleteFriendshipByUserIds(request: FastifyRequest<{ Body: IncomeFriendRequest }>, reply: FastifyReply, db: any) {
    try {
        if (!(await friends_model.getByFriendship(db, request.body)))
			return reply.code(400).send({ error: "friendship not founded in DB" });
        await friends_model.deleteFriendshipByUserIds(db, request.body);
        reply.send({ success: true });
    } catch (err) {
        console.error(err);
        reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
}

// Delete friendship by id
async function handlerDeleteFriendshipById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply, db: any) {
    try {
        const id = Number(request.params.id);
        if (!(await friends_model.getFriendshipById(db, id)))
			return reply.code(400).send({ error: "friendship not founded in DB" });
        await friends_model.deleteFriendshipById(db, id);
        reply.send({ success: true });
    } catch (err) {
        console.error(err);
        reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
}

export const friends_handlers = {
	handlerAddFriendRequest,
	handlerGetAllFriendshipsByUserIdAndStatus,
	handlerGetFriendshipById,
	handlerUpdateFriendshipStatus,
	handlerDeleteFriendshipByUserIds,
	handlerDeleteFriendshipById,
    handlerGetAllFriendshipsByUserId,
}