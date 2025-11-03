import Fastify from "fastify";
import argon2 from "argon2";
import dotenv from "dotenv";
import axios from "axios";
import { DeployBody2, LoginBody2, updateBody2 } from '../interfaces';
import { FastifyReply } from "fastify";
import speakeasy from "speakeasy";

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

async function registerUser(body: DeployBody2, reply: FastifyReply) {
  const { username, password, email, username_in_tournaments, sub } = body as {
    username: string;
    password: string;
    email: string;
    username_in_tournaments?: string;
    sub?: string;
  };

  const hashedPassword = await hashPassword(password);

   // Vérifie si un compte avec ce mail existe déjà
  try {
    const user = await axios.get(`http://api_bdd:3020/v1/users/by_email/${encodeURIComponent(email)}`);
    if (user.data.email)
      throw new Error("Email déjà pris");
  }
  catch (error: any) {
    if (error.response && error.response.status === 404){}
    else
      throw error;
  }

  const response = await axios.post("http://api_bdd:3020/v1/users/", {
    username,
    password: hashedPassword,
    email,
    username_in_tournaments,
    sub,
  });

  return response.data;
}

async function updateUser(body: updateBody2, reply: FastifyReply) {
  const { username, password, email, username_in_tournaments, two_fa_secret, is_fa_enabled } = body as {
    username?: string;
    password?: string;
    email?: string;
    username_in_tournaments?: string;
    two_fa_secret?: string;
    is_fa_enabled?: boolean;
  };

  let user: any;

  try {
    const res = await axios.get(`http://api_bdd:3020/v1/users/${body.id}`);
    user = res.data;

    if (!user)
      throw new Error("Utilisateur non trouvé");

    let hashedPassword = user.password;
    if (password)
        hashedPassword = await hashPassword(password);
    
    const updated = await axios.put(`http://api_bdd:3020/v1/users/${body.id}`, {
        username: username ?? user.username,
        password: hashedPassword,
        email: email ?? user.email,
        username_in_tournaments: username_in_tournaments ?? user.username_in_tournaments,
        twoFASecret: two_fa_secret ?? user.two_fa_secret,
        is2faEnabled: is_fa_enabled ?? user.is_fa_enabled,
    });

    return updated.data;
  }
  catch (error: any) {
    if (error.response && error.response.status === 404){}
    else
      throw error;
  }
}

async function loginUser(body: LoginBody2, reply: FastifyReply) {
  const { email, password, code } = body as {
    email: string;
    password: string;
    code: string;
  };

  let user: any;

  try {
    const res = await axios.get(`http://api_bdd:3020/v1/users/by_email/${encodeURIComponent(email)}`);
    user = res.data;

    if (!user)
      throw new Error("Utilisateur non trouvé");

    const passwordGoogle = process.env.PASSWORD_IF_GOOGLE_FIRST!;
    const onlyGoogle = await verifyPassword(passwordGoogle, user.password);

    if (onlyGoogle)
      throw new Error("Please connect with Google first, and set a new password after.");
  }
  catch (error: any) {
    if (error.response && error.response.status === 404){}
    else
      throw error;
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid)
    throw new Error("Mot de passe incorrect");

  // 2fa part
  if (code && user.two_fa_secret && user.is_fa_enabled) {
    try {
      if (!user?.two_fa_secret)
        throw new Error("2FA not enabled");

      const verified = speakeasy.totp.verify({
        secret: user.two_fa_secret,
        encoding: "base32",
        token: code,
        window: 1,
      });

      if (!verified)
        throw new Error("Invalid 2FA code");
    }
    catch (error: any) {
      if (error.response && error.response.status === 404){}
      else
        throw error;
    }
  }

  return user;
}

async function handlerUpdateTypesModels(
  type: 'username' | 'password' | 'email' | 'username_in_tournaments' | 'sub' | 'two_fa_secret' | 'is_fa_enabled',
  userId: number,
  data: string
) {
  try {
    if (type === "password") {
      data = await hashPassword(data);
    }

    const body: any = { [type]: data };

    const res = await axios.put(`http://api_bdd:3020/v1/users/${type}/${userId}`, { data });

    if (!res.data)
      throw new Error("update failed.");

    return res.data;
  }
  catch (error: any) {
    console.error(`❌ handlerUpdateTypesModels error [${type}] for user ${userId}:`, error.message);
    if (error.response) {
      console.error("API BDD error:", error.response.status, error.response.data);
      return null;
    }
    throw error;
  }
}

async function isGooglePassword(id: number) {
  let user: any;

  try {
    const res = await axios.get(`http://api_bdd:3020/v1/users/${id}`);
    user = res.data;

    if (!user)
      throw new Error("Utilisateur non trouvé");

    const passwordGoogle = process.env.PASSWORD_IF_GOOGLE_FIRST!;
    const onlyGoogle = await verifyPassword(passwordGoogle, user.password);

    if (onlyGoogle)
      return true;
    return false;
  }
  catch (err) {
    throw err;
  }
}

export const users_model = {
  registerUser,
  loginUser,
  updateUser,
  handlerUpdateTypesModels,
  isGooglePassword,
};