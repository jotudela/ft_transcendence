import { FastifyInstance } from 'fastify';

// REMINDER : exemple for a version 2 endpoints for the same feature.

export default async function userV2Routes(fastify: FastifyInstance, opts: any) {
  fastify.get('/', async (request, reply) => {
    // Return a message for demonstration
    return { message: 'User API v2 - implement new logic here' };
  });
}
