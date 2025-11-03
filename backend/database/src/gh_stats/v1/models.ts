import { Database } from "sqlite";


//-------------------
//* Detailed feature
//-------------------

// will get all wins by user_id
async function getDetailedGlobalByUserId(user_id: number, db: Database) {
	const res = await db.all(
		`SELECT * FROM games_history
		WHERE (
			team_1_player_user_id_1 = :uid
			OR team_1_player_user_id_2 = :uid
			OR team_2_player_user_id_3 = :uid
			OR team_2_player_user_id_4 = :uid
		)
		ORDER BY created_at DESC`,
		{':uid': user_id}
	);
	return res;
}

async function getDetailedTournamentsByUserId(user_id: number, db: Database) {
	const res = await db.all(
		`SELECT * FROM games_history
		WHERE (
			team_1_player_user_id_1 = :uid
			OR team_1_player_user_id_2 = :uid
			OR team_2_player_user_id_3 = :uid
			OR team_2_player_user_id_4 = :uid
		)
		AND tournament_id IS NOT NULL
		ORDER BY created_at DESC`,
		{':uid': user_id}
	);
	return res;
}

async function getDetailedNoTournamentsByUserId(user_id: number, db: Database) {
	const res = await db.all(
		`SELECT * FROM games_history
		WHERE (
			team_1_player_user_id_1 = :uid
			OR team_1_player_user_id_2 = :uid
			OR team_2_player_user_id_3 = :uid
			OR team_2_player_user_id_4 = :uid
		)
		AND tournament_id IS NULL
		ORDER BY created_at DESC`,
		{':uid': user_id}
	);
	return res;
}



//---------------------------------------
//* Global "1vs1" and "tournament" stats
//---------------------------------------

// will get all wins by user_id
async function getGlobalAllWinsByUserId(db: Database, user_id: number) {
	const res = await db.all(
		`SELECT * FROM games_history
		WHERE winner_user_id_1 = :uid
		   OR winner_user_id_2 = :uid
		ORDER BY created_at DESC`,
		{':uid': user_id}
	);
	return res.length;
}


// REMINDER : "res" here is an array of obj gh [{gh}, {gh}, {gh}];
async function getGlobalAllLossesByUserId(db: Database, user_id: number) {
	const res = await db.all(
		`SELECT * FROM games_history
		WHERE (
			team_1_player_user_id_1 = :uid
			OR team_1_player_user_id_2 = :uid
			OR team_2_player_user_id_3 = :uid
			OR team_2_player_user_id_4 = :uid
		)
		AND winner_user_id_1 != :uid
		AND (winner_user_id_2 IS NULL OR winner_user_id_2 != :uid)
		ORDER BY created_at DESC`,
		{':uid': user_id}
	);
	return res.length;
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


//--------------------------------------------------------
//* Only related to "1vs1" not tournament related stats
//--------------------------------------------------------


// Only get wins by user_id where tournament_id IS NULL
async function getNoTournamentAllWinsByUserId(db: Database, user_id: number) {
	const res = await db.all(
		`SELECT * FROM games_history
		WHERE (winner_user_id_1 = :uid OR winner_user_id_2 = :uid)
		  AND tournament_id IS NULL
		ORDER BY created_at DESC`,
		{':uid': user_id}
	);
	return res.length;
}

// Only get losses by user_id where tournament_id IS NULL
async function getNoTournamentAllLossesByUserId(db: Database, user_id: number) {
	const res = await db.all(
		`SELECT * FROM games_history
		WHERE (
			team_1_player_user_id_1 = :uid
			OR team_1_player_user_id_2 = :uid
			OR team_2_player_user_id_3 = :uid
			OR team_2_player_user_id_4 = :uid
		)
		AND winner_user_id_1 != :uid
		AND (winner_user_id_2 IS NULL OR winner_user_id_2 != :uid)
		AND tournament_id IS NULL
		ORDER BY created_at DESC`,
		{':uid': user_id}
	);
	return res.length;
}

// Only get total score by user_id where tournament_id IS NULL
async function getNoTournamentTotalScoreByUserId(db: Database, user_id: number): Promise<number> {
	const games = await db.all(
		`SELECT 
			team_1_player_user_id_1, team_1_player_user_id_2,
			team_2_player_user_id_3, team_2_player_user_id_4,
			score_team_1, score_team_2
		FROM games_history
		WHERE 
			(tournament_id IS NULL) AND
			(
				team_1_player_user_id_1 = :uid OR
				team_1_player_user_id_2 = :uid OR
				team_2_player_user_id_3 = :uid OR
				team_2_player_user_id_4 = :uid
			)
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

//-----------------------------------
//* Only related to tournaments stats
//-----------------------------------


// Only get wins by user_id where tournament_id IS NOT NULL
async function getOnlyTournamentAllWinsByUserId(db: Database, user_id: number) {
	const res = await db.all(
		`SELECT * FROM games_history
		WHERE (winner_user_id_1 = :uid OR winner_user_id_2 = :uid)
		  AND tournament_id IS NOT NULL
		ORDER BY created_at DESC`,
		{':uid': user_id}
	);
	return res.length;
}

// Only get losses by user_id where tournament_id IS NOT NULL
async function getOnlyTournamentAllLossesByUserId(db: Database, user_id: number) {
	const res = await db.all(
		`SELECT * FROM games_history
		WHERE (
			team_1_player_user_id_1 = :uid
			OR team_1_player_user_id_2 = :uid
			OR team_2_player_user_id_3 = :uid
			OR team_2_player_user_id_4 = :uid
		)
		AND winner_user_id_1 != :uid
		AND (winner_user_id_2 IS NULL OR winner_user_id_2 != :uid)
		AND tournament_id IS NOT NULL
		ORDER BY created_at DESC`,
		{':uid': user_id}
	);
	return res.length;
}

// Only get total score by user_id where tournament_id IS NOT NULL
async function getOnlyTournamentTotalScoreByUserId(db: Database, user_id: number): Promise<number> {
	const games = await db.all(
		`SELECT 
			team_1_player_user_id_1, team_1_player_user_id_2,
			team_2_player_user_id_3, team_2_player_user_id_4,
			score_team_1, score_team_2
		FROM games_history
		WHERE 
			(tournament_id IS NOT NULL) AND
			(
				team_1_player_user_id_1 = :uid OR
				team_1_player_user_id_2 = :uid OR
				team_2_player_user_id_3 = :uid OR
				team_2_player_user_id_4 = :uid
			)
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


export const gh_stats_model = {
	getGlobalAllWinsByUserId,
	getGlobalAllLossesByUserId,
	getGlobalTotalScoreByUserId,
	getNoTournamentAllWinsByUserId,
	getNoTournamentAllLossesByUserId,
	getNoTournamentTotalScoreByUserId,
	getOnlyTournamentAllWinsByUserId,
	getOnlyTournamentAllLossesByUserId,
	getOnlyTournamentTotalScoreByUserId,
};


export const gh_detailed_stats_model = {
	getDetailedGlobalByUserId,
	getDetailedTournamentsByUserId,
	getDetailedNoTournamentsByUserId,
}