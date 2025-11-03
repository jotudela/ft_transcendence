import { Database } from "sqlite";
import { GamesHistory } from "../interfaces";

async function addGamesHistory(db: Database, game: GamesHistory) {
	return await db.run(
		`INSERT INTO games_history (
			tournament_id, game_type, team_1_player_user_id_1, team_1_player_user_id_2, team_2_player_user_id_3, team_2_player_user_id_4,
			started_at, ended_at, score_team_1, score_team_2, winner_user_id_1, winner_user_id_2
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		game.tournament_id,
		game.game_type,
		game.team_1_player_user_id_1,
		game.team_1_player_user_id_2,
		game.team_2_player_user_id_3,
		game.team_2_player_user_id_4,
		game.started_at,
		game.ended_at,
		game.score_team_1,
		game.score_team_2,
		game.winner_user_id_1,
		game.winner_user_id_2
	);
}

async function addGamesHistoryWithTournamentId(db: Database, game: GamesHistory, tournamentId: Number) {
	return await db.run(
		`INSERT INTO games_history (
			tournament_id, game_type, team_1_player_user_id_1, team_1_player_user_id_2, team_2_player_user_id_3, team_2_player_user_id_4,
			started_at, ended_at, score_team_1, score_team_2, winner_user_id_1, winner_user_id_2
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		tournamentId,
		game.game_type,
		game.team_1_player_user_id_1,
		game.team_1_player_user_id_2,
		game.team_2_player_user_id_3,
		game.team_2_player_user_id_4,
		game.started_at,
		game.ended_at,
		game.score_team_1,
		game.score_team_2,
		game.winner_user_id_1,
		game.winner_user_id_2
	);
}

async function getAllGamesHistory(db: Database) {
	return await db.all("SELECT * FROM games_history");
}

async function getGamesHistoryById(db: Database, gh_id: number) {
	return await db.get("SELECT * FROM games_history WHERE id = ?", gh_id);
}

// Get all games where the user_id appears in any player slot
async function getAllGamesByUserId(db: Database, user_id: number) {
    return await db.all(
        `SELECT * FROM games_history
        WHERE 
            team_1_player_user_id_1 = ?
            OR team_1_player_user_id_2 = ?
            OR team_2_player_user_id_3 = ?
            OR team_2_player_user_id_4 = ?
        ORDER BY created_at DESC`,
        user_id, user_id, user_id, user_id
    );
}

//-------------------- related to the same endpoint get all win/loses by user_id

async function updateGamesHistoryById(db: Database, gh_id: number, game: GamesHistory) {
	return await db.run(
		`UPDATE games_history SET
			tournament_id = ?,
			game_type = ?,
			team_1_player_user_id_1 = ?,
			team_1_player_user_id_2 = ?,
			team_2_player_user_id_3 = ?,
			team_2_player_user_id_4 = ?,
			started_at = ?,
			ended_at = ?,
			score_team_1 = ?,
			score_team_2 = ?,
			winner_user_id_1 = ?,
			winner_user_id_2 = ?
		WHERE id = ?`,
		game.tournament_id,
		game.game_type,
		game.team_1_player_user_id_1,
		game.team_1_player_user_id_2,
		game.team_2_player_user_id_3,
		game.team_2_player_user_id_4,
		game.started_at,
		game.ended_at,
		game.score_team_1,
		game.score_team_2,
		game.winner_user_id_1,
		game.winner_user_id_2,
		gh_id
	);
}



// Get total score for a user_id across all games
//* REMINDER : these model will total amount of scores (even if the user lost the game)
async function getGlobalTotalScoreByUserId(db: Database, user_id: number): Promise<number> {
    const games = await db.all(
        `SELECT 
            team_1_player_user_id_1, team_1_player_user_id_2,
            team_2_player_user_id_3, team_2_player_user_id_4,
            score_team_1, score_team_2
        FROM games_history
        WHERE 
            team_1_player_user_id_1 = :uid OR
            team_1_player_user_id_2 = :uid OR
            team_2_player_user_id_3 = :uid OR
            team_2_player_user_id_4 = :uid
        `,
        { ':uid': user_id }
    );
    let total = 0;
    for (const g of games) {
        if (g.team_1_player_user_id_1 === user_id || g.team_1_player_user_id_2 === user_id) {
            total += g.score_team_1 ?? 0;
        }
        if (g.team_2_player_user_id_3 === user_id || g.team_2_player_user_id_4 === user_id) {
            total += g.score_team_2 ?? 0;
        }
    }
    return total;
}

async function getGamesHistoryByTournamentId(db: Database, tournament_id: number) {
	return await db.all(
		"SELECT * FROM games_history WHERE tournament_id = ? ORDER BY id ASC",
		tournament_id
	);
}


async function deleteGamesHistoryById(db: Database, gh_id: number) {
	return await db.run("DELETE FROM games_history WHERE id = ?", gh_id);
}


async function deleteGamesHistoryBy3Ids(db: Database, arr_ids: [number, number, number]) {
    return await db.run(
        `DELETE FROM games_history WHERE id IN (?,?,?)`,
        arr_ids[0] ?? null, arr_ids[1] ?? null, arr_ids[2] ?? null
    );
}

export const games_history_model = {
	addGamesHistory,
	addGamesHistoryWithTournamentId,
	getAllGamesHistory,
	getGamesHistoryById,
	updateGamesHistoryById,
	getAllGamesByUserId,
	getGamesHistoryByTournamentId,
	deleteGamesHistoryById,
	deleteGamesHistoryBy3Ids,
};
