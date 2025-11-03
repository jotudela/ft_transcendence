import { FastifyInstance } from "fastify";
import { tournamentCreateSchemaForDB } from "./parse_schemas";
import { addTournament, getAllPlayerFromTournament, getAllTournament } from "./handlers";
import { DeployBody, TournamentRequestBody } from "../interfaces";
import axios from "axios";

interface TournamentParams {
  id: string;
}

export default async function usersV1Routes(fastify: FastifyInstance, opts: any) {
  const db = opts.db;

  // POST /v1/users/
  fastify.post<{ Body: TournamentRequestBody }>("/", { schema: { body: tournamentCreateSchemaForDB,},}, async (request, reply) => {
      const { tournament, games_history } = request.body;

    // 1. Collecter tous les IDs uniques
    const playerIds: Set<number> = new Set();
    [
      tournament.first_position_user_id_1,
      tournament.first_position_user_id_2,
      tournament.second_position_user_id_1,
      tournament.second_position_user_id_2,
      tournament.thirth_position_user_id_1,
      tournament.thirth_position_user_id_2,
      tournament.fourth_position_user_id_1,
      tournament.fourth_position_user_id_2,
      tournament.winner_user_id_1,
      tournament.winner_user_id_2,
    ].forEach((id) => {
      if (id !== null) playerIds.add(id);
    });

    games_history.forEach((g) => {
      [
        g.team_1_player_user_id_1,
        g.team_1_player_user_id_2,
        g.team_2_player_user_id_3,
        g.team_2_player_user_id_4,
      ].forEach((id) => {
        if (id !== null) playerIds.add(id);
      });
    });

    const ids = Array.from(playerIds);

    // 2. Calculer les points cumulés pour chaque joueur
    const points: Record<number, number> = {};
    ids.forEach((id) => (points[id] = 0));

    games_history.forEach((game) => {
      if (game.team_1_player_user_id_1) {
        points[game.team_1_player_user_id_1] += game.score_team_1;
      }
      if (game.team_1_player_user_id_2) {
        points[game.team_1_player_user_id_2] += game.score_team_1;
      }
      if (game.team_2_player_user_id_3) {
        points[game.team_2_player_user_id_3] += game.score_team_2;
      }
      if (game.team_2_player_user_id_4) {
        points[game.team_2_player_user_id_4] += game.score_team_2;
      }
    });

    // 3. Récupérer les nicknames via ton API DB
    const nicknames: string[] = await Promise.all(
      ids.map(async (id) => {
        const res = await axios.get(`http://api_bdd:3020/v1/users/${id}`);
        if (!res.data || !res.data.username)
          throw new Error(`No nickname for user ${id}`);
        return res.data.username; // <-- selon structure API
      })
    );

    // 4. Déterminer les ranks via la finale + points
    // --- Déterminer les finalistes à partir du dernier match
    const finalMatch = games_history[games_history.length - 1];
    const finalist1 =
      finalMatch.team_1_player_user_id_1 ??
      finalMatch.team_1_player_user_id_2;
    const finalist2 =
      finalMatch.team_2_player_user_id_3 ??
      finalMatch.team_2_player_user_id_4;

    const winner =
      finalMatch.winner_user_id_1 ?? finalMatch.winner_user_id_2;
    const loser = winner === finalist1 ? finalist2 : finalist1;

    // --- Les autres joueurs (non finalistes)
    const otherPlayers = ids.filter(
      (id) => id !== finalist1 && id !== finalist2
    );

    // --- Comparer leurs points
    let thirdPlayers: number[] = [];
    let fourthPlayers: number[] = [];

    if (otherPlayers.length === 2) {
      const [p1, p2] = otherPlayers;
      const p1Points = points[p1];
      const p2Points = points[p2];

      if (p1Points > p2Points) {
        thirdPlayers = [p1];
        fourthPlayers = [p2];
      } else if (p2Points > p1Points) {
        thirdPlayers = [p2];
        fourthPlayers = [p1];
      } else {
        // égalité -> les 2 en 3ème place
        thirdPlayers = [p1, p2];
        fourthPlayers = [];
      }
    }

    // --- Construire les ranks
    const ranks: number[] = ids.map((id) => {
      if (id === winner) return 1;
      if (id === loser) return 2;
      if (thirdPlayers.includes(id)) return 3;
      if (fourthPlayers.includes(id)) return 4;
      return 0;
    });

    // 5. Construire l'objet final
    const infoForBlockchain: DeployBody = {
      id: ids,
      nicknames,
      ranks,
      points: ids.map((id) => points[id]),
      name: tournament.tournament_name,
    };
    
      const contract = await addTournament(infoForBlockchain, reply, db);
      if (!contract)
        return reply.status(401).send({ msg: "Can't create a new contract." });

      const reorderedTournament = {
        tournament_type: tournament.tournament_type,
        tournament_name: tournament.tournament_name,
        contract_id: contract.address,
        contract_id_created_at: contract.date,
        started_at: tournament.started_at,
        ended_at: tournament.ended_at,
        first_position_user_id_1: tournament.first_position_user_id_1,
        first_position_user_id_2: tournament.first_position_user_id_2,
        second_position_user_id_1: tournament.second_position_user_id_1,
        second_position_user_id_2: tournament.second_position_user_id_2,
        thirth_position_user_id_1: tournament.thirth_position_user_id_1,
        thirth_position_user_id_2: tournament.thirth_position_user_id_2,
        fourth_position_user_id_1: tournament.fourth_position_user_id_1,
        fourth_position_user_id_2: tournament.fourth_position_user_id_2,
        winner_user_id_1: tournament.winner_user_id_1,
        winner_user_id_2: tournament.winner_user_id_2
      };

      await axios.post("http://api_bdd:3020/v1/tournamentes", {
        tournament: reorderedTournament,
        games_history: games_history
      });
    }
  );

  // GET /v1/users/:id
  fastify.get<{ Params: TournamentParams }>("/:id", async (request, reply) => {
      let payload: { id: string; };
      try { payload = await request.jwtVerify() as { id: string; }; }
      catch (err) { return reply.code(401).send(); }

      const res = await getAllPlayerFromTournament(request, reply, db);

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
          .send({ res, accessToken });
    }
  );

  //GET /v1/users/all
  fastify.get("/all", async (request, reply) => {
      let payload: { id: string; };
      try { payload = await request.jwtVerify() as { id: string; }; }
      catch (err) { return reply.code(401).send(); }
      
      const res = await getAllTournament(request, reply, db);

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
          .send({ res, accessToken });
    }
  );
}