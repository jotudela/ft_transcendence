import Fastify from "fastify";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import axios from "axios";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";

dotenv.config();

const fastify = Fastify({
  logger: {
    level: 'fatal',
  },
  ajv: {
    customOptions: { coerceTypes: false }
  }
});
const PORT = process.env.PORT || 3021;

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

// Endpoint de test
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'auth-service' }
})

// -----------------------------
// Lancer le serveur
// -----------------------------
async function start() {
  
  fastify.register(await import(path.resolve(__dirname, 'src/users/v1/routes.js')).then(m => m.default), { prefix: '/v1/users' });

  fastify.listen({ port: Number(PORT), host: "0.0.0.0" }).then(() => {
    console.log(`🚀 API running at http://localhost:${PORT}`);
  });
}

start().catch(console.error);