import { FastifyInstance } from 'fastify';
import ghStatsV1Routes from './v1/routes';

export default async function ghStatsRoutes(fastify: FastifyInstance, opts: any) {
	const db = opts.db;

	fastify.register(ghStatsV1Routes, { db });
}
