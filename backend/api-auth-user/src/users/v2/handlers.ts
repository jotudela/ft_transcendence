import { FastifyRequest, FastifyReply } from "fastify";
import { DeployBody2, LoginBody2, updateBody2, UsersUpdateData } from "../interfaces";
import { users_model } from "./models";

// Handler pour POST /v1/users/
export async function addUser(request: FastifyRequest<{ Body: DeployBody2 }>, reply: FastifyReply, db: any): Promise<DeployBody2 | undefined> {
  try {
    const { username, password, email, username_in_tournaments, sub } = request.body;

    // Appel à mon modèle pour ajouter un new user
    const user = await users_model.registerUser({
      username,
      password,
      email,
      username_in_tournaments,
      sub,
    }, reply);

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

export async function upUser(request: FastifyRequest<{ Body: updateBody2 }>, reply: FastifyReply, db: any): Promise<updateBody2| undefined> {
  try {
    const { id, username, password, email, username_in_tournaments, two_fa_secret, is_fa_enabled } = request.body;

    const user = await users_model.updateUser({
      id,
      username,
      password,
      email,
      username_in_tournaments,
      two_fa_secret,
      is_fa_enabled,
    }, reply);

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

export async function logUser(request: FastifyRequest<{ Body: LoginBody2 }>, reply: FastifyReply, db: any): Promise<LoginBody2 | undefined> {
  try {
    const { email, password, is_fa_enabled, code } = request.body;

    // Appel à mon modèle pour ajouter un new user
    const user = await users_model.loginUser({
      email,
      password,
      is_fa_enabled,
      code
    }, reply);

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

export async function handlerUpdateByTypesAndId(request: { params: { id: string, types: string }, body: UsersUpdateData }, reply: any, db: any) {
  try {
    const userId = Number(request.params.id);
    const type = request.params.types as "username" | "password" | "email" | "username_in_tournaments" | "sub" | "two_fa_secret" | "is_fa_enabled";
    const data = request.body.data;

    const res = await users_model.handlerUpdateTypesModels(type, userId, data);

    return res;
  }
  catch (error: any) {
    console.error("Deploy error message:", error.message);
    console.error("Deploy error stack:", error.stack);

    reply.code(500).send({
      error: error.message || JSON.stringify(error),
    });
  }
}

export async function verifyPasswordGG(id: number, reply: any): Promise<boolean | undefined> {
  try {
    const res = users_model.isGooglePassword(id);
    return res;
  }
  catch (error: any) {
    console.error("Deploy error message:", error.message);
    console.error("Deploy error stack:", error.stack);

    reply.code(500).send({
      error: error.message || JSON.stringify(error),
    });
  }
  return undefined;
}