import assert from 'node:assert/strict';
import {after, before, describe, it} from 'node:test';
import type {FastifyInstance} from 'fastify';
import {buildServer} from './helpers';

describe('GET /health', () => {
	let server: FastifyInstance;

	before(async () => {
		server = await buildServer();
	});

	after(async () => {
		await server?.close();
	});

	it('returns ok', async () => {
		const response = await server.inject({method: 'GET', url: '/health'});

		assert.equal(response.statusCode, 200);
		assert.deepEqual(response.json(), {ok: true});
	});
});
