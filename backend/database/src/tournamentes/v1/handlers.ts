import { tournaments_model } from './models';
import { t_logic } from './logic';
import { TournamentPayload } from '../interfaces';
import { gh_t_logic } from "../../games_history/v1/logic"
import { games_history_model } from "../../games_history/v1/models"

// REMINDER : these POST is a transaction.
// Will Add a tournament and each games.
async function handlerAddTournament(request: { body: TournamentPayload }, reply: any, db: any) {
	try {
		if (!await t_logic.handlerIsPayloadCorrect(request.body, db))
			return reply.status(400).send({ error: 'Invalid payload' });

		// Handle adding tournament.
		const resAddTournament = await tournaments_model.addTournament(db, request.body.tournament);
		if (typeof resAddTournament.lastID === 'number') {
			const resGetTournament = await tournaments_model.getTournamentById(db, resAddTournament.lastID);
			if (!resGetTournament)
				return reply.status(500).send({msg:"we didn't reach to add data in DB"});
		}

		// Handler add games batch [{game}, {game}, {game_final}];
		const arrGamesHistory = { games_history: request.body.games_history };
		const tournamentType = request.body.tournament.tournament_type;
		if (!(await gh_t_logic.addGamesHistoryBatch(arrGamesHistory, tournamentType, db, resAddTournament.lastID!))) {
			await tournaments_model.deleteTournamentById(db, resAddTournament.lastID!);
			return reply.status(500).send({msg:"we didn't reach to add data in DB"});
		}

		return reply.status(200).send({ msg: "Tournament and games batch added to DB", tournament_inserted_id : resAddTournament.lastID });
	} catch (err: any) {
		console.log(err);
		return reply.status(500).send({ error: 'Internal server error'});
	}
}

// Read all
async function handlerGetAllTournaments(request: any, reply: any, db: any) {
	try {
		const tournaments = await tournaments_model.getAllTournaments(db);
		reply.send(tournaments);
	} catch (err: any) {
		reply.status(500).send({ error: 'Internal server error', details: err.message });
	}
}

// Read by id
async function handlerGetTournamentById(request: any, reply: any, db: any) {
	try {
		const tournament = await tournaments_model.getTournamentById(db, Number(request.params.id));
		if (tournament) return reply.status(200).send(tournament);
		reply.status(404).send({ error: 'Tournament not found' });
	} catch (err: any) {
		reply.status(500).send({ error: 'Internal server error', details: err.message });
	}
}

// Get complete tournament data (tournament + games_history)
async function handlerGetCompleteTournamentData(request: { params: { tournament_id: string } }, reply: any, db: any) {
	try {
		const tournament_id = Number(request.params.tournament_id);
		const tournament = await tournaments_model.getTournamentById(db, tournament_id);
		if (!tournament) return reply.status(404).send({ error: 'Tournament not found' });

		const games_history = await games_history_model.getGamesHistoryByTournamentId(db, tournament_id);

		return reply.send({ tournament, games_history });
	} catch (err: any) {
		return reply.status(500).send({ error: 'Internal server error', details: err.message });
	}
}

// Delete
async function handlerDeleteTournamentById(request: { params: { tournament_id: string } }, reply: any, db: any) {
    try {
        const tournament_id = Number(request.params.tournament_id);
        const exists = await tournaments_model.getTournamentById(db, tournament_id);
        if (!exists) return reply.status(404).send({ error: 'Tournament not found' });

        // Erase 3 games related to the tournament.
        const resDeleteGamesArr = await gh_t_logic.handlerGetDeleteGamesHistoryIdsByTournamentId(db, tournament_id);
		if (resDeleteGamesArr === false)
				return reply.status(500).send({ error: 'Error while erasing games in tournament, please try again' });
        // Erase the tournament row.
        const resDelete = await tournaments_model.deleteTournamentById(db, tournament_id);
        if (!resDelete || resDelete.changes === 0)
			return reply.status(500).send({ error: 'Error while erasing tournament data' });

        return reply.status(200).send({ msg: 'Tournament and related games deleted' });
    } catch (err: any) {
        return reply.status(500).send({ error: 'Internal server error', details: err.message });
    }
}

export const tournaments_handlers = {
	handlerAddTournament,
	handlerGetAllTournaments,
	handlerGetTournamentById,
	handlerDeleteTournamentById,
	handlerGetCompleteTournamentData,
};
