import assert from 'node:assert/strict';
import {test} from 'vitest';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /search requires authentication', async () => {
	const response = await fixture.app.inject({method: 'GET', url: '/search?q=book'});
	assert.equal(response.statusCode, 401, response.body);
});

test('GET /search returns an empty list for a missing or blank query without searching', async () => {
	const headers = await fixture.auth();
	for (const url of ['/search', '/search?q=', '/search?q=%20%20']) {
		const response = await fixture.app.inject({method: 'GET', url, headers});
		assert.equal(response.statusCode, 200, response.body);
		assert.deepEqual(response.json(), {ok: true, data: []});
	}
});

test('GET /search searches all fields with escaped, ranked matches and a global limit', async () => {
	const headers = await fixture.auth();
	fixture.mock.$queryRaw = async (strings: TemplateStringsArray, ...values: unknown[]) => {
		const sql = strings.join('?');
		for (const field of [
			'b.title',
			'b.author',
			'c.isbn',
			'm."externalId"',
			'm.name',
			'r.ticket',
			't.ticket',
		]) {
			assert.ok(sql.includes(`${field} ILIKE`), field);
		}
		assert.match(sql, /FROM "BookCopy" c JOIN "Book" b ON b\.id = c\."bookId"/);
		assert.match(sql, /GROUP BY type, id\s+ORDER BY MIN\(score\), MAX\(created\) DESC/);
		assert.match(sql, /LIMIT \?/);
		assert.equal(values.at(-1), 25);
		for (let i = 0; i < values.length - 1; i += 3) {
			assert.deepEqual(values.slice(i, i + 3), ['A\\%\\_\\\\', 'A\\%\\_\\\\%', '%A\\%\\_\\\\%']);
		}
		return [];
	};
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/search?q=${encodeURIComponent(' A%_\\ ')}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(response.json(), {ok: true, data: []});
});

test('GET /search returns compact results in ranked order, not model query order', async () => {
	const headers = await fixture.auth();
	const firstBook = {id: 10, title: 'First', author: 'Author'};
	const secondBook = {id: 11, title: 'Second', author: 'Author'};
	const member = {id: 20, externalId: 'M-20', name: 'Member'};
	const reservation = {id: 30, ticket: 'R-30', status: 'PENDING'};
	const transaction = {id: 40, ticket: 'T-40', type: 'BORROW', status: 'COMPLETED'};
	fixture.mock.$queryRaw = async () => [
		{type: 'TRANSACTION', id: 40},
		{type: 'BOOK', id: 10},
		{type: 'RESERVATION', id: 30},
		{type: 'MEMBER', id: 20},
		{type: 'BOOK', id: 11},
	];
	fixture.mock.book.findMany = async (args: {where: unknown; select: unknown}) => {
		assert.deepEqual(args, {
			where: {id: {in: [10, 11]}},
			select: {id: true, title: true, author: true},
		});
		return [secondBook, firstBook];
	};
	fixture.mock.member.findMany = async (args: {where: unknown; select: unknown}) => {
		assert.deepEqual(args, {
			where: {id: {in: [20]}},
			select: {id: true, externalId: true, name: true},
		});
		return [member];
	};
	fixture.mock.reservation.findMany = async (args: {where: unknown; select: unknown}) => {
		assert.deepEqual(args, {
			where: {id: {in: [30]}},
			select: {id: true, status: true, ticket: true},
		});
		return [reservation];
	};
	fixture.mock.transaction.findMany = async (args: {where: unknown; select: unknown}) => {
		assert.deepEqual(args, {
			where: {id: {in: [40]}},
			select: {id: true, type: true, status: true, ticket: true},
		});
		return [transaction];
	};
	const response = await fixture.app.inject({method: 'GET', url: '/search?q=sample', headers});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(response.json(), {
		ok: true,
		data: [
			{type: 'TRANSACTION', data: transaction},
			{type: 'BOOK', data: firstBook},
			{type: 'RESERVATION', data: reservation},
			{type: 'MEMBER', data: member},
			{type: 'BOOK', data: secondBook},
		],
	});
});

test('GET /search skips model queries for types without matches', async () => {
	const headers = await fixture.auth();
	const book = {id: 42, title: 'Title', author: 'Author'};
	fixture.mock.$queryRaw = async () => [{type: 'BOOK', id: 42}];
	fixture.mock.book.findMany = async () => [book];
	const response = await fixture.app.inject({method: 'GET', url: '/search?q=title', headers});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(response.json().data, [{type: 'BOOK', data: book}]);
});

test('GET /search ranks and loads records in a repeatable-read transaction', async () => {
	const headers = await fixture.auth();
	const originalTransaction = fixture.mock.$transaction;
	let inTransaction = false;
	fixture.mock.$transaction = async (input: unknown, options?: unknown) => {
		assert.deepEqual(options, {isolationLevel: 'RepeatableRead'});
		inTransaction = true;
		try {
			return await originalTransaction(input);
		} finally {
			inTransaction = false;
		}
	};
	try {
		fixture.mock.$queryRaw = async () => {
			assert.equal(inTransaction, true);
			return [{type: 'BOOK', id: 42}];
		};
		fixture.mock.book.findMany = async () => {
			assert.equal(inTransaction, true);
			return [{id: 42, title: 'Title', author: 'Author'}];
		};
		const response = await fixture.app.inject({method: 'GET', url: '/search?q=title', headers});
		assert.equal(response.statusCode, 200, response.body);
		assert.equal(inTransaction, false);
		assert.deepEqual(response.json().data, [
			{type: 'BOOK', data: {id: 42, title: 'Title', author: 'Author'}},
		]);
	} finally {
		fixture.mock.$transaction = originalTransaction;
	}
});
