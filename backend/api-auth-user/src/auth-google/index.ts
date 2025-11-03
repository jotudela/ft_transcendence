import { FastifyInstance } from 'fastify';
import googleAuth from './v1/google';

export default async function authGoogleRoutes(fastify: FastifyInstance, opts: any) {
    
    fastify.register(googleAuth, { prefix: '/v1' });

}