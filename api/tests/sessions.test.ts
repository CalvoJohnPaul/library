import assert from 'node:assert/strict';
import {after, before, describe, it} from 'node:test';
import type {FastifyInstance} from 'fastify';
import {faker} from '@faker-js/faker';
import {
	buildServer,
	createTestAccount,
	deleteTestAccounts,
	disconnectPrisma,
	fakePassword,
	getCsrf,
	login,
	type TestAccount,
} from './helpers';

describe('session routes', () => {
	const EMAIL_PREFIX = 'route-tests+sessions+';

	let server: FastifyInstance;
	let account: TestAccount;

	before(async () => {
		server = await buildServer();
		await deleteTestAccounts(EMAIL_PREFIX);
		account = await createTestAccount(EMAIL_PREFIX);
	});

	after(async () => {
		await deleteTestAccounts(EMAIL_PREFIX);
		await disconnectPrisma();
		await server?.close();
	});

	describe('POST /sessions', () => {
		it('rejects an invalid body', async () => {
			const {cookie, token} = await getCsrf(server);
			const response = await server.inject({
				method: 'POST',
				url: '/sessions',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {email: 'not-an-email', password: ''},
			});

			assert.equal(response.statusCode, 400);
			assert.equal(response.json().ok, false);
		});

		it('rejects unknown credentials', async () => {
			const {cookie, token} = await getCsrf(server);
			const response = await server.inject({
				method: 'POST',
				url: '/sessions',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {
					email: faker.internet.email({provider: 'library.test'}),
					password: fakePassword(),
				},
			});

			assert.equal(response.statusCode, 401);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'UnauthorizedError', message: 'Account not found'},
			});
		});

		it('rejects a wrong password', async () => {
			const {cookie, token} = await getCsrf(server);
			const response = await server.inject({
				method: 'POST',
				url: '/sessions',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {email: account.email, password: fakePassword()},
			});

			assert.equal(response.statusCode, 401);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'UnauthorizedError', message: 'Account not found'},
			});
		});

		it('creates a session with valid credentials', async () => {
			const {response} = await login(server, {
				email: account.email,
				password: account.password,
			});

			assert.equal(response.statusCode, 201);
			assert.deepEqual(response.json(), {ok: true});
			assert.ok(response.headers['set-cookie']);
		});
	});

	describe('DELETE /session', () => {
		it('requires authentication', async () => {
			const {cookie, token} = await getCsrf(server);
			const response = await server.inject({
				method: 'DELETE',
				url: '/session',
				headers: {cookie, 'x-csrf-token': token},
			});

			assert.equal(response.statusCode, 401);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'UnauthorizedError', message: 'Unauthorized'},
			});
		});

		it('destroys an active session', async () => {
			const {cookie, token} = await login(server, {
				email: account.email,
				password: account.password,
			});
			const response = await server.inject({
				method: 'DELETE',
				url: '/session',
				headers: {cookie, 'x-csrf-token': token},
			});

			assert.equal(response.statusCode, 200);
			assert.deepEqual(response.json(), {ok: true});
		});
	});
});
