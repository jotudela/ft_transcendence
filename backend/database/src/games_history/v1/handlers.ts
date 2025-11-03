import { games_history_model } from './models';
import { GamesHistory } from '../interfaces';
import { gh_logic } from './logic';
import { users_model } from '../../users/v1/models';

// Add Game
async function handlerAddGame(request: { body: GamesHistory }, reply: any, db: any) {
	try {
		// Before INSERT we need to check if users id are valid, and payload has correct standar
		if (!gh_logic.checkUserIdsInPayload(request.body))
			return reply.status(400).send({ error: 'error in payload users id not good standar' });

		const arr_to_check_userIds = gh_logic.extractUserIdsFromGamesHistory(request.body);
		if (!(await users_model.areUserIdsExist(db, arr_to_check_userIds.arr_players))) {
			return reply.status(400).send({ error: 'Some user IDs do not exist in DB' });
		}

		// Check for duplicate/spam: look for an existing identical record
		const allGames = await games_history_model.getAllGamesHistory(db);
		const isDuplicate = allGames.some((g: GamesHistory) => gh_logic.isGamesHistorySame(g, request.body));
		if (isDuplicate) {
			return reply.status(409).send({ msg: 'payload already in Db, nothing to INSERT.' });
		}
		const insertResult = await games_history_model.addGamesHistory(db, request.body);
		if (typeof insertResult.lastID === 'number') {
			const game = await games_history_model.getGamesHistoryById(db, insertResult.lastID);
			if (game) {
				return reply.status(201).send(game);
			} else {
				return reply.status(500).send({ error: 'Game inserted but not found.' });
			}
		}
		return reply.status(400).send({ error: 'Game not inserted.' });
	} catch (err: any) {
		return reply.status(500).send({ error: 'Internal server error', details: err.message });
	}
}

// Get all games
async function handlerGetAllGames(request: any, reply: any, db: any) {
	try {
		const games = await games_history_model.getAllGamesHistory(db);
		reply.send(games);
	} catch (err: any) {
		reply.status(500).send({ error: 'Internal server error', details: err.message });
	}
}

// Get game by id
async function handlerGetGameById(request: any, reply: any, db: any) {
	try {
		const game = await games_history_model.getGamesHistoryById(db, Number(request.params.id));
		if (game) return reply.send(game);
		reply.status(404).send({ error: 'Game not found' });
	} catch (err: any) {
		reply.status(500).send({ error: 'Internal server error', details: err.message });
	}
}

// Will Get all games founded by user_id 
async function handlerGetAllGamesByUserId(request: { params: { user_id: string } }, reply: any, db: any) {
    const userId = Number(request.params.user_id);
    const userExists = await users_model.isUserIdExists(db, userId);
    if (!userExists) {
        return reply.status(404).send({ error: 'User not found.' });
    }
    const resGamesByUserId = await games_history_model.getAllGamesByUserId(db, userId);
    reply.status(200).send(resGamesByUserId);
}


// Update game by id
async function handlerUpdateGameById(request: { params: { id: string }, body: GamesHistory }, reply: any, db: any) {
	try {
		// Before INSERT we need to check if users id are valid, and payload has correct standar
		if (!gh_logic.checkUserIdsInPayload(request.body))
			return reply.status(400).send({ error: 'error in payload users id not good standar' });

		const arr_to_check_userIds = gh_logic.extractUserIdsFromGamesHistory(request.body);
		if (!(await users_model.areUserIdsExist(db, arr_to_check_userIds.arr_players))) {
			return reply.status(400).send({ error: 'Some user IDs do not exist in DB' });
		}

		const gameId = Number(request.params.id);
		const gameExists = await games_history_model.getGamesHistoryById(db, gameId);
		if (!gameExists) {
			return reply.status(404).send({ msg: 'Game not found.' });
		}
		if (gh_logic.isGamesHistorySame(gameExists, request.body)) {
			return reply.status(409).send({ msg: 'exact match founded in DB, nothing to update by GH_id.' });
		}
		await games_history_model.updateGamesHistoryById(db, gameId, request.body);
		const updatedGame = await games_history_model.getGamesHistoryById(db, gameId);
		if (updatedGame) {
			return reply.status(200).send(updatedGame);
		} else {
			return reply.status(500).send({ error: 'Game update failed.' });
		}
	} catch (err: any) {
		return reply.status(500).send({ error: 'Internal server error', details: err.message });
	}
}

// Delete game by id
async function handlerDeleteGameById(request: { params: { id: string } }, reply: any, db: any) {
	try {
		const gameId = Number(request.params.id);
		const gameExists = await games_history_model.getGamesHistoryById(db, gameId);
		if (!gameExists) {
			return reply.status(404).send({ error: 'Game not found.' });
		}
		await games_history_model.deleteGamesHistoryById(db, gameId);
		return reply.status(200).send();
	} catch (err: any) {
		return reply.status(500).send({ error: 'Internal server error', details: err.message });
	}
}

export const games_history_handlers = {
	handlerAddGame,
	handlerGetAllGames,
	handlerGetGameById,
	handlerUpdateGameById,
	handlerDeleteGameById,
	handlerGetAllGamesByUserId,
};
