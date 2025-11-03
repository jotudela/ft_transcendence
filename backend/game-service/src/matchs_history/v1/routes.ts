import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { handlerCreateNewGame, handlerGetHistory } from "./handlers";
import { GamesHistory } from "../interfaces";
import { gh_stats_schemas } from "./parse_schemas";

export default async function matchHistoryV1Routes(fastify: FastifyInstance, opts: any) {
    const db = opts.db;

    fastify.post<{ Body: GamesHistory }>("/new_match", async (request, reply) => {
            const newGame = await handlerCreateNewGame(request, reply, db);

            if (!newGame)
                return reply.status(401).send();

            const accessToken = fastify.jwt.sign({ id: newGame.team_1_player_user_id_1 }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: newGame.team_1_player_user_id_1 }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/", // <-- important !
                    sameSite: "lax",
                    secure: true, // mettre true si HTTPS
                })
                .status(201)
                .send({ token: accessToken });
        }
    );

    fastify.get<{ Params: { scale: string, user_id: string } }>("/:scale/:user_id",
        { schema: { params: gh_stats_schemas.scaleAndUserIdSchema } },
        async (request, reply) => {
            const history = await handlerGetHistory(request.params, reply, db);

            if (!history)
                return reply.status(404).send();

            const accessToken = fastify.jwt.sign({ id: request.params.user_id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: request.params.user_id }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/", // <-- important !
                    sameSite: "lax",
                    secure: true, // mettre true si HTTPS
                })
                .status(200)
                .send({ history, token: accessToken });
        }
    );
}