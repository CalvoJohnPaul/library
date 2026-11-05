import assert from 'node:assert/strict';
import {test} from 'vitest';
import type {Account} from '../../prisma/.generated/client.js';
import {sessionId} from '../../src/helpers/session.js';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('POST /sessions', async () => {
	const headers = await fixture.auth();
	const response = await fixture.app.inject({method: 'GET', url: '/me', headers});
	assert.equal(response.statusCode, 200);
	assert.ok(response.json().data.email);
});

test('DELETE /session', async () => {
	const headers = await fixture.auth();
	const response = await fixture.app.inject({method: 'DELETE', url: '/session', headers});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(response.json(), {ok: true});
	const cookie = response.cookies
		.map(({name, value}) => `${name}=${encodeURIComponent(value)}`)
		.join('; ');
	const me = await fixture.app.inject({method: 'GET', url: '/me', headers: {cookie}});
	assert.equal(me.json().data, null);
	const replay = await fixture.app.inject({method: 'GET', url: '/me', headers});
	assert.equal(replay.json().data, null);
});

test('logout revokes only the current device', async () => {
	const credentials = {id: 1, email: 'devices@example.com', password: 'original-password'};
	const first = await fixture.auth(credentials);
	const second = await fixture.auth(credentials);
	const logout = await fixture.app.inject({method: 'DELETE', url: '/session', headers: first});
	assert.equal(logout.statusCode, 200, logout.body);
	const replay = await fixture.app.inject({url: '/me', headers: first});
	assert.equal(replay.json().data, null);
	const otherDevice = await fixture.app.inject({url: '/me', headers: second});
	assert.equal(otherDevice.json().data.id, 1);
});

test('expired sessions cannot access protected data or /me', async () => {
	const headers = await fixture.auth();
	const findUnique = fixture.mock.session.findUnique;
	fixture.mock.session.findUnique = async (args) => {
		const session = await findUnique(args);
		assert.ok(session);
		return {...session, expiresAt: new Date(Date.now() - 1000)};
	};
	const protectedRoute = await fixture.app.inject({url: '/books', headers});
	assert.equal(protectedRoute.statusCode, 401);
	const me = await fixture.app.inject({url: '/me', headers});
	assert.equal(me.json().data, null);
});

test('legacy account-only and unknown session cookies do not authenticate', async () => {
	for (const data of [{account: 1}, {token: 'a'.repeat(64)}]) {
		const value = fixture.app.encodeSecureSession(fixture.app.createSecureSession(data));
		const headers = {cookie: `session=${encodeURIComponent(value)}`};
		const response = await fixture.app.inject({url: '/books', headers});
		assert.equal(response.statusCode, 401);
		const me = await fixture.app.inject({url: '/me', headers});
		assert.equal(me.json().data, null);
	}
});

test('password changes revoke every device and reject late sessions from the old version', async () => {
	const credentials = {id: 1, email: 'password@example.com', password: 'original-password'};
	const first = await fixture.auth(credentials);
	const second = await fixture.auth(credentials);
	const account = (await fixture.mock.account.findUnique()) as Account;
	fixture.mock.account.update = async ({
		data,
	}: {
		data: {password: string; sessionVersion: {increment: number}};
	}) => {
		account.password = data.password;
		account.sessionVersion += data.sessionVersion.increment;
		return account;
	};
	const changed = await fixture.app.inject({
		method: 'PATCH',
		url: '/me',
		headers: first,
		payload: {oldPassword: credentials.password, newPassword: 'replacement-password'},
	});
	assert.equal(changed.statusCode, 200, changed.body);
	const currentCookie = changed.cookies
		.map(({name, value}) => `${name}=${encodeURIComponent(value)}`)
		.join('; ');
	assert.notEqual(currentCookie, first.cookie);
	const current = await fixture.app.inject({url: '/me', headers: {cookie: currentCookie}});
	assert.equal(current.json().data.id, 1);
	for (const headers of [first, second]) {
		const me = await fixture.app.inject({url: '/me', headers});
		assert.equal(me.json().data, null);
		const protectedRoute = await fixture.app.inject({url: '/books', headers});
		assert.equal(protectedRoute.statusCode, 401);
	}
	const token = 'b'.repeat(64);
	await fixture.mock.session.create({
		data: {
			id: sessionId(token),
			accountId: 1,
			accountVersion: 0,
			expiresAt: new Date(Date.now() + 60_000),
		},
	});
	const value = fixture.app.encodeSecureSession(fixture.app.createSecureSession({token}));
	const lateLogin = await fixture.app.inject({
		url: '/me',
		headers: {cookie: `session=${encodeURIComponent(value)}`},
	});
	assert.equal(lateLogin.json().data, null);
});

test('incorrect old passwords do not revoke existing sessions', async () => {
	const headers = await fixture.auth();
	const changed = await fixture.app.inject({
		method: 'PATCH',
		url: '/me',
		headers,
		payload: {oldPassword: 'incorrect', newPassword: 'replacement-password'},
	});
	assert.equal(changed.statusCode, 403);
	const me = await fixture.app.inject({url: '/me', headers});
	assert.ok(me.json().data.id);
});
