import { Database } from "sqlite";
import { Tournament } from "../interfaces";

// Create
async function addTournament(db: Database, t: Tournament) {
	return await db.run(
		`INSERT INTO tournaments (
			tournament_name, tournament_type, contract_id, contract_id_created_at,
			started_at, ended_at, created_at,
			first_position_user_id_1, first_position_user_id_2,
			second_position_user_id_1, second_position_user_id_2,
			thirth_position_user_id_1, thirth_position_user_id_2,
			fourth_position_user_id_1, fourth_position_user_id_2,
			winner_user_id_1, winner_user_id_2
		) VALUES (?, ?, ?, ?, ?, ?, datetime('now'),
			?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
		t.tournament_name,
		t.tournament_type,
		t.contract_id,
		t.contract_id_created_at,
		t.started_at,
		t.ended_at,
		t.first_position_user_id_1,
		t.first_position_user_id_2,
		t.second_position_user_id_1,
		t.second_position_user_id_2,
		t.thirth_position_user_id_1,
		t.thirth_position_user_id_2,
		t.fourth_position_user_id_1,
		t.fourth_position_user_id_2,
		t.winner_user_id_1,
		t.winner_user_id_2
	);
}

// Read all
async function getAllTournaments(db: Database) {
	return await db.all("SELECT * FROM tournaments");
}

// Read by id
async function getTournamentById(db: Database, id: number) {
	return await db.get("SELECT * FROM tournaments WHERE id = ?", id);
}

// Delete
async function deleteTournamentById(db: Database, id: number) {
	return await db.run("DELETE FROM tournaments WHERE id = ?", id);
}

export const tournaments_model = {
	addTournament,
	getAllTournaments,
	getTournamentById,
	deleteTournamentById,
};
