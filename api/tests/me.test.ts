import assert from 'node:assert/strict';
import {after, before, describe, it} from 'node:test';
import type {FastifyInstance} from 'fastify';
import {prisma} from '../src/config/prisma';
import {
	buildServer,
	createTestAccount,
	deleteTestAccounts,
	disconnectPrisma,
	getCsrf,
	login,
	type TestAccount,
} from './helpers';

describe('/me routes', () => {
	const EMAIL_PREFIX = 'route-tests+me+';

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

	describe('GET /me', () => {
		it('returns null without a session', async () => {
			const response = await server.inject({method: 'GET', url: '/me'});

			assert.equal(response.statusCode, 200);
			assert.deepEqual(response.json(), {ok: true, data: null});
		});

		it('returns the account for an active session', async () => {
			const {cookie} = await login(server, {
				email: account.email,
				password: account.password,
			});
			const response = await server.inject({method: 'GET', url: '/me', headers: {cookie}});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.id, account.id);
			assert.equal(body.data.name, account.name);
			assert.equal(body.data.email, account.email);
			assert.deepEqual(Object.keys(body.data).sort(), [
				'dateTimeCreated',
				'dateTimeUpdated',
				'email',
				'id',
				'name',
			]);
			assert.equal(typeof body.data.dateTimeCreated, 'string');
			assert.equal(typeof body.data.dateTimeUpdated, 'string');
		});
	});

	describe('PATCH /me', () => {
		it('rejects a request without a csrf token', async () => {
			const response = await server.inject({
				method: 'PATCH',
				url: '/me',
				headers: {'content-type': 'application/json'},
				payload: {name: 'Updated Name'},
			});

			assert.equal(response.statusCode, 403);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'FastifyError', message: 'Missing csrf secret'},
			});
		});

		it('rejects a request without authentication', async () => {
			const {cookie, token} = await getCsrf(server);
			const response = await server.inject({
				method: 'PATCH',
				url: '/me',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {name: 'Updated Name'},
			});

			assert.equal(response.statusCode, 401);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'UnauthorizedError', message: 'Unauthorized'},
			});
		});

		it('rejects an invalid body', async () => {
			const {cookie, token} = await login(server, {
				email: account.email,
				password: account.password,
			});
			const response = await server.inject({
				method: 'PATCH',
				url: '/me',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {newPassword: 'new-password-123'},
			});

			assert.equal(response.statusCode, 400);
			assert.equal(response.json().ok, false);
		});

		it('updates the account name', async () => {
			const {cookie, token} = await login(server, {
				email: account.email,
				password: account.password,
			});
			const response = await server.inject({
				method: 'PATCH',
				url: '/me',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {name: 'Updated Name'},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.id, account.id);
			assert.equal(body.data.name, 'Updated Name');
			assert.equal(body.data.email, account.email);

			const stored = await prisma.account.findUnique({
				where: {id: account.id},
				select: {name: true},
			});

			assert.equal(stored?.name, 'Updated Name');
		});

		it('rejects a password change with a wrong old password', async () => {
			const {cookie, token} = await login(server, {
				email: account.email,
				password: account.password,
			});
			const response = await server.inject({
				method: 'PATCH',
				url: '/me',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {oldPassword: 'wrong-password', newPassword: 'new-password-123'},
			});

			assert.equal(response.statusCode, 403);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'ForbiddenError', message: 'Invalid old password'},
			});
		});

		it('changes the password', async () => {
			const target = await createTestAccount(EMAIL_PREFIX);
			const {cookie, token} = await login(server, {
				email: target.email,
				password: target.password,
			});
			const response = await server.inject({
				method: 'PATCH',
				url: '/me',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {oldPassword: target.password, newPassword: 'new-password-123'},
			});

			assert.equal(response.statusCode, 200);
			assert.equal(response.json().ok, true);

			const oldPassword = await login(server, {
				email: target.email,
				password: target.password,
			});
			const newPassword = await login(server, {
				email: target.email,
				password: 'new-password-123',
			});

			assert.equal(oldPassword.response.statusCode, 401);
			assert.equal(newPassword.response.statusCode, 201);
		});

		it('rejects an email that already exists', async () => {
			const other = await createTestAccount(EMAIL_PREFIX);
			const {cookie, token} = await login(server, {
				email: account.email,
				password: account.password,
			});
			const response = await server.inject({
				method: 'PATCH',
				url: '/me',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {email: other.email},
			});

			assert.equal(response.statusCode, 409);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'ConflictError', message: 'A record with this value already exists.'},
			});
		});
	});
});
