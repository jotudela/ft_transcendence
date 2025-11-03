import { Tournament, TournamentPayload } from '../interfaces';
import { users_model } from '../../users/v1/models';
import { games_history_model } from '../../games_history/v1/models' 

function extractUserIdsFromGamesHistory(t: Tournament): { arr_user_ids: (number)[]} {
	const arr_user_ids = [
		t.first_position_user_id_1 ?? null,
		t.first_position_user_id_2 ?? null,
		t.second_position_user_id_1 ?? null,
		t.second_position_user_id_2 ?? null,
		t.thirth_position_user_id_1 ?? null,
		t.thirth_position_user_id_2 ?? null,
		t.fourth_position_user_id_1 ?? null,
		t.fourth_position_user_id_2 ?? null,
		t.winner_user_id_1 ?? null,
		t.winner_user_id_2 ?? null
	].filter((id): id is number => id !== null && id !== undefined);
	return { arr_user_ids};
}

function areUsersIdPresentInPayload(payload: TournamentPayload): boolean {
	const t = payload.tournament;
	const games = payload.games_history;

	const tournamentUserIds = [
		t.first_position_user_id_1,
		t.first_position_user_id_2,
		t.second_position_user_id_1,
		t.second_position_user_id_2,
		t.thirth_position_user_id_1,
		t.thirth_position_user_id_2,
		t.fourth_position_user_id_1,
		t.fourth_position_user_id_2,
		t.winner_user_id_1,
		t.winner_user_id_2,
	].filter((id): id is number => id !== null && id !== undefined);	// Collect all user ids from tournament positions (ignore nulls)
	
	const gameUserIds = new Set<number>();								// REMINDER : "set" store unique values. No diplicates.
	for (const game of games) {
		[
			game.team_1_player_user_id_1,
			game.team_1_player_user_id_2,
			game.team_2_player_user_id_3,
			game.team_2_player_user_id_4,
			game.winner_user_id_1,
			game.winner_user_id_2,
		].forEach((id) => {												// Collect all user ids from games (ignore nulls)
			if (typeof id === 'number') gameUserIds.add(id);
		});
	}

	// Check every tournament user id is present in games
	let areAllPresent = tournamentUserIds.every(id => gameUserIds.has(id));
	if (!areAllPresent)
		return false;
	return true;
}

function areTypesAllTheSame(payload: TournamentPayload): boolean {

	let areAllTypesEqual = payload.games_history.every(game => game.game_type === payload.tournament.tournament_type);
	if (!areAllTypesEqual)
		return false;
	return true;
}

async function handlerIsPayloadCorrect( payload: TournamentPayload, db: any ): Promise<boolean> {
	// REMINDER: check in user_ids in games are checked in "game history" feature.
	// Will check if users in payload.tournament exists in DB
	const arrTournamentUserIds = extractUserIdsFromGamesHistory(payload.tournament);
	if (!(await users_model.areUserIdsExist(db, arrTournamentUserIds.arr_user_ids)))
		return false;

	if (!areUsersIdPresentInPayload(payload))
		return false;

	if (!areTypesAllTheSame(payload))
		return false;

	return true;
}

//-----------------------------------



export const t_logic = {
	handlerIsPayloadCorrect,
};
