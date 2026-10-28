import assert from 'node:assert/strict';
import {test} from 'vitest';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /health', async () => {
	const response = await fixture.app.inject({method: 'GET', url: '/health'});
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json(), {ok: true});
});
