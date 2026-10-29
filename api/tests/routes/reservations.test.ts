import assert from 'node:assert/strict';
import {faker} from '@faker-js/faker';
import {test} from 'vitest';
import * as XLSX from 'xlsx';
import {createFixture} from './fixture.js';

const fixture = createFixture();

function reservation() {
	const book = fixture.book();
	const member = fixture.member();
	return {
		id: faker.number.int({min: 1, max: 1_000_000}),
		book: {id: book.id, title: book.title},
		bookCopy: null,
		member: {id: member.id, name: member.name, externalId: member.externalId},
		status: 'PENDING',
		ticket: faker.string.uuid(),
		remarks: null,
		dateTimeCreated: new Date(),
		dateTimeUpdated: new Date(),
	};
}

test('GET /reservations', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.reservation.count = async (args: {where: unknown}) => {
		assert.deepEqual(args.where, {
			bookId: {equals: row.book.id},
			status: {equals: 'PENDING'},
		});
		return 1;
	};
	fixture.mock.reservation.findMany = async () => [row];
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/reservations?bookId__eq=${row.book.id}&status__eq=PENDING`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.total, 1);
	assert.equal(response.json().data.rows[0].book.title, row.book.title);
});

test('GET /reservations combines book, member, status, ticket, and ISBN filters for count and rows', async () => {
	const headers = await fixture.auth();
	const query = new URLSearchParams({
		bookId__eq: '1',
		bookId__neq: '2',
		memberId__eq: '3',
		memberId__neq: '4',
		status__eq: 'PENDING',
		status__neq: 'CANCELLED',
		ticket__eq: 'TICKET-1',
		ticket__neq: 'TICKET-2',
		ticket__contains: 'ticket',
		isbn__eq: 'ISBN-1',
		isbn__neq: 'ISBN-2',
		isbn__contains: 'isbn',
	});
	for (const [key, values] of Object.entries({
		bookId__in: ['1', '5'],
		bookId__nin: ['2', '6'],
		memberId__in: ['3', '7'],
		memberId__nin: ['4', '8'],
		status__in: ['PENDING', 'COMPLETED'],
		status__nin: ['CANCELLED', 'COMPLETED'],
		ticket__in: ['TICKET-1', 'TICKET-3'],
		ticket__nin: ['TICKET-2', 'TICKET-4'],
		isbn__in: ['ISBN-1', 'ISBN-3'],
		isbn__nin: ['ISBN-2', 'ISBN-4'],
	})) {
		for (const value of values) query.append(key, value);
	}
	const where = {
		bookId: {equals: 1, not: 2, in: [1, 5], notIn: [2, 6]},
		memberId: {equals: 3, not: 4, in: [3, 7], notIn: [4, 8]},
		status: {
			equals: 'PENDING',
			not: 'CANCELLED',
			in: ['PENDING', 'COMPLETED'],
			notIn: ['CANCELLED', 'COMPLETED'],
		},
		ticket: {
			equals: 'TICKET-1',
			not: 'TICKET-2',
			in: ['TICKET-1', 'TICKET-3'],
			notIn: ['TICKET-2', 'TICKET-4'],
			contains: 'ticket',
			mode: 'insensitive',
		},
		bookCopy: {
			is: {
				isbn: {
					equals: 'ISBN-1',
					not: 'ISBN-2',
					in: ['ISBN-1', 'ISBN-3'],
					notIn: ['ISBN-2', 'ISBN-4'],
					contains: 'isbn',
					mode: 'insensitive',
				},
			},
		},
	};
	fixture.mock.reservation.count = async (args: {where: unknown}) => {
		assert.deepEqual(args.where, where);
		return 0;
	};
	fixture.mock.reservation.findMany = async (args: {where: unknown}) => {
		assert.deepEqual(args.where, where);
		return [];
	};
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/reservations?${query}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
});

test('GET /reservations ignores missing filters and filters ISBN on the assigned copy', async () => {
	const headers = await fixture.auth();
	const filters: unknown[] = [];
	fixture.mock.reservation.count = async (args: {where: unknown}) => {
		filters.push(args.where);
		return 0;
	};
	fixture.mock.reservation.findMany = async (args: {where: unknown}) => {
		filters.push(args.where);
		return [];
	};
	const unfiltered = await fixture.app.inject({method: 'GET', url: '/reservations', headers});
	assert.equal(unfiltered.statusCode, 200, unfiltered.body);
	const isbnOnly = await fixture.app.inject({
		method: 'GET',
		url: '/reservations?isbn__neq=ISBN-1',
		headers,
	});
	assert.equal(isbnOnly.statusCode, 200, isbnOnly.body);
	assert.deepEqual(filters, [
		{},
		{},
		{bookCopy: {is: {isbn: {not: 'ISBN-1'}}}},
		{bookCopy: {is: {isbn: {not: 'ISBN-1'}}}},
	]);
});

test('GET /reservations filters both timestamps and sorts by update time', async () => {
	const headers = await fixture.auth();
	const createdAfter = new Date('2026-10-01T00:00:00.000Z');
	const createdBefore = new Date('2026-10-15T00:00:00.000Z');
	const updatedAfter = new Date('2026-10-16T00:00:00.000Z');
	const updatedBefore = new Date('2026-10-28T00:00:00.000Z');
	let countWhere: unknown;
	let findArgs: {where: unknown; orderBy: unknown} | undefined;
	fixture.mock.reservation.count = async (args: {where: unknown}) => {
		countWhere = args.where;
		return 0;
	};
	fixture.mock.reservation.findMany = async (args: {where: unknown; orderBy: unknown}) => {
		findArgs = args;
		return [];
	};
	const query = new URLSearchParams({
		dateTimeCreated__gt: createdAfter.toISOString(),
		dateTimeCreated__lte: createdBefore.toISOString(),
		dateTimeUpdated__gte: updatedAfter.toISOString(),
		dateTimeUpdated__lt: updatedBefore.toISOString(),
		sortBy: 'dateTimeUpdated',
		sortOrder: 'ASC',
	});
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/reservations?${query}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	const where = {
		dateTimeCreated: {gt: createdAfter, lte: createdBefore},
		dateTimeUpdated: {gte: updatedAfter, lt: updatedBefore},
	};
	assert.deepEqual(countWhere, where);
	assert.deepEqual(findArgs?.where, where);
	assert.deepEqual(findArgs?.orderBy, {dateTimeUpdated: 'asc'});
});

test('GET /reservations defaults to newest first and supports descending created-time sort', async () => {
	const headers = await fixture.auth();
	const sortOrders: unknown[] = [];
	fixture.mock.reservation.count = async () => 0;
	fixture.mock.reservation.findMany = async (args: {orderBy: unknown}) => {
		sortOrders.push(args.orderBy);
		return [];
	};
	const defaultResponse = await fixture.app.inject({method: 'GET', url: '/reservations', headers});
	assert.equal(defaultResponse.statusCode, 200, defaultResponse.body);
	const sortedResponse = await fixture.app.inject({
		method: 'GET',
		url: '/reservations?sortBy=dateTimeCreated&sortOrder=DESC',
		headers,
	});
	assert.equal(sortedResponse.statusCode, 200, sortedResponse.body);
	assert.deepEqual(sortOrders, [{dateTimeCreated: 'desc'}, {dateTimeCreated: 'desc'}]);
});

test('GET /reservations requires authentication', async () => {
	const response = await fixture.app.inject({method: 'GET', url: '/reservations'});
	assert.equal(response.statusCode, 401);
});

test('POST /reservations/export includes assigned and book-only reservations', async () => {
	const headers = await fixture.auth();
	const bookOnly = reservation();
	const assigned = {
		...reservation(),
		bookCopy: {id: 17, isbn: 'ISBN-17', status: 'RESERVED'},
	};
	fixture.mock.reservation.findMany = async () => [bookOnly, assigned];
	const response = await fixture.app.inject({method: 'POST', url: '/reservations/export', headers});
	assert.equal(response.statusCode, 200, response.body);
	assert.match(response.headers['content-disposition'] ?? '', /reservations-.*\.xlsx/);
	const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
	const rows = XLSX.utils.sheet_to_json<{
		ticket: string;
		bookTitle: string;
		memberName: string;
		isbn?: string;
	}>(workbook.Sheets[workbook.SheetNames[0]]);
	assert.equal(workbook.SheetNames[0], 'Reservations');
	assert.ok(
		rows.some(
			(row) => row.ticket === bookOnly.ticket && row.bookTitle === bookOnly.book.title && !row.isbn,
		),
	);
	assert.ok(
		rows.some(
			(row) =>
				row.ticket === assigned.ticket &&
				row.memberName === assigned.member.name &&
				row.isbn === 'ISBN-17',
		),
	);
});

test('POST /reservations/export applies combined filters and sorting without pagination', async () => {
	const headers = await fixture.auth();
	const date = new Date('2026-10-20T00:00:00.000Z');
	const query = new URLSearchParams({
		bookId__neq: '5',
		memberId__eq: '3',
		status__in: 'PENDING',
		ticket__contains: 'ticket',
		isbn__contains: 'isbn',
		dateTimeCreated__gte: date.toISOString(),
		sortBy: 'dateTimeUpdated',
		sortOrder: 'ASC',
	});
	let args: unknown;
	fixture.mock.reservation.findMany = async (input: unknown) => {
		args = input;
		return [];
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/export?${query}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(args, {
		where: {
			bookId: {not: 5},
			memberId: {equals: 3},
			status: {in: ['PENDING']},
			ticket: {contains: 'ticket', mode: 'insensitive'},
			bookCopy: {is: {isbn: {contains: 'isbn', mode: 'insensitive'}}},
			dateTimeCreated: {gte: date},
		},
		select: {
			id: true,
			book: {select: {id: true, title: true}},
			bookCopy: {select: {id: true, isbn: true, status: true}},
			member: {select: {id: true, name: true, externalId: true}},
			status: true,
			ticket: true,
			remarks: true,
			dateTimeCreated: true,
			dateTimeUpdated: true,
		},
		orderBy: {dateTimeUpdated: 'asc'},
	});
});

test('POST /reservations/export requires authentication', async () => {
	const response = await fixture.app.inject({method: 'POST', url: '/reservations/export'});
	assert.equal(response.statusCode, 401);
});

test('GET /reservations/:id', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.reservation.findUnique = async () => row;
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/reservations/${row.id}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.id, row.id);
});

test('GET /reservations/:id returns 404 for a missing reservation', async () => {
	const headers = await fixture.auth();
	fixture.mock.reservation.findUnique = async () => null;
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/reservations/${faker.number.int({min: 1})}`,
		headers,
	});
	assert.equal(response.statusCode, 404);
});

test('POST /reservations', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.book.exists = async () => true;
	fixture.mock.member.exists = async () => true;
	fixture.mock.reservation.exists = async () => false;
	const calls: string[] = [];
	fixture.mock.reservation.create = async (args: {data: {ticket: string}}) => {
		calls.push('reservation.create');
		return {...row, ticket: args.data.ticket};
	};
	const transactions: {
		type: string;
		status: string;
		ticket: string;
		bookId: number;
		memberId: number;
		reservationId: number;
		bookCopyId?: number;
	}[] = [];
	fixture.mock.transaction.create = async (args: {data: (typeof transactions)[number]}) => {
		calls.push('transaction.create');
		transactions.push(args.data);
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: '/reservations',
		headers,
		payload: {bookId: row.book.id, memberId: row.member.id},
	});
	assert.equal(response.statusCode, 201, response.body);
	assert.equal(response.json().data.status, 'PENDING');
	assert.equal(response.json().data.book.title, row.book.title);
	assert.equal(transactions.length, 1);
	assert.equal(transactions[0].type, 'RESERVE');
	assert.equal(transactions[0].status, 'PENDING');
	assert.equal(transactions[0].ticket, response.json().data.ticket);
	assert.equal(transactions[0].bookId, row.book.id);
	assert.equal(transactions[0].memberId, row.member.id);
	assert.equal(transactions[0].reservationId, row.id);
	assert.equal(transactions[0].bookCopyId, undefined);
	assert.deepEqual(calls, ['reservation.create', 'transaction.create']);
});

test('POST /reservations rejects duplicate book/member pairs', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.book.exists = async () => true;
	fixture.mock.member.exists = async () => true;
	fixture.mock.reservation.exists = async () => true;
	const response = await fixture.app.inject({
		method: 'POST',
		url: '/reservations',
		headers,
		payload: {bookId: row.book.id, memberId: row.member.id},
	});
	assert.equal(response.statusCode, 409);
});

test('POST /reservations allows a new ticket after cancellation', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.book.exists = async () => true;
	fixture.mock.member.exists = async () => true;
	fixture.mock.reservation.exists = async (where: {status: string}) => {
		assert.equal(where.status, 'PENDING');
		return false;
	};
	fixture.mock.reservation.create = async (args: {data: {ticket: string}}) => ({
		...row,
		ticket: args.data.ticket,
	});
	fixture.mock.transaction.create = async () => ({});
	const response = await fixture.app.inject({
		method: 'POST',
		url: '/reservations',
		headers,
		payload: {bookId: row.book.id, memberId: row.member.id},
	});
	assert.equal(response.statusCode, 201, response.body);
	assert.notEqual(response.json().data.ticket, row.ticket);
});

test('POST /reservations rejects missing books and members', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.book.exists = async () => false;
	fixture.mock.member.exists = async () => true;
	const payload = {bookId: row.book.id, memberId: row.member.id};
	const missingBook = await fixture.app.inject({
		method: 'POST',
		url: '/reservations',
		headers,
		payload,
	});
	assert.equal(missingBook.statusCode, 400);
	fixture.mock.book.exists = async () => true;
	fixture.mock.member.exists = async () => false;
	const missingMember = await fixture.app.inject({
		method: 'POST',
		url: '/reservations',
		headers,
		payload,
	});
	assert.equal(missingMember.statusCode, 400);
});

test('POST /reservations validates the request body', async () => {
	const headers = await fixture.auth();
	const response = await fixture.app.inject({
		method: 'POST',
		url: '/reservations',
		headers,
		payload: {bookId: -1, memberId: 0},
	});
	assert.equal(response.statusCode, 400);
});

test('PATCH /reservations/:id', async () => {
	const headers = await fixture.auth();
	const row = {...reservation(), remarks: faker.lorem.sentence()};
	fixture.mock.reservation.exists = async () => true;
	fixture.mock.reservation.update = async () => row;
	const response = await fixture.app.inject({
		method: 'PATCH',
		url: `/reservations/${row.id}`,
		headers,
		payload: {remarks: row.remarks},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.status, 'PENDING');
	assert.equal(response.json().data.remarks, row.remarks);
});

test('PATCH /reservations/:id cannot cancel without unreserving', async () => {
	const headers = await fixture.auth();
	const response = await fixture.app.inject({
		method: 'PATCH',
		url: `/reservations/${faker.number.int({min: 1})}`,
		headers,
		payload: {status: 'CANCELLED'},
	});
	assert.equal(response.statusCode, 400);
});

test('POST /reservations/:id/unreserve', async () => {
	const headers = await fixture.auth();
	const row = {...reservation(), remarks: 'Please keep me updated'};
	let reads = 0;
	fixture.mock.reservation.findUnique = async () =>
		++reads === 1
			? {
					status: 'PENDING',
					ticket: row.ticket,
					bookId: row.book.id,
					memberId: row.member.id,
					bookCopyId: null,
					remarks: row.remarks,
				}
			: {...row, status: 'CANCELLED'};
	let reservationUpdate: unknown;
	fixture.mock.reservation.updateMany = async (args: unknown) => {
		reservationUpdate = args;
		return {count: 1};
	};
	const calls: string[] = [];
	const updated: {ticket_type: {ticket: string; type: string}}[] = [];
	fixture.mock.transaction.update = async (args: {where: (typeof updated)[number]}) => {
		calls.push('transaction.update');
		updated.push(args.where);
		return {};
	};
	const created: {
		type: string;
		ticket: string;
		bookId: number;
		memberId: number;
		remarks: string;
	}[] = [];
	fixture.mock.transaction.create = async (args: {data: (typeof created)[number]}) => {
		calls.push('transaction.create');
		created.push(args.data);
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/unreserve`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.id, row.id);
	assert.equal(response.json().data.status, 'CANCELLED');
	assert.deepEqual(reservationUpdate, {
		where: {id: row.id, status: 'PENDING'},
		data: {status: 'CANCELLED', remarks: 'Please keep me updated; Cancelled manually.'},
	});
	assert.deepEqual(updated, [{ticket_type: {ticket: row.ticket, type: 'RESERVE'}}]);
	assert.deepEqual(calls, ['transaction.update', 'transaction.create']);
	assert.deepEqual(created, [
		{
			type: 'UNRESERVE',
			status: 'COMPLETED',
			ticket: row.ticket,
			bookId: row.book.id,
			memberId: row.member.id,
			reservationId: row.id,
			remarks: 'Cancelled manually.',
		},
	]);
});

test('POST /reservations/:id/unreserve records a reason without previous remarks', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	let reads = 0;
	fixture.mock.reservation.findUnique = async () =>
		++reads === 1
			? {
					status: 'PENDING',
					ticket: row.ticket,
					bookId: row.book.id,
					memberId: row.member.id,
					bookCopyId: null,
					remarks: null,
				}
			: {...row, status: 'CANCELLED', remarks: 'Cancelled manually.'};
	let update: unknown;
	fixture.mock.reservation.updateMany = async (args: unknown) => {
		update = args;
		return {count: 1};
	};
	fixture.mock.transaction.update = async () => ({});
	fixture.mock.transaction.create = async () => ({});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/unreserve`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.remarks, 'Cancelled manually.');
	assert.deepEqual(update, {
		where: {id: row.id, status: 'PENDING'},
		data: {status: 'CANCELLED', remarks: 'Cancelled manually.'},
	});
});

test('POST /reservations/:id/unreserve appends the entered note before the reason', async () => {
	const headers = await fixture.auth();
	const row = {...reservation(), remarks: 'Earlier note'};
	let reads = 0;
	fixture.mock.reservation.findUnique = async () =>
		++reads === 1
			? {
					status: 'PENDING',
					ticket: row.ticket,
					bookId: row.book.id,
					memberId: row.member.id,
					bookCopyId: null,
					remarks: row.remarks,
				}
			: {
					...row,
					status: 'CANCELLED',
					remarks: 'Earlier note; Reader changed plans; Cancelled manually.',
				};
	let update: unknown;
	let created: unknown;
	fixture.mock.reservation.updateMany = async (args: unknown) => {
		update = args;
		return {count: 1};
	};
	fixture.mock.transaction.update = async () => ({});
	fixture.mock.transaction.create = async (args: unknown) => {
		created = args;
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/unreserve`,
		headers,
		payload: {remarks: '  Reader changed plans  '},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(
		response.json().data.remarks,
		'Earlier note; Reader changed plans; Cancelled manually.',
	);
	assert.deepEqual(update, {
		where: {id: row.id, status: 'PENDING'},
		data: {status: 'CANCELLED', remarks: 'Earlier note; Reader changed plans; Cancelled manually.'},
	});
	assert.deepEqual(created, {
		data: {
			type: 'UNRESERVE',
			status: 'COMPLETED',
			ticket: row.ticket,
			bookId: row.book.id,
			memberId: row.member.id,
			reservationId: row.id,
			remarks: 'Reader changed plans; Cancelled manually.',
		},
	});
});

test('PATCH and POST /reservations/:id/unreserve return 404 when missing', async () => {
	const headers = await fixture.auth();
	fixture.mock.reservation.exists = async () => false;
	fixture.mock.reservation.findUnique = async () => null;
	const url = `/reservations/${faker.number.int({min: 1})}`;
	const update = await fixture.app.inject({
		method: 'PATCH',
		url,
		headers,
		payload: {remarks: faker.lorem.sentence()},
	});
	assert.equal(update.statusCode, 404);
	const remove = await fixture.app.inject({method: 'POST', url: `${url}/unreserve`, headers});
	assert.equal(remove.statusCode, 404);
});

test('POST /reservations/:id/unreserve rejects an already cancelled reservation', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.reservation.findUnique = async () => ({...row, status: 'CANCELLED'});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/unreserve`,
		headers,
	});
	assert.equal(response.statusCode, 409);
});

test('POST /reservations/:id/unreserve releases an assigned copy', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	const copy = fixture.copy(fixture.book());
	fixture.mock.reservation.findUnique = async () => ({...row, bookCopyId: copy.id});
	fixture.mock.reservation.updateMany = async () => ({count: 1});
	const released: unknown[] = [];
	fixture.mock.bookCopy.updateMany = async (args: unknown) => {
		released.push(args);
		return {count: 1};
	};
	fixture.mock.transaction.update = async (_args: unknown) => ({});
	fixture.mock.transaction.create = async (_args: unknown) => ({});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/unreserve`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(released, [
		{where: {id: copy.id, status: 'RESERVED'}, data: {status: 'AVAILABLE'}},
	]);
});

test('POST /reservations/:id/unreserve does not release a copy after a concurrent claim', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.reservation.findUnique = async () => ({...row, bookCopyId: 2});
	fixture.mock.reservation.updateMany = async () => ({count: 0});
	let released = false;
	let recorded = false;
	fixture.mock.bookCopy.updateMany = async () => {
		released = true;
		return {count: 1};
	};
	fixture.mock.transaction.create = async () => {
		recorded = true;
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/unreserve`,
		headers,
	});
	assert.equal(response.statusCode, 409, response.body);
	assert.equal(released, false);
	assert.equal(recorded, false);
});

test('POST /reservations/:id/claim borrows the assigned copy with the reservation ticket', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	const copy = fixture.copy(fixture.book());
	let reads = 0;
	fixture.mock.reservation.findUnique = async () => ({...row, bookCopyId: copy.id});
	const calls: string[] = [];
	fixture.mock.reservation.updateMany = async () => {
		calls.push('reservation.updateMany');
		return {count: 1};
	};
	fixture.mock.bookCopy.updateMany = async () => {
		calls.push('bookCopy.updateMany');
		return {count: 1};
	};
	fixture.mock.reservation.findUniqueOrThrow = async () =>
		++reads === 1
			? {ticket: row.ticket, memberId: row.member.id}
			: {...row, status: 'COMPLETED', bookCopy: {id: copy.id, isbn: copy.isbn, status: 'BORROWED'}};
	const updated: unknown[] = [];
	fixture.mock.transaction.update = async (args: unknown) => {
		calls.push('transaction.update');
		updated.push(args);
		return {};
	};
	const created: unknown[] = [];
	fixture.mock.transaction.create = async (args: unknown) => {
		calls.push('transaction.create');
		created.push(args);
		return {};
	};
	fixture.mock.member.update = async () => {
		calls.push('member.update');
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/claim`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.status, 'COMPLETED');
	assert.equal(response.json().data.bookCopy.status, 'BORROWED');
	assert.deepEqual(updated, [
		{where: {ticket_type: {ticket: row.ticket, type: 'RESERVE'}}, data: {status: 'COMPLETED'}},
	]);
	assert.deepEqual(created, [
		{
			data: {
				type: 'BORROW',
				status: 'PENDING',
				ticket: row.ticket,
				memberId: row.member.id,
				bookCopyId: copy.id,
				reservationId: row.id,
			},
		},
	]);
	assert.deepEqual(calls, [
		'reservation.updateMany',
		'bookCopy.updateMany',
		'transaction.update',
		'transaction.create',
		'member.update',
	]);
});

test('POST /reservations/:id/claim appends the note and records it on the borrow', async () => {
	const headers = await fixture.auth();
	const row = {...reservation(), remarks: 'Earlier note'};
	const copy = fixture.copy(fixture.book());
	fixture.mock.reservation.findUnique = async () => ({...row, bookCopyId: copy.id});
	let update: unknown;
	let created: unknown;
	fixture.mock.reservation.updateMany = async (args: unknown) => {
		update = args;
		return {count: 1};
	};
	fixture.mock.bookCopy.updateMany = async () => ({count: 1});
	let reads = 0;
	fixture.mock.reservation.findUniqueOrThrow = async () =>
		++reads === 1 ? {ticket: row.ticket, memberId: row.member.id} : {...row, status: 'COMPLETED'};
	fixture.mock.transaction.update = async () => ({});
	fixture.mock.transaction.create = async (args: unknown) => {
		created = args;
		return {};
	};
	fixture.mock.member.update = async () => ({});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/claim`,
		headers,
		payload: {remarks: '  Copy handed over  '},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(update, {
		where: {id: row.id, status: 'PENDING', bookCopyId: copy.id},
		data: {status: 'COMPLETED', remarks: 'Earlier note; Copy handed over'},
	});
	assert.deepEqual(created, {
		data: {
			type: 'BORROW',
			status: 'PENDING',
			ticket: row.ticket,
			memberId: row.member.id,
			bookCopyId: copy.id,
			reservationId: row.id,
			remarks: 'Copy handed over',
		},
	});
});

test('reservation actions reject invalid remarks', async () => {
	const headers = await fixture.auth();
	for (const action of ['claim', 'unreserve']) {
		const response = await fixture.app.inject({
			method: 'POST',
			url: `/reservations/1/${action}`,
			headers,
			payload: {remarks: 123},
		});
		assert.equal(response.statusCode, 400, response.body);
	}
});

test('POST /reservations/:id/claim rejects missing, unassigned, and cancelled reservations', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	for (const [existing, status] of [
		[null, 404],
		[row, 409],
		[{...row, status: 'CANCELLED', bookCopyId: 1}, 409],
		[{...row, status: 'COMPLETED', bookCopyId: 1}, 409],
	] as const) {
		fixture.mock.reservation.findUnique = async () => existing;
		const response = await fixture.app.inject({
			method: 'POST',
			url: `/reservations/${row.id}/claim`,
			headers,
		});
		assert.equal(response.statusCode, status, response.body);
	}
});

test('POST /reservations/:id/claim rejects a concurrent cancellation', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.reservation.findUnique = async () => ({...row, bookCopyId: 2});
	fixture.mock.reservation.updateMany = async () => ({count: 0});
	let borrowed = false;
	let recorded = false;
	fixture.mock.bookCopy.updateMany = async () => {
		borrowed = true;
		return {count: 1};
	};
	fixture.mock.transaction.create = async () => {
		recorded = true;
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/claim`,
		headers,
	});
	assert.equal(response.statusCode, 409, response.body);
	assert.equal(borrowed, false);
	assert.equal(recorded, false);
});

test('POST /reservations/:id/claim reports a conflict if the assigned copy changed status', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.reservation.findUnique = async () => ({...row, bookCopyId: 2});
	fixture.mock.reservation.updateMany = async () => ({count: 1});
	fixture.mock.bookCopy.updateMany = async () => ({count: 0});
	let borrowed = false;
	fixture.mock.transaction.create = async () => {
		borrowed = true;
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/claim`,
		headers,
	});
	assert.equal(response.statusCode, 409, response.body);
	assert.equal(borrowed, false);
});

test('POST /reservations/:id/unreserve reports a conflict if its assigned copy changed status', async () => {
	const headers = await fixture.auth();
	const row = reservation();
	fixture.mock.reservation.findUnique = async () => ({...row, bookCopyId: 2});
	fixture.mock.reservation.updateMany = async () => ({count: 1});
	fixture.mock.bookCopy.updateMany = async () => ({count: 0});
	let unreserved = false;
	fixture.mock.transaction.create = async () => {
		unreserved = true;
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/reservations/${row.id}/unreserve`,
		headers,
	});
	assert.equal(response.statusCode, 409, response.body);
	assert.equal(unreserved, false);
});

test('POST /reservations requires CSRF', async () => {
	const row = reservation();
	const response = await fixture.app.inject({
		method: 'POST',
		url: '/reservations',
		payload: {bookId: row.book.id, memberId: row.member.id},
	});
	assert.equal(response.statusCode, 403);
	const headers = await fixture.auth();
	const withoutToken = await fixture.app.inject({
		method: 'POST',
		url: '/reservations',
		headers: {cookie: headers.cookie},
		payload: {bookId: row.book.id, memberId: row.member.id},
	});
	assert.equal(withoutToken.statusCode, 403);
});

test('POST /reservations/:id/claim and /:id/unreserve require authentication and CSRF', async () => {
	const id = faker.number.int({min: 1});
	for (const action of ['claim', 'unreserve']) {
		const url = `/reservations/${id}/${action}`;
		const unauthenticated = await fixture.app.inject({method: 'POST', url});
		assert.equal(unauthenticated.statusCode, 403);
		const headers = await fixture.auth();
		const withoutToken = await fixture.app.inject({
			method: 'POST',
			url,
			headers: {cookie: headers.cookie},
		});
		assert.equal(withoutToken.statusCode, 403);
	}
});
