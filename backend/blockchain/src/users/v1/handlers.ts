import { FastifyRequest, FastifyReply } from "fastify";
import { DeployBody } from "../interfaces";
import { tournament_model } from "./models";

interface DeployedContract {
  address: string;
  date: string;
}

// Handler pour POST /v1/users/
export async function addTournament( body: DeployBody, reply: FastifyReply, db: any ): Promise<DeployedContract | null> {
  try {
    const { id, nicknames, ranks, points, name } = body;

    // Appel à ton modèle pour déployer le tournoi
    const contract = await tournament_model.deployTournament({
      id,
      nicknames,
      ranks,
      points,
      name,
    });

    return { address: contract.address, date: contract.date };
  }
  catch (error: any) {
    console.error("Deploy error message:", error.message);
    console.error("Deploy error stack:", error.stack);

    reply.code(500).send({
      error: error.message || JSON.stringify(error),
    });
  }
  return null;
}

export async function getAllPlayerFromTournament(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply, db: any) {
  try {
    const { id } = request.params;

    const formattedPlayers = await tournament_model.getPlayersByTournament(id);

    return formattedPlayers;
  } catch (error: any) {
    console.error("Players error:", error);
    reply.code(500).send({
      error: error.message || JSON.stringify(error),
    });
  }
}

export async function getAllTournament(request: any, reply: FastifyReply, db: any) {
  try {
    const formattedTournaments = await tournament_model.getAllTournament();

    return formattedTournaments;
  }
  catch (error: any) {
    console.error("Tournaments error:", error);
    reply.code(500).send({ error: error.message || JSON.stringify(error),});
  }
}