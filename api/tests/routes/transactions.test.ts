import assert from 'node:assert/strict';
import {test} from 'vitest';
import * as XLSX from 'xlsx';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /transactions', async () => {
	const headers = await fixture.auth();
	const row = fixture.transaction(fixture.member(), fixture.copy(fixture.book()));
	fixture.mock.transaction.count = async () => 1;
	fixture.mock.transaction.findMany = async () => [row];
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/transactions?ticket__eq=${row.ticket}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.total, 1);
	assert.equal(response.json().data.rows[0].id, row.id);
	assert.equal(response.json().data.rows[0].reservation, null);
});

test('GET /transactions/:id', async () => {
	const headers = await fixture.auth();
	const row = fixture.transaction(fixture.member(), fixture.copy(fixture.book()));
	fixture.mock.transaction.findUnique = async () => row;
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/transactions/${row.id}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.ticket, row.ticket);
	assert.equal(response.json().data.reservation, null);
});

test('GET /transactions/:id returns a reservation transaction without a copy', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	const row = {
		...fixture.transaction(fixture.member(), fixture.copy(book)),
		book: {
			id: book.id,
			title: book.title,
			genre: book.genre,
			author: book.author,
			yearPublished: book.yearPublished,
		},
		bookCopy: null,
		type: 'RESERVE',
	};
	fixture.mock.transaction.findUnique = async () => row;
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/transactions/${row.id}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.book.id, book.id);
	assert.equal(response.json().data.bookCopy, null);
});

test('GET /transactions and /transactions/:id expose the linked reservation', async () => {
	const headers = await fixture.auth();
	const row = {
		...fixture.transaction(fixture.member(), fixture.copy(fixture.book())),
		reservation: {id: 42, status: 'COMPLETED'},
	};
	fixture.mock.transaction.count = async () => 1;
	fixture.mock.transaction.findMany = async (args: {select: {reservation: unknown}}) => {
		assert.deepEqual(args.select.reservation, {select: {id: true, status: true}});
		return [row];
	};
	fixture.mock.transaction.findUnique = async (args: {select: {reservation: unknown}}) => {
		assert.deepEqual(args.select.reservation, {select: {id: true, status: true}});
		return row;
	};
	const list = await fixture.app.inject({method: 'GET', url: '/transactions', headers});
	assert.equal(list.statusCode, 200, list.body);
	assert.deepEqual(list.json().data.rows[0].reservation, row.reservation);
	const detail = await fixture.app.inject({method: 'GET', url: `/transactions/${row.id}`, headers});
	assert.equal(detail.statusCode, 200, detail.body);
	assert.deepEqual(detail.json().data.reservation, row.reservation);
});

test('GET /transactions lists reservation transactions by book', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	const row = {
		...fixture.transaction(fixture.member(), fixture.copy(book)),
		book,
		bookCopy: null,
		type: 'RESERVE',
	};
	fixture.mock.transaction.count = async () => 1;
	fixture.mock.transaction.findMany = async () => [row];
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/transactions?bookId__eq=${book.id}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.rows[0].book.id, book.id);
	assert.equal(response.json().data.rows[0].bookCopy, null);
});

test('POST /transactions/export', async () => {
	const headers = await fixture.auth();
	const row = fixture.transaction(fixture.member(), fixture.copy(fixture.book()));
	fixture.mock.transaction.findMany = async () => [row];
	const response = await fixture.app.inject({method: 'POST', url: '/transactions/export', headers});
	assert.equal(response.statusCode, 200, response.body);
	const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
	assert.ok(
		XLSX.utils
			.sheet_to_json<{ticket: string}>(workbook.Sheets[workbook.SheetNames[0]])
			.some((item) => item.ticket === row.ticket),
	);
});

test('POST /transactions/export includes reservation transactions', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	const row = {
		...fixture.transaction(fixture.member(), fixture.copy(book)),
		book,
		bookCopy: null,
		type: 'RESERVE',
	};
	fixture.mock.transaction.findMany = async () => [row];
	const response = await fixture.app.inject({method: 'POST', url: '/transactions/export', headers});
	assert.equal(response.statusCode, 200, response.body);
	const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
	assert.ok(
		XLSX.utils
			.sheet_to_json<{ticket: string; title: string}>(workbook.Sheets[workbook.SheetNames[0]])
			.some((item) => item.ticket === row.ticket && item.title === book.title),
	);
});
