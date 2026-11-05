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

test('GET /transactions and /transactions/:id keep the transaction copy ahead of the reservation copy', async () => {
	const headers = await fixture.auth();
	const copy = fixture.copy(fixture.book());
	const row = {
		...fixture.transaction(fixture.member(), copy),
		reservation: {
			id: 42,
			status: 'PENDING',
			bookCopy: {...fixture.copy(fixture.book()), status: 'RESERVED'},
		},
	};
	const reservationSelect = {
		select: {
			id: true,
			status: true,
			bookCopy: {
				select: {
					id: true,
					isbn: true,
					status: true,
					book: {select: {id: true, title: true, genre: true, author: true, yearPublished: true}},
				},
			},
		},
	};
	fixture.mock.transaction.count = async () => 1;
	fixture.mock.transaction.findMany = async (args: {select: {reservation: unknown}}) => {
		assert.deepEqual(args.select.reservation, reservationSelect);
		return [row];
	};
	fixture.mock.transaction.findUnique = async (args: {select: {reservation: unknown}}) => {
		assert.deepEqual(args.select.reservation, reservationSelect);
		return row;
	};
	const list = await fixture.app.inject({method: 'GET', url: '/transactions', headers});
	assert.equal(list.statusCode, 200, list.body);
	assert.deepEqual(list.json().data.rows[0].reservation, {id: 42, status: 'PENDING'});
	assert.equal(list.json().data.rows[0].bookCopy.id, copy.id);
	assert.equal(list.json().data.rows[0].bookCopy.isbn, copy.isbn);
	const detail = await fixture.app.inject({method: 'GET', url: `/transactions/${row.id}`, headers});
	assert.equal(detail.statusCode, 200, detail.body);
	assert.deepEqual(detail.json().data.reservation, {id: 42, status: 'PENDING'});
	assert.equal(detail.json().data.bookCopy.id, copy.id);
	assert.equal(detail.json().data.bookCopy.isbn, copy.isbn);
});

test('transaction responses fall back to the assigned reservation copy, or null when unassigned', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	const assigned = {...fixture.copy(book), status: 'RESERVED'};
	for (const bookCopy of [assigned, null]) {
		const row = {
			...fixture.transaction(fixture.member(), fixture.copy(book)),
			type: 'RESERVE',
			book,
			bookCopy: null,
			reservation: {id: 42, status: 'PENDING', bookCopy},
		};
		fixture.mock.transaction.count = async () => 1;
		fixture.mock.transaction.findMany = async () => [row];
		fixture.mock.transaction.findUnique = async () => row;
		const list = await fixture.app.inject({url: '/transactions', headers});
		const detail = await fixture.app.inject({url: `/transactions/${row.id}`, headers});
		assert.equal(list.statusCode, 200, list.body);
		assert.equal(detail.statusCode, 200, detail.body);
		for (const data of [list.json().data.rows[0], detail.json().data]) {
			assert.deepEqual(data.reservation, {id: 42, status: 'PENDING'});
			if (bookCopy) {
				assert.equal(data.bookCopy.id, bookCopy.id);
				assert.equal(data.bookCopy.isbn, bookCopy.isbn);
				assert.equal(data.bookCopy.status, 'RESERVED');
				assert.equal(data.bookCopy.book.id, book.id);
			} else {
				assert.equal(data.bookCopy, null);
			}
		}
	}
});

test('transaction exports use the same copy fallback and preserve transaction copies', async () => {
	const headers = await fixture.auth();
	const book = fixture.book();
	const assigned = {...fixture.copy(book), status: 'RESERVED'};
	const original = {...fixture.copy(book), status: 'BORROWED'};
	for (const bookCopy of [original, null]) {
		const row = {
			...fixture.transaction(fixture.member(), original),
			bookCopy,
			reservation: {id: 42, status: 'PENDING', bookCopy: assigned},
		};
		fixture.mock.transaction.findMany = async () => [row];
		const response = await fixture.app.inject({
			method: 'POST',
			url: '/transactions/export',
			headers,
		});
		assert.equal(response.statusCode, 200);
		const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
		const [data] = XLSX.utils.sheet_to_json<{bookCopyId: number; isbn: string; bookStatus: string}>(
			workbook.Sheets[workbook.SheetNames[0]],
		);
		const expected = bookCopy ?? assigned;
		assert.equal(data.bookCopyId, expected.id);
		assert.equal(data.isbn, expected.isbn);
		assert.equal(data.bookStatus, expected.status);
	}
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
