import assert from 'node:assert/strict';
import {faker} from '@faker-js/faker';
import {BookStatsDefinition} from '@library/types';
import {test, vi} from 'vitest';
import * as XLSX from 'xlsx';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /books/:id/stats requires authentication', async () => {
	const response = await fixture.app.inject({url: '/books/1/stats'});
	assert.equal(response.statusCode, 401, response.body);
});

test('GET /books/:id/stats rejects invalid book IDs', async () => {
	const headers = await fixture.auth();
	for (const id of ['0', '-1', '1.5', 'invalid']) {
		const response = await fixture.app.inject({url: `/books/${id}/stats`, headers});
		assert.equal(response.statusCode, 400, response.body);
	}
});

test('GET /books/:id/stats returns 404 for a missing book', async () => {
	const headers = await fixture.auth();
	fixture.mock.book.exists = async (where: unknown) => {
		assert.deepEqual(where, {id: 1});
		return false;
	};
	const response = await fixture.app.inject({url: '/books/1/stats', headers});
	assert.equal(response.statusCode, 404, response.body);
});

test('GET /books/:id/stats returns zero counts and complete empty activity windows', async () => {
	const headers = await fixture.auth();
	fixture.mock.book.exists = async () => true;
	fixture.mock.bookCopy.count = async () => 0;
	fixture.mock.reservation.count = async () => 0;
	fixture.mock.transaction.count = async () => 0;
	fixture.mock.transaction.findMany = async () => [];

	const response = await fixture.app.inject({url: '/books/1/stats', headers});
	assert.equal(response.statusCode, 200, response.body);
	const data = BookStatsDefinition.parse(response.json().data);
	assert.equal(data.totalBookCopies, 0);
	assert.equal(data.totalAvailableCopies, 0);
	assert.equal(data.totalOutstandingBorrows, 0);
	assert.equal(data.totalPendingReservations, 0);
	assert.equal(data.totalReadyToClaimReservations, 0);
	assert.deepEqual(data.monthOverMonth, {
		newCopies: {current: 0, previous: 0},
		borrows: {current: 0, previous: 0},
	});
	assert.deepEqual(data.topBorrowedMembersThisMonth, []);
	assert.equal(data.last14DaysActivity.length, 14);
	assert.equal(data.last7DaysReservationActivity.length, 7);
	assert.ok(
		data.last14DaysActivity.every(
			(point) => point.totalBooksBorrowed === 0 && point.totalBooksReturned === 0,
		),
	);
	assert.ok(
		data.last7DaysReservationActivity.every(
			(point) => point.totalBooksReserved === 0 && point.totalBooksUnreserved === 0,
		),
	);
});

test('GET /books/:id/stats scopes counts, activity, monthly comparisons and member rankings to the book', async ({
	onTestFinished,
}) => {
	vi.useFakeTimers({toFake: ['Date']});
	vi.setSystemTime(new Date(2026, 10, 15, 12));
	onTestFinished(() => vi.useRealTimers());
	const headers = await fixture.auth();
	const bookId = 42;
	const startOfMonth = new Date(2026, 10, 1);
	const startOfLastMonth = new Date(2026, 9, 1);
	const startOfLast14Days = new Date(2026, 10, 2);
	const startOfLast7Days = new Date(2026, 10, 9);
	fixture.mock.book.exists = async (where: unknown) => {
		assert.deepEqual(where, {id: bookId});
		return true;
	};
	fixture.mock.bookCopy.count = async ({
		where,
	}: {
		where: {bookId: number; status?: string; dateTimeCreated?: {gte: Date; lt?: Date}};
	}) => {
		assert.equal(where.bookId, bookId);
		if (where.dateTimeCreated) {
			if (where.dateTimeCreated.lt) {
				assert.deepEqual(where, {
					bookId,
					dateTimeCreated: {gte: startOfLastMonth, lt: startOfMonth},
				});
				return 2;
			}
			assert.deepEqual(where, {bookId, dateTimeCreated: {gte: startOfMonth}});
			return 3;
		}
		if (where.status) {
			assert.ok(['AVAILABLE', 'BORROWED'].includes(where.status));
			assert.deepEqual(where, {bookId, status: where.status});
			return where.status === 'AVAILABLE' ? 4 : 5;
		}
		assert.deepEqual(where, {bookId});
		return 10;
	};
	fixture.mock.reservation.count = async ({where}: {where: {bookCopy?: unknown}}) => {
		if (where.bookCopy) {
			assert.deepEqual(where, {bookId, status: 'PENDING', bookCopy: {is: {status: 'RESERVED'}}});
			return 1;
		}
		assert.deepEqual(where, {bookId, status: 'PENDING'});
		return 3;
	};
	fixture.mock.transaction.count = async (args: unknown) => {
		assert.deepEqual(args, {
			where: {
				bookCopy: {is: {bookId}},
				type: 'BORROW',
				dateTimeCreated: {gte: startOfLastMonth, lt: startOfMonth},
			},
		});
		return 8;
	};
	const members = ['Zulu', 'Yankee', 'Bravo', 'Alpha', 'Charlie', 'Delta', 'Echo'].map(
		(name, index) => ({id: index + 1, name, externalId: `MEM-${index + 1}`}),
	);
	const memberRows = [
		members[0],
		members[0],
		members[1],
		members[1],
		members[1],
		...members.slice(2),
	].map((member) => ({member}));
	fixture.mock.transaction.findMany = async (args: {
		where: {type: string | {in: string[]}};
		select: unknown;
	}) => {
		if (args.where.type === 'BORROW') {
			assert.deepEqual(args, {
				where: {bookCopy: {is: {bookId}}, type: 'BORROW', dateTimeCreated: {gte: startOfMonth}},
				select: {member: {select: {id: true, name: true, externalId: true}}},
			});
			return memberRows;
		}
		if (typeof args.where.type !== 'string' && args.where.type.in.includes('BORROW')) {
			assert.deepEqual(args, {
				where: {
					bookCopy: {is: {bookId}},
					type: {in: ['BORROW', 'RETURN']},
					dateTimeCreated: {gte: startOfLast14Days},
				},
				select: {type: true, dateTimeCreated: true},
			});
			return [
				{type: 'BORROW', dateTimeCreated: startOfLast14Days},
				{type: 'BORROW', dateTimeCreated: new Date(2026, 10, 15, 9)},
				{type: 'BORROW', dateTimeCreated: new Date(2026, 10, 15, 10)},
				{type: 'RETURN', dateTimeCreated: new Date(2026, 10, 14, 23, 59)},
			];
		}
		assert.deepEqual(args, {
			where: {
				bookId,
				type: {in: ['RESERVE', 'UNRESERVE']},
				dateTimeCreated: {gte: startOfLast7Days},
			},
			select: {type: true, dateTimeCreated: true},
		});
		return [
			{type: 'RESERVE', dateTimeCreated: startOfLast7Days},
			{type: 'RESERVE', dateTimeCreated: new Date(2026, 10, 15, 8)},
			{type: 'UNRESERVE', dateTimeCreated: new Date(2026, 10, 14, 16)},
		];
	};

	const response = await fixture.app.inject({url: `/books/${bookId}/stats`, headers});
	assert.equal(response.statusCode, 200, response.body);
	const data = BookStatsDefinition.parse(response.json().data);
	assert.equal(data.totalBookCopies, 10);
	assert.equal(data.totalAvailableCopies, 4);
	assert.equal(data.totalOutstandingBorrows, 5);
	assert.equal(data.totalPendingReservations, 3);
	assert.equal(data.totalReadyToClaimReservations, 1);
	assert.deepEqual(data.monthOverMonth, {
		newCopies: {current: 3, previous: 2},
		borrows: {current: 10, previous: 8},
	});
	assert.deepEqual(data.topBorrowedMembersThisMonth, [
		{member: members[1], total: 3},
		{member: members[0], total: 2},
		{member: members[3], total: 1},
		{member: members[2], total: 1},
		{member: members[4], total: 1},
	]);
	assert.deepEqual(
		data.last14DaysActivity,
		Array.from({length: 14}, (_, index) => ({
			timestamp: new Date(2026, 10, index + 2),
			totalBooksBorrowed: index === 0 ? 1 : index === 13 ? 2 : 0,
			totalBooksReturned: index === 12 ? 1 : 0,
		})),
	);
	assert.deepEqual(
		data.last7DaysReservationActivity,
		Array.from({length: 7}, (_, index) => ({
			timestamp: new Date(2026, 10, index + 9),
			totalBooksReserved: index === 0 || index === 6 ? 1 : 0,
			totalBooksUnreserved: index === 5 ? 1 : 0,
		})),
	);
});

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
