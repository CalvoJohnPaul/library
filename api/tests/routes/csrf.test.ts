import assert from 'node:assert/strict';
import {test} from 'vitest';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /csrf', async () => {
	const response = await fixture.app.inject({method: 'GET', url: '/csrf'});
	assert.equal(response.statusCode, 200);
	assert.ok(response.json().data.token);
	assert.ok(response.cookies.length > 0);
});
