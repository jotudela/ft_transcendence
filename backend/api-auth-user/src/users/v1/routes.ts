import { FastifyInstance } from "fastify";
import { usersCreateSchema, usersTryToLog } from "./parse_schemas";
import { addUser, logUser } from "./handlers";
import { DeployBody1, LoginBody1 } from "../interfaces";

export default async function usersV1Routes(fastify: FastifyInstance, opts: any) {
    const db = opts.db;

    // POST /v1/users/register
    fastify.post<{ Body: DeployBody1 }>("/register", { schema: { body: usersCreateSchema,},}, async (request, reply) => {
            await addUser(request, reply, db);
        }
    );

    // POST /v1/users/login
    fastify.post<{ Body: LoginBody1 }>("/login", { schema: { body: usersTryToLog,},}, async (request, reply) => {
            await logUser(request, reply, db);
        }
    );
}