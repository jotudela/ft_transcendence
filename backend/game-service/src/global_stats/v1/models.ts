import Fastify from "fastify";
import dotenv from "dotenv";
import axios from "axios";
import { FastifyReply } from "fastify";
import { ResponseAllStats } from "../interfaces";

dotenv.config();

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: { coerceTypes: false }
  }
});

async function getAllStats(id: string): Promise<ResponseAllStats> {
    const numericId = Number(id);

    // Vérifie que l’utilisateur existe
    const user = await axios.get(`http://api_bdd:3020/v1/users/${numericId}`);
    if (!user.data) {
        throw new Error("User not found.");
    }

    const allStats = await axios.get(`http://api_bdd:3020/v1/stats/only_1vs1/${id}`)

    if (allStats.data.total_score === undefined || allStats.data === undefined) {
        throw new Error("Impossible de calculer les stats");
    }

    return {
        total_scored: allStats.data.total_score ?? 0, // 0 si pas de score
        total_wins: allStats.data.amount_wins ?? 0,
        total_losts: allStats.data.amount_losts ?? 0,
    };
}

export const stats_model = {
    getAllStats
}