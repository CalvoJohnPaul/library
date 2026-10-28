import assert from 'node:assert/strict';
import {faker} from '@faker-js/faker';
import {test} from 'vitest';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /me', async () => {
	const anonymous = await fixture.app.inject({method: 'GET', url: '/me'});
	assert.equal(anonymous.statusCode, 200);
	assert.equal(anonymous.json().data, null);
	const headers = await fixture.auth();
	const response = await fixture.app.inject({method: 'GET', url: '/me', headers});
	assert.equal(response.statusCode, 200);
	assert.ok(response.json().data.id);
});

test('PATCH /me', async () => {
	const headers = await fixture.auth();
	const name = faker.person.fullName();
	fixture.mock.account.update = async () => ({
		id: 1,
		name,
		email: faker.internet.email(),
		dateTimeCreated: new Date(),
		dateTimeUpdated: new Date(),
	});
	const response = await fixture.app.inject({
		method: 'PATCH',
		url: '/me',
		headers,
		payload: {name},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.name, name);
});
