import { FastifyPluginAsync } from "fastify";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { users_model } from "../../users/v2/models";
import axios from "axios";

const googleAuth: FastifyPluginAsync = async (fastify, opts) => {

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
  const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!;
  const GOOGLE_CALLBACK_URL_LINK = process.env.GOOGLE_CALLBACK_URL_LINK!;
  const NODE_ENV = process.env.NODE_ENV || "development";
  const GOOGLE_FIRST_PASSWORD = process.env.PASSWORD_IF_GOOGLE_FIRST!;

  const oauth2Client = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_CALLBACK_URL
  });

  function makeState() {
    return crypto.randomBytes(16).toString("hex");
  }
  

  // -----------------------------
  // Step 1 : redirect vers Google
  // -----------------------------
  fastify.get("/google", async (req, reply) => {
      const state = makeState();
      reply.setCookie("oauth_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: NODE_ENV === "production",
        path: "/",
        maxAge: 300
      });

      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "email", "profile"],
        prompt: "consent",
        state
      });

      return reply.redirect(url);
    });

    // -----------------------------
    // Step 2 : callback
    // -----------------------------
    fastify.get("/google/callback", async (req: any, reply: any) => {
    const { code, state, error } = req.query;
    const stateCookie = req.cookies?.oauth_state;

    if (!state || state !== stateCookie)
      return reply.status(400).send({ error: "Invalid state or code" });

    if (error === "access_denied") {
      reply.clearCookie("oauth_state", { path: "/" });
      return reply.type("text/html").send(`
        <!doctype html>
        <html>
          <body>
            <p>❌ Connexion annulée par l’utilisateur.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ error: "cancelled" }, "https://localhost:8443");
                window.close();
              }
            </script>
          </body>
        </html>
      `);
    }

    if (!code)
      return reply.status(400).send({ error: "Missing authorization code" });

    try {
      const { tokens } = await oauth2Client.getToken(code);

      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload)
        throw new Error("No user payload from Google");

      const googleEmail = String(payload.email);
      const googleSub = String(payload.sub);
      const googleName = String(payload.name);

      let dbUser = null;

      try {
        const res = await axios.get(`http://api_bdd:3020/v1/users/by_email/${encodeURIComponent(googleEmail)}`);
        dbUser = res.data;
      }
      catch (err: any) {
        if (!(axios.isAxiosError(err) && err.response?.status === 404))
          throw err;
      }

      try {
        const response = await axios.get("http://api_bdd:3020/v1/users/all");
        dbUser = response.data.find((u: any) => u.sub === googleSub);
      }
      catch (err: any) {
        if (!(axios.isAxiosError(err) && err.response?.status === 404))
          throw err;
      }

      try {
        const response = await axios.get("http://api_bdd:3020/v1/users/all");
        dbUser = response.data.find((u: any) => u.username === googleName);
      }
      catch (err: any) {
        if (!(axios.isAxiosError(err) && err.response?.status === 404))
          throw err;
      }

      if (!dbUser) {
        dbUser = await users_model.registerUser(
          {
            username: googleName,
            email: googleEmail,
            sub: googleSub,
            password: GOOGLE_FIRST_PASSWORD,
          }, reply);
        
        if (!dbUser)
          throw new Error("Can't create new user.");
      }
      else {
        if (!dbUser.sub) {
          await users_model.handlerUpdateTypesModels("sub", dbUser.id, googleSub);
          dbUser.sub = googleSub;
        }
        else if (dbUser.sub !== googleSub)
          throw new Error("Ce compte Google est déjà associé à un autre utilisateur.");

        if (dbUser.email !== googleEmail) {
          await users_model.handlerUpdateTypesModels("email", dbUser.id, googleEmail);
          dbUser.email = googleEmail;
        }

        if (dbUser.username !== googleName) {
          await users_model.handlerUpdateTypesModels("username", dbUser.id, googleName);
          dbUser.username = googleName;
        }
      }

      let userStatus;
      try {
        const verfiStatus = await axios.get("http://api_bdd:3020/v1/user_online_status/global/latest_statuses");
        userStatus = verfiStatus.data.find((u: any) => u.user_id === dbUser.id);
      } catch (err) {
        console.warn("⚠️ Failed to fetch user statuses, defaulting to offline");
        userStatus = undefined;
      }

      if (!userStatus || userStatus.status === "offline") {
        const status = "online";
        const url = `http://api_bdd:3020/v1/user_online_status/add/${dbUser.id}`;
        try {
          await axios.post(url, { status }, { headers: { "Content-Type": "application/json" } });
        } catch (err: any) {
          console.error("Failed to update/create user status:", err.response?.data || err.message);
        }
      }

      const accessToken = fastify.jwt.sign({ id: dbUser.id }, { expiresIn: "15m" });
      const refreshToken = fastify.jwt.sign({ id: dbUser.id }, { expiresIn: "7d" });

      reply
        .setCookie("session_token", refreshToken, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: true,
        })
        .clearCookie("oauth_state", { path: "/" });

      return reply.type("text/html").send(`
        <!doctype html>
        <html>
        <body>
          <p>Connexion réussie ✅ Vous pouvez fermer cette fenêtre.</p>
          <script>
            (function() {
              const token = ${JSON.stringify(accessToken)};
              if (window.opener) {
                window.opener.postMessage({ token }, "https://localhost:8443");
                window.close();
              }
            })();
          </script>
        </body>
        </html>
      `);
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: "OAuth failed" });
    }
  });

  fastify.get("/google/link", async (req: any, reply) => {
    const token = req.query.token;
    if (!token)
      return reply.status(401).send();
    const payload = await fastify.jwt.verify(token) as { id: string };

    let dbUser;
    try {
      const res = await axios.get(`http://api_bdd:3020/v1/users/${payload.id}`);
      dbUser = res.data;
    } catch (err: any) {
      return reply.status(401).send({ error: "Utilisateur inconnu" });
    }

    const stateObj = {
      csrf: makeState(),
      userId: dbUser.id
    };

    const state = JSON.stringify(stateObj);

    reply.setCookie("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: NODE_ENV === "production",
      path: "/",
      maxAge: 300
    });

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "consent",
      state,
      redirect_uri: GOOGLE_CALLBACK_URL_LINK
    });

    return reply.redirect(url);
  });


  fastify.get("/google/link/callback", async (req: any, reply) => {
    const { code, state, error } = req.query;
    const stateCookie = req.cookies?.oauth_state;

    if (!code || !state || state !== stateCookie) {
      return reply.status(400).send({ error: "Invalid state or code" });
    }

    let parsedState;
    try {
      parsedState = JSON.parse(state);
    }
    catch {
      return reply.status(400).send({ error: "Invalid state format" });
    }

    if (error === "access_denied") {
      reply.clearCookie("oauth_state", { path: "/" });
      return reply.type("text/html").send(`
        <!doctype html>
        <html>
          <body>
            <p>❌ Symchronisation annulée par l’utilisateur.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ error: "cancelled" }, "https://localhost:8443");
                window.close();
              }
            </script>
          </body>
        </html>
      `);
    }

    const userId = parsedState.userId;
    const csrf = parsedState.csrf;

    if (!csrf || !stateCookie.includes(csrf))
      return reply.status(400).send({ error: "Invalid CSRF token" });

    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: GOOGLE_CALLBACK_URL_LINK,
    });

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload)
      throw new Error("No user payload from Google");

    const googleEmail = String(payload.email);
    const googleSub = String(payload.sub);
    const googleName = String(payload.name);

    let dbUser = null;

    try {

      try {
        const res = await axios.get(`http://api_bdd:3020/v1/users/${Number(userId)}`);
        dbUser = res.data;
      }
      catch (err: any) {
        if (!(axios.isAxiosError(err) && err.response?.status === 404))
          throw err;
      }

      if (!dbUser.sub) {
        await users_model.handlerUpdateTypesModels("sub", dbUser.id, googleSub);
        dbUser.sub = googleSub;
      }
      else if (dbUser.sub !== googleSub)
        throw new Error("Ce compte Google est déjà associé à un autre utilisateur.");
  
      if (dbUser.email !== googleEmail) {
        await users_model.handlerUpdateTypesModels("email", dbUser.id, googleEmail);
        dbUser.email = googleEmail;
      }
  
      if (dbUser.username !== googleName) {
        await users_model.handlerUpdateTypesModels("username", dbUser.id, googleName);
        dbUser.username = googleName;
      }
      const accessToken = fastify.jwt.sign({ id: dbUser.id }, { expiresIn: "15m" });
      const refreshToken = fastify.jwt.sign({ id: dbUser.id }, { expiresIn: "7d" });
  
      reply
        .setCookie("session_token", refreshToken, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: true,
        })
        .clearCookie("oauth_state", { path: "/" });

      return reply.type("text/html").send(`
        <!doctype html>
        <html>
        <body>
          <p>Synchronisation réussie ✅ Vous pouvez fermer cette fenêtre.</p>
          <script>
            (function() {
              const token = ${JSON.stringify(accessToken)};
              if (window.opener) {
                window.opener.postMessage({ token }, "https://localhost:8443");
                window.close();
              }
            })();
          </script>
        </body>
        </html>
      `);
    }
    catch (err: any) {
      req.log.error(err);

      let errorMessage = "Erreur lors de la synchronisation Google.";
      if (err.message?.includes("409")) {
        errorMessage = "Ce compte Google est déjà associé à un autre utilisateur.";
      } else if (err.message?.includes("OAuth failed")) {
        errorMessage = "Échec de la synchronisation OAuth.";
      }

      return reply.type("text/html; charset=utf-8").send(`
        <!doctype html>
        <html>
          <body>
            <p>❌ ${errorMessage}</p>
            <script>
              (function() {
                if (window.opener) {
                  window.opener.postMessage({ error: "failed", message: ${JSON.stringify(errorMessage)} }, "https://localhost:8443");
                  window.close();
                }
              })();
            </script>
          </body>
        </html>
      `);
    }
  });

  // -----------------------------
  // Logout
  // -----------------------------
  fastify.post("/logout", async (req, reply) => {
    reply.clearCookie("session_token", { path: "/" });
    return { ok: true };
  });
};

export default googleAuth;