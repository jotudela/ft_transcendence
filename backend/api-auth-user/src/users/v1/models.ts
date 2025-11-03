import Fastify from "fastify";
import argon2 from "argon2";
import dotenv from "dotenv";
import axios from "axios";
import { DeployBody1, LoginBody1 } from '../interfaces';
import { FastifyReply } from "fastify";

dotenv.config();

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: { coerceTypes: false }
  }
});

// Pepper (toujours dans une variable d'environnement en prod)
const PEPPER = process.env.PEPPER_KEY ? [process.env.PEPPER_KEY] : [];

// fonctions utilitaires
async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password + PEPPER);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await argon2.verify(hash, password + PEPPER);
}

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function registerUser(body: DeployBody1, reply: FastifyReply) {
  try {
    const { username, password, email, username_in_tournaments } = body as {
      username: string;
      password: string;
      email: string;
      username_in_tournaments?: string;
    };

    const hashedPassword = await hashPassword(password);

    // Vérifie si un compte avec ce mail existe déjà
    const users = await axios.get("http://api_bdd:3020/v1/users/all");
    const user = users.data.find((u: any) => u.email === email);

    if (user) {
      return reply.status(409).send({ error: "Email déjà pris." });
    }

    const response = await axios.post("http://api_bdd:3020/v1/users/", {
      username,
      password: hashedPassword,
      email,
      username_in_tournaments,
    });

    return reply.status(201).send({ message: "Utilisateur enregistré !", data: response.data });
  } catch (error: any) {
    return reply.code(500).send({ error: error.message });
  }
}

async function loginUser(body: LoginBody1, reply: FastifyReply) {
  try {
    const { email, password } = body as {
      email: string;
      password: string;
    };

    const response = await axios.get("http://api_bdd:3020/v1/users/all");
    const user = response.data.find((u: any) => u.email === email);

    if (!user) {
      return reply.status(401).send({ error: "Utilisateur non trouvé" });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return reply.status(401).send({ error: "Mot de passe incorrect" });
    }

    return reply.send({ message: "Connexion réussie" });
  } catch (error: any) {
    console.error(error);
    return reply.status(500).send({ error: error.message || "Erreur serveur" });
  }
}

export const users_model = {
  registerUser,
  loginUser,
};