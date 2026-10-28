import assert from 'node:assert/strict';
import {test} from 'vitest';
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
});
