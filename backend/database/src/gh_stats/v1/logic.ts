import { gh_stats_model } from './models';

//----------
//  counts
//----------
async function getGlobalStatsByUserId(user_id: number, db: any) {
    try {
        const amount_wins = await gh_stats_model.getGlobalAllWinsByUserId(db, user_id);
        const amount_losts = await gh_stats_model.getGlobalAllLossesByUserId(db, user_id);
        const total_score = await gh_stats_model.getGlobalTotalScoreByUserId(db, user_id);

        return { amount_wins, amount_losts, total_score };
    } catch (err: any) {
        throw new Error(err.message);
    }
}

async function getNoTournamentStatsByUserId(user_id: number, db: any) {
    try {
        const amount_wins = await gh_stats_model.getNoTournamentAllWinsByUserId(db, user_id);
        const amount_losts = await gh_stats_model.getNoTournamentAllLossesByUserId(db, user_id);
        const total_score = await gh_stats_model.getNoTournamentTotalScoreByUserId(db, user_id);

        return { amount_wins, amount_losts, total_score };
    } catch (err: any) {
        throw new Error(err.message);
    }
}

async function getOnlyTournamentStatsByUserId(user_id: number, db: any) {
    try {
        const amount_wins = await gh_stats_model.getOnlyTournamentAllWinsByUserId(db, user_id);
        const amount_losts = await gh_stats_model.getOnlyTournamentAllLossesByUserId(db, user_id);
        const total_score = await gh_stats_model.getOnlyTournamentTotalScoreByUserId(db, user_id);

        return { amount_wins, amount_losts, total_score };
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const gh_stats_logic = {
	getGlobalStatsByUserId,
	getNoTournamentStatsByUserId,
	getOnlyTournamentStatsByUserId,
}
