import assert from 'node:assert/strict';
import {faker} from '@faker-js/faker';
import {test} from 'vitest';
import * as XLSX from 'xlsx';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /books', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	fixture.mock.book.count = async () => 1;
	fixture.mock.book.findMany = async () => [book];
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/books?title__contains=${encodeURIComponent(book.title)}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.total, 1);
	assert.equal(response.json().data.rows[0].id, book.id);
});

test('GET /books/:id', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	book._count.copies = 1;
	book.copies = [{id: faker.number.int({min: 1})}];
	fixture.mock.book.findUnique = async () => book;
	const response = await fixture.app.inject({method: 'GET', url: `/books/${book.id}`, headers});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.totalCopies, 1);
	assert.equal(response.json().data.available, true);
});

test('POST /books', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	fixture.mock.book.create = async () => book;
	const response = await fixture.app.inject({
		method: 'POST',
		url: '/books',
		headers,
		payload: {
			title: book.title,
			author: book.author,
			genre: book.genre,
			yearPublished: book.yearPublished,
		},
	});
	assert.equal(response.statusCode, 201, response.body);
	assert.equal(response.json().data.title, book.title);
});

test('PATCH /books/:id', async () => {
	const headers = await fixture.auth();
	const book = {...fixture.book(), title: faker.book.title()};
	fixture.mock.book.exists = async () => true;
	fixture.mock.book.update = async () => book;
	const response = await fixture.app.inject({
		method: 'PATCH',
		url: `/books/${book.id}`,
		headers,
		payload: {title: book.title},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.title, book.title);
});

test('DELETE /books/:id', async () => {
	const headers = await fixture.auth();
	fixture.mock.book.deleteMany = async () => ({count: 1});
	const response = await fixture.app.inject({
		method: 'DELETE',
		url: `/books/${faker.number.int({min: 1})}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(response.json(), {ok: true});
});

test('POST /books/export', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	fixture.mock.book.findMany = async () => [book];
	const response = await fixture.app.inject({method: 'POST', url: '/books/export', headers});
	assert.equal(response.statusCode, 200, response.body);
	const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
	assert.ok(
		XLSX.utils
			.sheet_to_json<{title: string}>(workbook.Sheets[workbook.SheetNames[0]])
			.some((row) => row.title === book.title),
	);
});
