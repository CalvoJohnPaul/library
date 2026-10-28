import assert from 'node:assert/strict';
import {test} from 'vitest';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /stats', async () => {
	const anonymous = await fixture.app.inject({method: 'GET', url: '/stats'});
	assert.equal(anonymous.statusCode, 401);
	const headers = await fixture.auth();
	const book = await fixture.book();
	fixture.mock.book.count = async () => 1;
	fixture.mock.bookCopy.count = async () => 1;
	fixture.mock.member.count = async () => 0;
	fixture.mock.transaction.count = async () => 0;
	fixture.mock.transaction.findMany = async () => [];
	fixture.mock.book.findMany = async () => [{genre: book.genre, _count: {copies: 1}}];
	const response = await fixture.app.inject({method: 'GET', url: '/stats', headers});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.totalBooks, 1);
	assert.equal(response.json().data.totalBookCopies, 1);
});
