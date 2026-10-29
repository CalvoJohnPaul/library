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

test('GET /books availability depends on AVAILABLE copies, not reservations', async () => {
	const headers = await fixture.auth();
	const book = {...fixture.book(), copies: [{id: 1}], reservations: [{id: 2}]};
	fixture.mock.book.count = async () => 1;
	fixture.mock.book.findMany = async (args: {
		select: {reservations?: unknown; copies: unknown};
	}) => {
		assert.equal(args.select.reservations, undefined);
		assert.deepEqual(args.select.copies, {
			where: {status: 'AVAILABLE'},
			select: {id: true},
			take: 1,
		});
		return [book];
	};
	const list = await fixture.app.inject({method: 'GET', url: '/books', headers});
	assert.equal(list.statusCode, 200, list.body);
	assert.equal(list.json().data.rows[0].available, true);
	fixture.mock.book.findUnique = async (args: {
		select: {reservations?: unknown; copies: unknown};
	}) => {
		assert.equal(args.select.reservations, undefined);
		assert.deepEqual(args.select.copies, {
			where: {status: 'AVAILABLE'},
			select: {id: true},
			take: 1,
		});
		return book;
	};
	const detail = await fixture.app.inject({method: 'GET', url: `/books/${book.id}`, headers});
	assert.equal(detail.statusCode, 200, detail.body);
	assert.equal(detail.json().data.available, true);
});

test('GET /books does not count RESERVED or BORROWED copies as available', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	book._count.copies = 2;
	fixture.mock.book.count = async () => 1;
	fixture.mock.book.findMany = async () => [book];
	const list = await fixture.app.inject({method: 'GET', url: '/books', headers});
	assert.equal(list.statusCode, 200, list.body);
	assert.equal(list.json().data.rows[0].totalCopies, 2);
	assert.equal(list.json().data.rows[0].available, false);
	fixture.mock.book.findUnique = async () => book;
	const detail = await fixture.app.inject({method: 'GET', url: `/books/${book.id}`, headers});
	assert.equal(detail.statusCode, 200, detail.body);
	assert.equal(detail.json().data.available, false);
});

test('GET /books availability filters only count AVAILABLE copies', async () => {
	const headers = await fixture.auth();
	const queries: unknown[] = [];
	fixture.mock.book.count = async (args: {where: unknown}) => {
		queries.push(args.where);
		return 0;
	};
	fixture.mock.book.findMany = async () => [];
	for (const [query, expected] of [
		['available__eq=true', true],
		['available__eq=false', false],
		['available__neq=true', false],
		['available__neq=false', true],
	] as const) {
		const response = await fixture.app.inject({method: 'GET', url: `/books?${query}`, headers});
		assert.equal(response.statusCode, 200, response.body);
		const where = queries.at(-1) as {copies: unknown};
		assert.deepEqual(
			where.copies,
			expected ? {some: {status: 'AVAILABLE'}} : {none: {status: 'AVAILABLE'}},
		);
	}
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
	const book = {...fixture.book(), title: faker.book.title(), copies: [{id: 1}]};
	fixture.mock.book.exists = async () => true;
	fixture.mock.book.update = async (args: {select: {reservations?: unknown; copies: unknown}}) => {
		assert.equal(args.select.reservations, undefined);
		assert.deepEqual(args.select.copies, {
			where: {status: 'AVAILABLE'},
			select: {id: true},
			take: 1,
		});
		return book;
	};
	const response = await fixture.app.inject({
		method: 'PATCH',
		url: `/books/${book.id}`,
		headers,
		payload: {title: book.title},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.title, book.title);
	assert.equal(response.json().data.available, true);
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

test('POST /books/export reports availability from copies only', async () => {
	const headers = await fixture.auth();
	const book = {...fixture.book(), copies: [{id: 1}], reservations: [{id: 2}]};
	fixture.mock.book.findMany = async (args: {select: {reservations?: unknown}}) => {
		assert.equal(args.select.reservations, undefined);
		return [book];
	};
	const response = await fixture.app.inject({method: 'POST', url: '/books/export', headers});
	assert.equal(response.statusCode, 200, response.body);
	const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
	const rows = XLSX.utils.sheet_to_json<{available: boolean}>(
		workbook.Sheets[workbook.SheetNames[0]],
	);
	assert.equal(rows[0].available, true);
});

test('POST /books/export filters availability by copy status only', async () => {
	const headers = await fixture.auth();
	const queries: unknown[] = [];
	fixture.mock.book.findMany = async (args: {where: unknown}) => {
		queries.push(args.where);
		return [];
	};
	for (const [query, expected] of [
		['available__eq=true', {some: {status: 'AVAILABLE'}}],
		['available__eq=false', {none: {status: 'AVAILABLE'}}],
		['available__neq=true', {none: {status: 'AVAILABLE'}}],
		['available__neq=false', {some: {status: 'AVAILABLE'}}],
	] as const) {
		const response = await fixture.app.inject({
			method: 'POST',
			url: `/books/export?${query}`,
			headers,
		});
		assert.equal(response.statusCode, 200, response.body);
		assert.deepEqual(queries.at(-1), {copies: expected});
	}
});
