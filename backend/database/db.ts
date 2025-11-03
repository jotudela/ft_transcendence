import { Database } from "sqlite";
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const fs = require("fs");

// Connexion à la base
async function connectDB(): Promise<Database> {
  return open({
    filename: "./ma_base.db",
    driver: sqlite3.Database,
  });
}

// Initialisation du schéma
async function initSchema(db: Database) {
  try {
    const schema = fs.readFileSync("./db/schema.sql", "utf8");
    await db.exec(schema);
    console.log("✅ Base de données initialisée");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du schéma:", error);
    throw error;
  }
}

export const db = {
  connectDB,
  initSchema
};