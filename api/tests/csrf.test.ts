import assert from 'node:assert/strict';
import {after, before, describe, it} from 'node:test';
import type {FastifyInstance} from 'fastify';
import {buildServer, getCsrf} from './helpers';

describe('CSRF', () => {
	let server: FastifyInstance;

	before(async () => {
		server = await buildServer();
	});

	after(async () => {
		await server?.close();
	});

	describe('GET /csrf', () => {
		it('returns a token', async () => {
			const response = await server.inject({method: 'GET', url: '/csrf'});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(typeof body.data.token, 'string');
			assert.notEqual(body.data.token, '');
		});

		it('sets a session cookie', async () => {
			const response = await server.inject({method: 'GET', url: '/csrf'});

			assert.equal(response.statusCode, 200);
			assert.ok(response.headers['set-cookie']);
		});

		it('issues a unique token per session', async () => {
			const first = await getCsrf(server);
			const second = await getCsrf(server);

			assert.notEqual(first.token, second.token);
		});
	});

	describe('csrf protection', () => {
		it('rejects requests without a csrf session cookie', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/sessions',
				headers: {'content-type': 'application/json'},
				payload: {email: 'unknown@library.test', password: 'password123'},
			});

			assert.equal(response.statusCode, 403);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'FastifyError', message: 'Missing csrf secret'},
			});
		});

		it('rejects requests with an invalid token', async () => {
			const {cookie} = await getCsrf(server);
			const response = await server.inject({
				method: 'POST',
				url: '/sessions',
				headers: {cookie, 'x-csrf-token': 'invalid-token', 'content-type': 'application/json'},
				payload: {email: 'unknown@library.test', password: 'password123'},
			});

			assert.equal(response.statusCode, 403);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'FastifyError', message: 'Invalid csrf token'},
			});
		});

		it('accepts requests with a valid token', async () => {
			const {cookie, token} = await getCsrf(server);
			const response = await server.inject({
				method: 'POST',
				url: '/sessions',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {email: 'unknown@library.test', password: 'password123'},
			});

			// The csrf check passes, so the request fails later on the unknown account instead.
			assert.equal(response.statusCode, 401);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'UnauthorizedError', message: 'Account not found'},
			});
		});
	});
});
