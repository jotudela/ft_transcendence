import { GamesHistory, ArrGamesHistory } from '../interfaces';
import { users_model } from '../../users/v1/models';
import { games_history_model } from './models';

// Will check the payload
function isGamesHistorySame(a: GamesHistory, b: GamesHistory): boolean {
	return (
		a.tournament_id === b.tournament_id &&
		a.game_type === b.game_type &&
		a.team_1_player_user_id_1 === b.team_1_player_user_id_1 &&
		a.team_1_player_user_id_2 === b.team_1_player_user_id_2 &&
		a.team_2_player_user_id_3 === b.team_2_player_user_id_3 &&
		a.team_2_player_user_id_4 === b.team_2_player_user_id_4 &&
		a.started_at === b.started_at &&
		a.ended_at === b.ended_at &&
		a.score_team_1 === b.score_team_1 &&
		a.score_team_2 === b.score_team_2 &&
		a.winner_user_id_1 === b.winner_user_id_1 &&
		a.winner_user_id_2 === b.winner_user_id_2
	);
}

// ---------------
// --- Parsing ---
// ---------------

function extractUserIdsFromGamesHistory(game: GamesHistory): { arr_players: (number | null)[], arr_winners: (number | null)[] } {
	const arr_players = [
		game.team_1_player_user_id_1 ?? null,
		game.team_1_player_user_id_2 ?? null,
		game.team_2_player_user_id_3 ?? null,
		game.team_2_player_user_id_4 ?? null
	];
	const arr_winners = [
		game.winner_user_id_1 ?? null,
		game.winner_user_id_2 ?? null
	];
	return { arr_players, arr_winners };
}

function checkUserIdsInPayload(payload: GamesHistory): boolean {
	const { arr_players, arr_winners } = extractUserIdsFromGamesHistory(payload);

	// Clean nulls
	const players = arr_players.filter((id): id is number => id !== null);
	const winners = arr_winners.filter((id): id is number => id !== null);

	// Only 2 or 4 players allowed
	if (!(players.length === 2 || players.length === 4)) return false;

	// If 2 players, only 1 winner; if 4 players, only 2 winners
	if ((players.length === 2 && winners.length !== 1) ||
		(players.length === 4 && winners.length !== 2)) {
		return false;
	}

	// All winners must be present in players
	for (const winnerId of winners) {
		if (!players.includes(winnerId)) return false;
	}

	return true;
}

// -----------------------------------
// --- INSERT arr of Games History ---
// -----------------------------------
// Is going to be needed when we want to POST a tournament with all the games history. (always 3).
function isTournamentTypeAndGameTypeSame(payload: ArrGamesHistory, tournament_type: '1vs1' | '2vs2'): boolean {
	if (!payload.games_history || payload.games_history.length !== 3)
		return false;

	for (const each_game of payload.games_history) {
		if (each_game.game_type !== tournament_type) {
			return false;
		}
	}

	return true;
}

/**
 * Insert one Games payload into the DB and return its ID.
 * Returns -1 on error or duplicate.
 * REMINDER: These function is the same as the "handlerAddGame" but made into "logic type". Because i need it in "addGamesHistoryBatch" it was really messy to work otherwise.
 */
async function addOneGameWithTournamentId(
	game: GamesHistory,
	db: any,
	tournamentId: Number
): Promise<number> {
	try {
		if (!checkUserIdsInPayload(game))
			return -1;

		const arr_to_check_userIds = extractUserIdsFromGamesHistory(game);
		if (!(await users_model.areUserIdsExist(db, arr_to_check_userIds.arr_players))) {
			return -1;
		}

		const allGames = await games_history_model.getAllGamesHistory(db);
		const isDuplicate = allGames.some((g: GamesHistory) => isGamesHistorySame(g, game));
		if (isDuplicate) {
			return -1;
		}

		const insertResult = await games_history_model.addGamesHistoryWithTournamentId(db, game, tournamentId);
		if (typeof insertResult.lastID === 'number') {
			return insertResult.lastID;
		}
		return -1;
	} catch {
		return -1;
	}
}


//	Will add an array of "games". In tournament we have 3 games to add into the DB related to one "tournament_id".
async function addGamesHistoryBatch(
	payload: ArrGamesHistory,
	tournament_type: '1vs1' | '2vs2',
	db: any,
	tournamentId: Number	
): Promise<boolean> {
	if (!isTournamentTypeAndGameTypeSame(payload, tournament_type))
		return false;

	const insertedIds: number[] = [];

	for (const game of payload.games_history) {
		const id = await addOneGameWithTournamentId(game, db, tournamentId);
		if (id > 0) {
			insertedIds.push(id);
		} else if (id === -1) {														// REMINDER: In case there is a problem while INSERTING each game. We need to erase all previous added payloads before quiting the funciton.
			for (const insertedId of insertedIds) {
				await games_history_model.deleteGamesHistoryById(db, insertedId);
			}
			return false;
		}
	}
	return true;
}

// DELETE arr of Games History 
async function deleteGamesHistoryByArrIds(db: any, ids: number[]): Promise<void> {
	for (const each_id of ids) {
		await games_history_model.deleteGamesHistoryById(db, each_id);
	}
}

async function handlerGetDeleteGamesHistoryIdsByTournamentId(db: any, tournament_id: number): Promise<boolean> {
	const res_games = await games_history_model.getGamesHistoryByTournamentId(db, tournament_id);
	const arr_ids: number[] = [];

	for (const each_game of res_games) {
		arr_ids.push(each_game.id);
	}

	// normally 1 tournament has 3 games. But if there is a problem 
	if (arr_ids.length === 3) {
		const res = await games_history_model.deleteGamesHistoryBy3Ids(db, arr_ids as [number, number, number]);
		if (!res || res.changes !== 3)
			return false;
		return true;
	} else {
		let allDeleted = true;
		for (const id of arr_ids) {
			const res = await games_history_model.deleteGamesHistoryById(db, id);
			if (!res || res.changes === 0) {
				allDeleted = false;
			}
		}
		return allDeleted;
	}
}

export const gh_logic = {
	isGamesHistorySame,
	extractUserIdsFromGamesHistory,
	checkUserIdsInPayload,
};

export const gh_t_logic = {
	addGamesHistoryBatch,
	deleteGamesHistoryByArrIds,
	handlerGetDeleteGamesHistoryIdsByTournamentId,
}