import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { usersCreateSchema, usersUpdateSchema, usersTryToLog, friends } from "./parse_schemas";
import { addUser, logUser, upUser, handlerUpdateByTypesAndId, verifyPasswordGG } from "./handlers";
import { DeployBody2, LoginBody2, updateBody2, UsersUpdateData, UserApiResponse, UserResponse, sendRequestFriend, updateFriends, deleteFriends } from "../interfaces";
import axios from "axios";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import FormData from "form-data";
import { Readable } from "stream";

// Fonction utilitaire pour convertir un ReadableStream en Buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", (err) => reject(err));
    });
}

export default async function usersV2Routes(fastify: FastifyInstance, opts: any) {
    const db = opts.db;

    // POST /v2/users/register
    fastify.post<{ Body: DeployBody2 }>("/register", { schema: { body: usersCreateSchema,},}, async (request, reply) => {
            const user = await addUser(request, reply, db);
            if (!user)
                return reply.status(400).send();

            const accessToken = fastify.jwt.sign({ id: user.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: user.id }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/", // <-- important !
                    sameSite: "lax",
                    secure: true, // mettre true si HTTPS
                })
                .status(201)
                .send({ accessToken });
        }
    );

    // POST /v2/users/login
    fastify.post<{ Body: LoginBody2 }>("/login", { schema: { body: usersTryToLog,},}, async (request, reply) => {
            const user = await logUser(request, reply, db);
            if (!user)
                return reply.status(401).send();

            // Vérifie si 2FA activée
            if (user.is_fa_enabled) {
                // Génère un token temporaire juste pour 2FA
                const twoFAToken = fastify.jwt.sign(
                { id: user.id, twoFA: true },
                { expiresIn: "5m" } // court délai
                );

                return reply.status(200).send({ twoFAToken });
            }

            const status = "online";
            const url = `http://api_bdd:3020/v1/user_online_status/add/${user.id}`;

            try {
                await axios.post(url, { status }, { headers: { "Content-Type": "application/json" } });
            }
            catch (err: any) {
                console.error("Failed to update user status:", err.response?.data || err.message);
            }

            const accessToken = fastify.jwt.sign({ id: user.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: user.id }, { expiresIn: "7d" });

            reply
                .setCookie("session_token", accessToken, {
                    httpOnly: true,
                    path: "/",
                    sameSite: "lax",
                    secure: true,
                })
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/", // <-- important !
                    sameSite: "lax",
                    secure: true, // mettre true si HTTPS
                })
                .status(201)
                .send({ accessToken });
        }
    );

    // PUT /v2/users/update
    fastify.put<{ Body: updateBody2 }>("/update", { schema: { body: usersUpdateSchema,},}, async (request, reply) => {
        let payload: { id: string; };
        try { payload = await request.jwtVerify() as { id: string; }; }
        catch (err) { return reply.code(401).send(); }
        
        const user = await upUser({ ...request, body: { ...request.body, id: Number(payload.id) } }, reply, db);

        if (!user)
            return reply.status(401).send();

            const accessToken = fastify.jwt.sign({ id: user.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: user.id }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/", // <-- important !
                    sameSite: "lax",
                    secure: true, // mettre true si HTTPS
                })
                .status(201)
                .send({ accessToken });
    });

    fastify.put<{ Params: { id: string, types: string }; Body: UsersUpdateData }>('/update/:types/:id', async (request, reply) => {
        let payload: { id: string; };
        try { payload = await request.jwtVerify() as { id: string; }; }
        catch (err) { return reply.code(401).send(); }

        const user = await handlerUpdateByTypesAndId(request, reply, db);

        if (!user)
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
                .send({ accessToken });
    });

    // GET /v2/users/all
    fastify.get("/all", async (request, reply) => {
        try {
            const res = await axios.get("http://api_bdd:3020/v1/users/all");

            if (!res.data || res.data.length === 0) {
            return reply.status(404).send({ error: "No users found" });
            }

            return reply.status(200).send({ users: res.data });
        }
        catch (err: any) {
            console.error("Erreur Fastify /all :", err.message);
            return reply.status(500).send({ error: "Internal Server Error" });
        }
    });

    // GET /v2/users/profile
    fastify.get("/profile", async (request, reply) => {
        try {
            const payload = await request.jwtVerify() as { id: string; };
            const user = await axios.get<UserApiResponse>(`http://api_bdd:3020/v1/users/${payload.id}`);

            if (!user.data)
                return reply.status(401).send();
            
            const result: UserResponse = {
                id: payload.id,
                email: user.data.email,
                role: user.data.role,
                username: user.data.username,
                username_in_tournaments: user.data.username_in_tournaments,
                sub: (user.data.sub ? 'true' : ''),
                is_fa_enabled: user.data.is_fa_enabled
            };

            const accessToken = fastify.jwt.sign({ id: result.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: result.id }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/", // <-- important !
                    sameSite: "lax",
                    secure: true, // mettre true si HTTPS
                })
                .status(201)
                .send({ result, accessToken });
        }
        catch (err) {
            return reply.code(401).send();
        }
    });

    // POST /v2/users/refresh-token
    fastify.post("/refresh-token", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const refreshToken = request.cookies?.refreshToken;
            if (!refreshToken)
                return reply.status(401).send();

            const payload = fastify.jwt.verify<{ id: string; }>(refreshToken);

            const newAccessToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "15m" });

            return reply.send({ accessToken: newAccessToken });
        }
        catch (err: any) {
            return reply.status(401).send();
        }
    });

    // Endpoint : POST /auth/2fa/setup
    fastify.post("/auth/2fa/setup", async (request, reply) => {
        try {
            let payload: { id: string; };
            try { payload = await request.jwtVerify() as { id: string; }; }
            catch (err: any) { console.error("Erreur Fastify:", err.message); return reply.code(401).send(err.message); }
            const user = await axios.get<UserApiResponse>(`http://api_bdd:3020/v1/users/${payload.id}`);
            
            const secret = speakeasy.generateSecret({
                length: 20,
                name: `PONG (${user.data.email})`,
            });

            // Sauvegarder secret.base32 dans la BDD de l’utilisateur
            const makeReq = (type: string, data: string) => ({
                params: { id: payload.id.toString(), types: type },
                body: { data },
            });

            let dbUser = await handlerUpdateByTypesAndId(makeReq("two_fa_secret", secret.base32), reply, db);
            if (!dbUser)
                return reply.status(401).send({ msg: "two_fa_secret" });

            dbUser = await handlerUpdateByTypesAndId(makeReq("is_fa_enabled", "false"), reply, db);
            if (!dbUser)
                return reply.status(401).send({ msg: "is_fa_enabled" });


            // Générer QR Code pour appli Google Authenticator
            const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url!);

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
                .send({ qrCodeDataUrl, accessToken });
        }
        catch (err: any) {
            console.error("Erreur Fastify:", err.message);
            return reply.status(401).send(err.message);
        }
    });

    // Endpoint : POST /auth/2fa/confirm
    fastify.post("/auth/2fa/confirm", async (request, reply) => {
        try {
            const payload = await request.jwtVerify() as { id: string; };
            const user = await axios.get<UserApiResponse>(`http://api_bdd:3020/v1/users/${payload.id}`);
            
            const { code } = request.body as { code: string };
            if (!user?.data.two_fa_secret)
                return reply.status(400).send({ error: "No 2FA setup in progress" });

            const verified = speakeasy.totp.verify({
                secret: user.data.two_fa_secret,
                encoding: "base32",
                token: code,
                window: 1, // tolérance d'une période
            });

            if (!verified)
                return reply.status(400).send({ error: "Invalid code" });

            const makeReq = (type: string, data: string) => ({
                params: { id: payload.id.toString(), types: type },
                body: { data },
            });

            // update
            const dbUser = await handlerUpdateByTypesAndId(makeReq("is_fa_enabled", "true"), reply, db);
            if (!dbUser)
                return reply.status(401).send({ msg: "is_fa_enabled" });

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
                .send({ ok: true, accessToken });
        }
        catch (err: any) {
            return reply.status(401).send();
        }
    });

    fastify.post("/2fa/verify", async (request, reply) => {
        const { twoFAToken, code } = request.body as { twoFAToken: string; code: string };

        try {
            // Vérifie le token temporaire
            const payload = fastify.jwt.verify(twoFAToken) as { id: number; twoFA: boolean };
            if (!payload.twoFA)
                return reply.status(401).send({ error: "Invalid token" });

            // Récupère le user
            const user = await axios.get<UserApiResponse>(`http://api_bdd:3020/v1/users/${payload.id}`);
            if (!user || !user.data.two_fa_secret)
                return reply.status(400).send({ error: "2FA not enabled" });

            // Vérifie le code TOTP
            const verified = speakeasy.totp.verify({
                secret: user.data.two_fa_secret,
                encoding: "base32",
                token: code,
            });

            if (!verified)
                return reply.status(400).send({ error: "Invalid 2FA code" });

            const status = "online";
            const url = `http://api_bdd:3020/v1/user_online_status/add/${payload.id}`;

            try {
                await axios.post(url, { status }, { headers: { "Content-Type": "application/json" } });
            }
            catch (err: any) {
                console.error("Failed to update user status:", err.response?.data || err.message);
            }

            // Code valide → génère les vrais tokens
            const accessToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/",
                    sameSite: "lax",
                    secure: true,
                })
                .status(200)
                .send({ accessToken });

        } catch (err) {
            return reply.status(401).send({ error: "Invalid or expired token" });
        }
    });

    fastify.post<{ Body: sendRequestFriend }>("/newfriends", { schema: { body: friends.schemaFriends,},}, async (request, reply) => {
        try {
            const { user_id_1, user_id_2, requested_by} = request.body as {
                user_id_1: number;
                user_id_2: number;
                requested_by: number;
            };

            const relation = await axios.post("http://api_bdd:3020/v1/friendships/add", {
                user_id_1,
                user_id_2,
                requested_by
            });

            const result = relation.data;
            if (!result)
                return reply.status(401).send({ msg: "Request failed." });

            const accessToken = fastify.jwt.sign({ id: result.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: result.id }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/",
                    sameSite: "lax",
                    secure: true,
                })
                .status(200)
                .send({ accessToken });
        }
        catch (err: any) {
            return reply.status(401).send();
        }
    });

    fastify.post<{ Body: updateFriends }>("/accept_decline_friends", { schema: { body: friends.updateStatusFriends,},}, async (request, reply) => {
        try {
            const { id, status } = request.body as {
                id: number;
                status: string;
            };

            const relation = await axios.put("http://api_bdd:3020/v1/friendships/update_status", {
                id,
                status
            });

            const result = relation.data;
            if (!result)
                return reply.status(401).send({ msg: "Request failed." });

            const accessToken = fastify.jwt.sign({ id: result.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: result.id }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/",
                    sameSite: "lax",
                    secure: true,
                })
                .status(200)
                .send({ accessToken });
        }
        catch (err: any) {
            return reply.status(401).send();
        }
    });

    fastify.post<{ Body: deleteFriends }>("/delete_friends", { schema: { body: friends.schemaDeleteFriends,},}, async (request, reply) => {
        try {
            const { user_id_1, user_id_2 } = request.body as {
                user_id_1: number;
                user_id_2: number;
            };

            const relation = await axios.delete("http://api_bdd:3020/v1/friendships/by_friendship_users_id", {
                data: {
                    user_id_1,
                    user_id_2
                }
            });

            const result = relation.data;
            if (!result)
                return reply.status(401).send({ msg: "Request failed." });

            const accessToken = fastify.jwt.sign({ id: user_id_1 }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: user_id_1 }, { expiresIn: "7d" });

            reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/",
                    sameSite: "lax",
                    secure: true,
                })
                .status(200)
                .send({ accessToken });
        }
        catch (err: any) {
            return reply.status(401).send();
        }
    });

    fastify.get<{ Params: { id: string } }>("/allfriends_accepted/:id", async (request, reply) => {
        try {
            const userId = Number(request.params.id);

            const allfriends_accepted = await axios.get(`http://api_bdd:3020/v1/friendships/all_requests/accepted/user_id/${userId}`);

            if (!allfriends_accepted.data || !Array.isArray(allfriends_accepted.data))
                return reply.status(404).send({ msg: "No accepted friends found." });

            const friends = allfriends_accepted.data;

            const userIds = friends
            .map((f) => (f.user_id_min === userId ? f.user_id_max : f.user_id_min))
            .filter((id) => id !== userId);

            if (userIds.length === 0)
                return reply.status(200).send({ friends: [], statuses: [] });

            const statusResponse = await axios.post(`http://api_bdd:3020/v1/user_online_status/targeted_array/latest_statuses`,
                { user_ids: userIds }, { headers: { "Content-Type": "application/json" }, });

            const statuses = statusResponse.data;

            const friendsWithStatus = friends.map((friend) => {
                const friendId = friend.user_id_min === userId ? friend.user_id_max : friend.user_id_min;
                const statusInfo = statuses.find((s: any) => s.user_id === friendId);
                return {
                    ...friend,
                    friend_id: friendId,
                    friend_status: statusInfo ? statusInfo.status : "unknown",
                };
            });

            return reply.status(200).send({
                count: friendsWithStatus.length,
                friends: friendsWithStatus,
            });
        }
        catch (error: any) {
            console.error("Error fetching accepted friends:", error.message);
            return reply.status(500).send({ msg: "Internal server error" });
        }
    });

    fastify.get("/allfriends_rejected/:id", async (request: any, reply: any) => {
        const { id } = request.params as {
            id: number;
        }
        const allfriends_rejected = await axios.get(`http://api_bdd:3020/v1/friendships/all_requests/rejected/user_id/${id}`);
        if (!allfriends_rejected.data)
            return reply.status(401).send({ msg: "Request failed." });
        return reply.status(200).send(allfriends_rejected.data);
    });

    fastify.get("/allfriends_pending/:id", async (request: any, reply: any) => {
        const { id } = request.params as {
            id: number;
        }
        const allfriends_pending = await axios.get(`http://api_bdd:3020/v1/friendships/all_requests/pending/user_id/${id}`);
        if (!allfriends_pending.data)
            return reply.status(401).send({ msg: "Request failed." });
        return reply.status(200).send(allfriends_pending.data);
    });

    fastify.get("/allfriends/:id", async (request: any, reply: any) => {
        const { id } = request.params as {
            id: number;
        }
        const allfriends = await axios.get(`http://api_bdd:3020/v1/friendships/all_requests/all/user_id/${id}`);
        if (!allfriends.data)
            return reply.status(401).send({ msg: "Request failed." });
        return reply.status(200).send(allfriends.data);
    });

    fastify.put("/avatar", async (request, reply) => {
        let payload: { id: string; };
        try { payload = await request.jwtVerify() as { id: string; }; }
        catch (err) { return reply.code(401).send(); }

        const file = await request.file();

        if (!file)
            return reply.status(400).send({ error: "Aucun fichier reçu" });

        // Vérifier le type le format de l'image
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.mimetype))
            return reply.status(400).send({ error: `Format non supporté. Formats acceptés : jpeg, png, webp` });

        // Bien typer pour envoyer à la bdd
        const formData = new FormData();
        formData.append("avatar", file.file, {
            filename: file.filename,
            contentType: file.mimetype,
        });

        const response = await axios.put(`http://api_bdd:3020/v1/users_img/profile_image/${payload.id}`, formData, {
            headers: {
            ...formData.getHeaders(),
            },
        });

        if (!response.data)
            return reply.status(400).send({ error: "Can't register avatar" });

        const accessToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "15m" });
        const refreshToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "7d" });

        return reply
            .setCookie("refreshToken", refreshToken, {
                httpOnly: true,
                path: "/", // <-- important !
                sameSite: "lax",
                secure: true, // mettre true si HTTPS
            })
            .status(201)
            .send({ msg: "Avatar enregistré !", accessToken });
    });

    fastify.get("/avatar/get_avatar_by_id", async (request, reply) => {
        let payload: { id: string };
        try { payload = await request.jwtVerify() as { id: string }; }
        catch { return reply.code(401).send({ error: "Token invalide ou expiré" }); }

        try {
            const response = await axios.get(`http://api_bdd:3020/v1/users_img/profile_image/${payload.id}`,
            {
                responseType: "stream",
                validateStatus: () => true,
            });

            if (response.status !== 200 || !response.data.readable) {
                console.error(
                    "[GET /avatar/get_avatar_by_id] Pas de flux image :",
                    response.status,
                    response.headers["content-type"]
                );
                return reply.code(404).send({ error: "Image non trouvée" });
            }

            const accessToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "7d" });

            reply.setCookie("refreshToken", refreshToken, {
                httpOnly: true,
                path: "/",
                sameSite: "lax",
                secure: true,
            });

            const imageBuffer = await streamToBuffer(response.data);
            const base64Image = imageBuffer.toString("base64");
            const contentType = response.headers["content-type"];

            return reply.send({ base64Image, contentType, accessToken });

        }
        catch (error: any) {
            console.error("[GET /avatar/get_avatar_by_id] Error:", error.message);
            return reply.code(500).send({ error: "Erreur interne lors du chargement de l'image" });
        }
    });

    fastify.delete("/avatar/delete_by_id", async (request, reply) => {
            let payload: { id: string; };
            try { payload = await request.jwtVerify() as { id: string; }; }
            catch (err) { return reply.code(401).send(); }

            const response = await axios.delete(`http://api_bdd:3020/v1/users_img/profile_image/${payload.id}`);

            if (!response.data)
                return reply.status(400).send({ error: "Can't delete avatar" });

            const accessToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "15m" });
            const refreshToken = fastify.jwt.sign({ id: payload.id }, { expiresIn: "7d" });

            return reply
                .setCookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    path: "/", // <-- important !
                    sameSite: "lax",
                    secure: true, // mettre true si HTTPS
                })
                .status(201)
                .send({ msg: "Avatar détruit !", accessToken });
    });

    fastify.get<{ Params: { id: number } }>("/isPasswordGG/:id", async (request, reply) => {
            const { id } = request.params;
            return await verifyPasswordGG(id, reply);
    });

    fastify.post<{ Params: { id: number } }>("/to_offline/:id", async (request, reply) => {
            const status = "offline";
            const url = `http://api_bdd:3020/v1/user_online_status/add/${request.params.id}`;

            try {
                await axios.post(url, { status }, { headers: { "Content-Type": "application/json" } });
            }
            catch (err: any) {
                console.error("Failed to update user status:", err.response?.data || err.message);
                return false;
            }

            return true;
    });

}