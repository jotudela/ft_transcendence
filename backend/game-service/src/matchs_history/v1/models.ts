import Fastify from "fastify";
import dotenv from "dotenv";
import axios from "axios";
import { FastifyReply } from "fastify";
import { GamesHistory } from "../interfaces";

dotenv.config();

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: { coerceTypes: false }
  }
});

async function create1v1Game(body: GamesHistory, reply: FastifyReply) {
    try {
        const user1 = await axios.get(`http://api_bdd:3020/v1/users/${Number(body.team_1_player_user_id_1)}`);
        if (!user1.data)
            throw new Error("Player 1 not found.");

        const user2 = await axios.get(`http://api_bdd:3020/v1/users/${Number(body.team_2_player_user_id_3)}`);
        if (!user2.data)
            throw new Error("Player 2 not found.");
    }
    catch (error: any) {
        if (error.response && error.response.status === 404){}
        else
            throw error;
    }

    try {
        const newMatch: GamesHistory = {
            game_type: body.game_type,
            team_1_player_user_id_1: body.team_1_player_user_id_1,
            team_2_player_user_id_3: body.team_2_player_user_id_3,
            started_at: body.started_at,
            ended_at: body.ended_at,
            score_team_1: body.score_team_1,
            score_team_2: body.score_team_2,
            winner_user_id_1: body.winner_user_id_1
        };

        const response = await axios.post("http://api_bdd:3020/v1/games_history", newMatch);


        return response.data as GamesHistory;
    }
    catch (error: any) {
        if (error.response && error.response.status === 404){}
        else
            throw error;
    }
}

async function getAllMatchHistory(scale: string, user_id: string) {
  try {
    const userId = Number(user_id);
    const type = scale;

    const user = await axios.get(`http://api_bdd:3020/v1/users/${userId}`);
    if (!user.data) throw new Error("User not found.");

    const resHistory = await axios.get(`http://api_bdd:3020/v1/stats/detailed/${type}/${userId}`);
    const data = resHistory.data;

    if (!Array.isArray(data) || data.length === 0)
      throw new Error("No match history found.");

    const sortedHistory: GamesHistory[] = data.sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    const cleanedHistory = sortedHistory.map((match) => ({
      id: match.id,
      tournament_id: match.tournament_id,
      game_type: match.game_type,
      team_1_player_user_id_1: match.team_1_player_user_id_1,
      team_2_player_user_id_3: match.team_2_player_user_id_3,
      started_at: match.started_at,
      ended_at: match.ended_at,
      score_team_1: match.score_team_1,
      score_team_2: match.score_team_2,
      winner_user_id_1: match.winner_user_id_1,
    }));

    return cleanedHistory;
  }
  catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.error("User or stats not found");
      return [];
    } else {
      console.error("Error fetching match history:", error.message);
      throw error;
    }
  }
}

export const gh_model = {
    create1v1Game,
    getAllMatchHistory
}