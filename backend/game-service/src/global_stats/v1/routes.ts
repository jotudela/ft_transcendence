import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { handlerGetAllStats } from "./handlers";
import { ResponseAllStats} from "../interfaces";

export default async function globalStatsV1Routes(fastify: FastifyInstance, opts: any) {
    const db = opts.db;

    fastify.get<{ Body: ResponseAllStats }>("/all", async (request, reply) => {
            let payload: { id: string; };
            try { payload = await request.jwtVerify() as { id: string; }; }
            catch (err) { return reply.code(401).send(); }

            const stats = await handlerGetAllStats({ ...request, body: { ...request.body, id: payload.id } }, reply, db);

            if (!stats)
                return reply.status(401).send();

            const accessToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/", // <-- important !
                    sameSite: "lax",
                    secure: true, // mettre true si HTTPS
                })
                .status(201)
                .send({ stats, accessToken });
        }
    );
}