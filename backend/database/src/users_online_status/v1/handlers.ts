import { FastifyReply, FastifyRequest } from 'fastify';
import { uos_models } from './models';
import { Database } from 'sqlite';
import { IAddUos } from '../interfaces';
import { users_model } from '../../users/v1/models'

// U.O.S = User Online Status

async function handlerAddUos(
	request: FastifyRequest<{ Body: IAddUos; Params: { user_id: string } }>,
	reply: FastifyReply,
	db: Database
) {
	try {
		const user_id = Number(request.params.user_id);
		const status = request.body.status;
		
		const resUserExists = await users_model.isUserIdExists(db, user_id);
		if (!resUserExists)
			return reply.status(404).send({ error: 'User not found.' });

		const resLatestStatus = await uos_models.getLatestStatusByUserId(db, user_id);

		if (resLatestStatus && resLatestStatus.status === status) {
			return reply.status(400).send({ error: 'Status is the same as the latest status.' });
		}

		const resAdd = await uos_models.addUos(db, { user_id, status });
		if (!resAdd)
			return reply.status(500).send({ error: 'UOS: error while adding data please try again.' });

		reply.code(201).send();
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error('Unknown error occurred');
		}
		reply.status(500).send({ error: 'Internal Server Error' });
	}
}

async function handlerGetUosById(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
	db: Database
) {
	try {
		const id = Number(request.params.id);
		const result = await uos_models.getUosById(db, id);

		if (!result) {
			reply.code(404).send({ message: 'Not Found' });
			return;
		}

		reply.send(result);
	} catch (error) {
		if (error instanceof Error)
			console.error(error.message);
		reply.status(500).send({ error: 'Internal Server Error' });
	}
}

async function handlerDeleteUosById(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
	db: Database
) {
	try {
		const id = Number(request.params.id);
		await uos_models.deleteUosStatus(db, id);
		reply.code(204).send();
	} catch (error) {
		if (error instanceof Error)
			console.error(error.message);
		reply.status(500).send({ error: 'Internal Server Error' });
	}
}

async function handlerGetAllLatestStatuses(
	request: FastifyRequest,
	reply: FastifyReply,
	db: Database
) {
	try {
		const results = await uos_models.getAllLatestStatuses(db);

		if (!results || results.length === 0) {
			reply.code(500).send({ message: 'No statuses found' });
			return;
		}

		reply.send(results);
	} catch (error) {
		if (error instanceof Error)
			console.error(error.message);
		reply.status(500).send({ error: 'Internal Server Error' });
	}
}

async function handlerGetLatestStatusesForUserIds(
	request: FastifyRequest<{ Body: { user_ids: number[] } }>,
	reply: FastifyReply,
	db: Database
) {
	try {
		const user_ids = request.body.user_ids;

		if (!Array.isArray(user_ids) || user_ids.length === 0) {
			return reply.status(400).send({ error: 'Invalid or empty user_ids array.' });
		}

		const results = await uos_models.getLatestStatusesForUserIds(db, user_ids);

		if (!results || results.length === 0) {
			return reply.status(404).send({ message: 'No statuses found for the provided user_ids.' });
		}

		reply.send(results);
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error('Unknown error occurred');
		}
		reply.status(500).send({ error: 'Internal Server Error' });
	}
}

export const uos_handlers = {
	handlerAddUos,
	handlerGetUosById,
	handlerDeleteUosById,
	handlerGetAllLatestStatuses,
	handlerGetLatestStatusesForUserIds,
};