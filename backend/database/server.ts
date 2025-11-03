import Fastify from "fastify";
import { db } from "./db";
import path from 'path';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { userApiDoc } from './doc';
import multipart from '@fastify/multipart';

console.log("Api_db v2025.10.15");

//----------------
//  Fastify init  
//----------------
const fastify = Fastify({
  logger: {
    level: 'fatal',
  },
  ajv: {        // needed for parsing and schemas for validations will stop the behavior of payloads 741="741"
    customOptions: { coerceTypes: false }
  }
});

fastify.register(multipart);

//----------------
//  Swagger init  
//----------------
fastify.register(swagger, {
  mode: 'static',
  specification: {
    document: userApiDoc
  }
});

fastify.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  transformSpecification: (swaggerObject, request, reply) => swaggerObject,
  transformSpecificationClone: true
});

//---------------------
//  API endpoints init  
//---------------------
async function start() {
  const db_conection = await db.connectDB();
  await db.initSchema(db_conection);

  //Users features endpoints. V1 real endpoints V2 just for exemple.
  fastify.register(await import(path.resolve(__dirname, './src/users/v1/routes')).then(m => m.default), { prefix: '/v1/users', db: db_conection });
  fastify.register(await import(path.resolve(__dirname, './src/users/v2/routes')).then(m => m.default), { prefix: '/v2/users', db: db_conection });

  // Users images
  fastify.register(await import(path.resolve(__dirname, './src/users_imgs/index.ts')).then(m => m.default), { prefix: '/v1/users_img', db: db_conection });
 
  // Game history feature:
  fastify.register(await import(path.resolve(__dirname, './src/games_history/v1/routes')).then(m => m.default), { prefix: '/v1/games_history', db: db_conection });
  
  // Tournaments
  fastify.register(await import(path.resolve(__dirname, './src/tournamentes/v1/routes')).then(m => m.default), { prefix: '/v1/tournamentes', db: db_conection });

  // Friendships
  fastify.register(await import(path.resolve(__dirname, './src/friendships/index')).then(m => m.default), { prefix: '/v1/friendships', db: db_conection });

  // stats
  fastify.register(await import(path.resolve(__dirname, './src/gh_stats/index.ts')).then(m => m.default), { prefix: '/v1/stats', db: db_conection });
  
  // users_online_status               DB__API_DB/src/users_online_status
  fastify.register(await import(path.resolve(__dirname, './src/users_online_status/index.ts')).then(m => m.default), { prefix: '/v1/user_online_status', db: db_conection });

  //DB__API_DB\src\gh_stats\index.ts
  await fastify.listen({ port: 3020, host: "0.0.0.0" });
  console.log("🚀 Serveur démarré sur http://localhost:3020");
}

start().catch(console.error);
