import { FastifyRequest, FastifyReply } from "fastify";
import { ResponseAllStats, StatsParams } from "../interfaces";
import { stats_model } from "./models";

// Handler pour POST /v1/users/
export async function handlerGetAllStats(request: FastifyRequest<{ Body: StatsParams }>, reply: FastifyReply, db: any): Promise<ResponseAllStats | void> {
  try {
    const { id } = request.body;

    // getAllStats ne doit pas recevoir `reply`
    const userStats = await stats_model.getAllStats(id);

    // toujours return reply
    return reply.send(userStats);
  } catch (error: any) {
    request.log.error(error, "Error in handlerGetAllStats");

    // return reply aussi ici
    return reply.code(500).send({
      error: error.message || "Unexpected error",
    });
  }
}