import { FastifyRequest, FastifyReply } from "fastify";
import { GamesHistory, ArrayGamesHistory } from "../interfaces";
import { gh_model } from "./models";

// Handler pour POST /v1/users/
export async function handlerCreateNewGame(request: FastifyRequest<{ Body: GamesHistory }>, reply: FastifyReply, db: any): Promise<GamesHistory | undefined> {
  try {
    const user = await gh_model.create1v1Game(request.body, reply);

    return user;
  }
  catch (error: any) {
    console.error("Deploy error message:", error.message);
    console.error("Deploy error stack:", error.stack);

    reply.code(500).send({
      error: error.message || JSON.stringify(error),
    });

    return undefined;
  }
}

export async function handlerGetHistory(params: { scale: string, user_id: string }, reply: any, db: any): Promise<ArrayGamesHistory | never[]> {
  try {
    const handlerHisttory = await gh_model.getAllMatchHistory(params.scale, params.user_id);

    return { array: handlerHisttory};
  }
  catch (error: any) {
    return [];
  }
}