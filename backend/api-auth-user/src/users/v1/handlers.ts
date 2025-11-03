import { FastifyRequest, FastifyReply } from "fastify";
import { DeployBody1, LoginBody1 } from "../interfaces";
import { users_model } from "./models";

// Handler pour POST /v1/users/
export async function addUser(request: FastifyRequest<{ Body: DeployBody1 }>, reply: FastifyReply, db: any) {
  try {
    const { username, password, email, username_in_tournaments } = request.body;

    // Appel à mon modèle pour ajouter un new user
    const user = await users_model.registerUser({
      username,
      password,
      email,
      username_in_tournaments,
    }, reply);

    return reply.status(200).send();
  }
  catch (error: any) {
    console.error("Deploy error message:", error.message);
    console.error("Deploy error stack:", error.stack);

    reply.code(500).send({
      error: error.message || JSON.stringify(error),
    });
  }
}

export async function logUser(request: FastifyRequest<{ Body: LoginBody1 }>, reply: FastifyReply, db: any) {
  try {
    const { email, password } = request.body;

    // Appel à mon modèle pour ajouter un new user
    const user = await users_model.loginUser({
      email,
      password
    }, reply);

    return reply.status(200).send();
  }
  catch (error: any) {
    console.error("Deploy error message:", error.message);
    console.error("Deploy error stack:", error.stack);

    reply.code(500).send({
      error: error.message || JSON.stringify(error),
    });
  }
}