import { users_model } from '../../users/v1/models';
import { gh_stats_logic } from './logic';
import { gh_detailed_stats_model } from './models'

async function handlerGetStats(request: { params: { user_id: string, scale: string } }, reply: any, db: any) {
	try {
		const userId = Number(request.params.user_id);
		const scale = request.params.scale;
		const resUserExists = await users_model.isUserIdExists(db, userId);

		if (!resUserExists)
			return reply.status(404).send({ error: 'User not found.' });

		let resPayload;
		switch (scale) {
			case "global": 
				resPayload = await gh_stats_logic.getGlobalStatsByUserId(userId, db);
				break;
			case "only_1vs1":
				resPayload = await gh_stats_logic.getNoTournamentStatsByUserId(userId, db);
				break;
			case "only_tournaments":
				resPayload = await gh_stats_logic.getOnlyTournamentStatsByUserId(userId, db);
				break;
			default: 
				return reply.status(400).send({ error: 'Invalid scale parameter.' });
		}

		return reply.status(200).send(resPayload);
	} catch (err: any) {
		console.error(err.message);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

async function handlerGetDetailedStats(request: { params: { user_id: string, scale: string } }, reply: any, db: any) {
	try {
		const userId = Number(request.params.user_id);
		const scale = request.params.scale;
		const resUserExists = await users_model.isUserIdExists(db, userId);

		if (!resUserExists)
			return reply.status(404).send({ error: 'User not found.' });

		let resPayload;
		switch (scale) {
			case "global": 
				resPayload = await gh_detailed_stats_model.getDetailedGlobalByUserId(userId, db);
				break;
			case "only_1vs1":
				resPayload = await gh_detailed_stats_model.getDetailedNoTournamentsByUserId(userId, db);
				break;
			case "only_tournaments":
				resPayload = await gh_detailed_stats_model.getDetailedTournamentsByUserId(userId, db);
				break;
			default: 
				return reply.status(400).send({ error: 'Invalid scale parameter.' });
		}

		return reply.status(200).send(resPayload);
	} catch (err: any) {
		console.error(err.message);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

export const gh_stats_handlers = {
	handlerGetStats,
	handlerGetDetailedStats
};

