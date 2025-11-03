import Fastify from "fastify";
import dotenv from "dotenv";
import path from "path";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart"

dotenv.config();

const PORT = Number(process.env.PORT);

const fastify = Fastify({
  logger: {
    level: 'fatal',
  },
  ajv: {
    customOptions: { coerceTypes: false }
  }
});

// -----------------------------
// CORS
// -----------------------------
fastify.register(fastifyCors, {
  origin: ["http://localhost:3000"], // le frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// Secret pour les access tokens
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "supersecret",
  sign: { expiresIn: "15m" }, // access token 15 minutes
  cookie: {
    cookieName: "session_token",
    signed: false,
  },
});

fastify.register(fastifyCookie);

fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 2 * 1024 * 1024 // max 2 MB
  }
});

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Endpoint de test
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'auth-service' }
})

fastify.get("/me", async (request: any, reply: any) => {
  try {
    await request.jwtVerify(); // vérifie le token
    return { ok: true }; // contient le payload du JWT
  } catch (err) {
    return reply.status(401).send({ ok: false });
  }
});

// -----------------------------
// Lancer le serveur
// -----------------------------
async function start() {
  
  const module1 = await import("./src/users/v1/routes");
  fastify.register(module1.default, { prefix: "/v1/users" });

  const module2 = await import("./src/users/v2/routes");
  fastify.register(module2.default, { prefix: "/v2/users" });

  const googleAuthModule = await import("./src/auth-google/v1/google");
  fastify.register(googleAuthModule.default, { prefix: "/v1/auth" });

  fastify.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
    console.log(`🚀 API running at http://localhost:${PORT}`);
  });
}

start().catch(console.error);