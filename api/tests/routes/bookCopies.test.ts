import assert from 'node:assert/strict';
import {faker} from '@faker-js/faker';
import {test} from 'vitest';
import * as XLSX from 'xlsx';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /book-copies', async () => {
	const headers = await fixture.auth();
	const copy = fixture.copy(fixture.book());
	fixture.mock.bookCopy.count = async () => 1;
	fixture.mock.bookCopy.findMany = async () => [copy];
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/book-copies?isbn__eq=${copy.isbn}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.total, 1);
	assert.equal(response.json().data.rows[0].id, copy.id);
});

test('GET /book-copies/:id', async () => {
	const headers = await fixture.auth();
	const copy = fixture.copy(fixture.book());
	fixture.mock.bookCopy.findUnique = async () => copy;
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/book-copies/${copy.id}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.isbn, copy.isbn);
});

test('POST /book-copies', async () => {
	const headers = await fixture.auth();
	const copy = fixture.copy(fixture.book());
	fixture.mock.bookCopy.exists = async () => false;
	fixture.mock.book.exists = async () => true;
	fixture.mock.bookCopy.create = async () => copy;
	const response = await fixture.app.inject({
		method: 'POST',
		url: '/book-copies',
		headers,
		payload: {
			bookId: copy.book.id,
			isbn: copy.isbn,
		},
	});
	assert.equal(response.statusCode, 201, response.body);
	assert.equal(response.json().data.isbn, copy.isbn);
});

test('PATCH /book-copies/:id', async () => {
	const headers = await fixture.auth();
	const copy = {...fixture.copy(fixture.book()), isbn: faker.string.uuid()};
	let lookup = 0;
	fixture.mock.bookCopy.exists = async () => ++lookup === 1;
	fixture.mock.bookCopy.update = async () => copy;
	const response = await fixture.app.inject({
		method: 'PATCH',
		url: `/book-copies/${copy.id}`,
		headers,
		payload: {isbn: copy.isbn},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.isbn, copy.isbn);
});

test('DELETE /book-copies/:id', async () => {
	const headers = await fixture.auth();
	fixture.mock.bookCopy.deleteMany = async () => ({count: 1});
	const response = await fixture.app.inject({
		method: 'DELETE',
		url: `/book-copies/${faker.number.int({min: 1})}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(response.json(), {ok: true});
});

function mockBorrow() {
	const copy = fixture.copy(fixture.book());
	const member = fixture.member();
	const borrow = fixture.transaction(member, copy);
	let status: 'AVAILABLE' | 'BORROWED' = 'AVAILABLE';
	let ticket = borrow.ticket;
	let reservationId: number | null = null;
	fixture.mock.bookCopy.findUnique = async () => ({
		...copy,
		status,
		transactions: [
			{
				id: borrow.id,
				ticket,
				memberId: member.id,
				reservationId,
			},
		],
	});
	fixture.mock.member.count = async () => 1;
	fixture.mock.reservation.findFirst = async () => null;
	fixture.mock.bookCopy.updateMany = async () => {
		status = status === 'AVAILABLE' ? 'BORROWED' : 'AVAILABLE';
		return {count: 1};
	};
	fixture.mock.member.update = async () => member;
	fixture.mock.transaction.create = async (args: {
		data: {type: string; status: string; ticket: string; reservationId?: number | null};
	}) => {
		ticket = args.data.ticket;
		reservationId = args.data.reservationId ?? null;
		return {
			...borrow,
			...args.data,
			bookCopy: {...copy, status},
			reservation: reservationId ? {id: reservationId, status: 'COMPLETED'} : null,
		};
	};
	fixture.mock.transaction.update = async () => borrow;
	return {copy, member};
}

test('POST /book-copies/:id/borrow', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	const created: {
		type: string;
		status: string;
		ticket: string;
		memberId: number;
		bookCopyId: number;
		bookId?: number;
		remarks?: string;
	}[] = [];
	const create = fixture.mock.transaction.create as (args: {
		data: (typeof created)[number];
	}) => Promise<unknown>;
	fixture.mock.transaction.create = async (args: {data: (typeof created)[number]}) => {
		created.push(args.data);
		return create(args);
	};
	const remarks = faker.lorem.sentence();
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id, remarks},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.bookCopy.status, 'BORROWED');
	assert.equal(response.json().data.transaction.member.id, member.id);
	assert.equal(response.json().data.transaction.reservation, null);
	assert.equal(created.length, 1);
	assert.equal(created[0].type, 'BORROW');
	assert.equal(created[0].status, 'PENDING');
	assert.equal(created[0].ticket, response.json().data.transaction.ticket);
	assert.equal(created[0].bookCopyId, copy.id);
	assert.equal(created[0].memberId, member.id);
	assert.equal(created[0].remarks, remarks);
	assert.equal(created[0].bookId, undefined);
});

test('POST /book-copies/:id/return', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	const created: {
		type: string;
		status: string;
		ticket: string;
		memberId: number;
		bookCopyId: number;
	}[] = [];
	const create = fixture.mock.transaction.create as (args: {
		data: (typeof created)[number];
	}) => Promise<unknown>;
	fixture.mock.transaction.create = async (args: {data: (typeof created)[number]}) => {
		created.push(args.data);
		return create(args);
	};
	const updates: unknown[] = [];
	fixture.mock.transaction.update = async (args: unknown) => {
		updates.push(args);
		return {};
	};
	const remarks = faker.lorem.sentence();
	const borrowed = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(borrowed.statusCode, 200, borrowed.body);
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/return`,
		headers,
		payload: {remarks},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.bookCopy.status, 'AVAILABLE');
	assert.equal(response.json().data.transaction.type, 'RETURN');
	assert.equal(response.json().data.transaction.reservation, null);
	assert.equal(created.length, 2);
	assert.deepEqual(
		created.map(({type, status}) => ({type, status})),
		[
			{type: 'BORROW', status: 'PENDING'},
			{type: 'RETURN', status: 'COMPLETED'},
		],
	);
	assert.equal(created[0].ticket, borrowed.json().data.transaction.ticket);
	assert.equal(created[1].ticket, created[0].ticket);
	assert.equal(created[1].memberId, member.id);
	assert.equal(created[1].bookCopyId, copy.id);
	assert.equal((created[1] as {remarks?: string}).remarks, remarks);
	assert.deepEqual(updates, [
		{where: {id: borrowed.json().data.transaction.id}, data: {status: 'COMPLETED'}},
	]);
});

test('POST /book-copies/:id/borrow rejects a pending book reservation', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	fixture.mock.reservation.findFirst = async () => ({id: 1});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 409, response.body);
});

test('POST /book-copies/:id/borrow rejects a reservation created after its first check', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	let lookup = 0;
	fixture.mock.reservation.findFirst = async () => (++lookup === 1 ? null : {id: 1});
	let changedCopy = false;
	fixture.mock.bookCopy.updateMany = async () => {
		changedCopy = true;
		return {count: 1};
	};
	let recordedBorrow = false;
	fixture.mock.transaction.create = async () => {
		recordedBorrow = true;
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 409, response.body);
	assert.equal(changedCopy, false);
	assert.equal(recordedBorrow, false);
});

test('POST /book-copies/:id/borrow rejects a copy borrowed by another request', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	fixture.mock.bookCopy.updateMany = async () => ({count: 0});
	let recordedBorrow = false;
	fixture.mock.transaction.create = async () => {
		recordedBorrow = true;
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 409, response.body);
	assert.equal(recordedBorrow, false);
});

test('POST /book-copies/:id/borrow rejects an already borrowed copy', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	fixture.mock.bookCopy.findUnique = async () => ({...copy, status: 'BORROWED'});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 409, response.body);
});

test('POST /book-copies/:id/borrow rejects an unknown member', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	fixture.mock.member.count = async () => 0;
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 400, response.body);
});

test('POST /book-copies/:id/borrow rejects a reserved copy for another member', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	fixture.mock.bookCopy.findUnique = async () => ({...copy, status: 'RESERVED'});
	fixture.mock.reservation.findFirst = async () => ({memberId: member.id + 1});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 409, response.body);
});

test('POST /book-copies/:id/borrow rejects a reserved copy without a pending reservation', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	fixture.mock.bookCopy.findUnique = async () => ({...copy, status: 'RESERVED'});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 409, response.body);
});

test('POST /book-copies/:id/borrow rejects a reservation claimed concurrently', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	fixture.mock.bookCopy.findUnique = async () => ({...copy, status: 'RESERVED'});
	let lookup = 0;
	fixture.mock.reservation.findFirst = async () =>
		++lookup === 1 ? {id: 1, memberId: member.id, ticket: faker.string.uuid()} : null;
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 409, response.body);
});

test('POST /book-copies/:id/borrow rejects a reserved copy cancelled after lookup', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	fixture.mock.bookCopy.findUnique = async () => ({...copy, status: 'RESERVED'});
	fixture.mock.reservation.findFirst = async () => ({id: 1, memberId: member.id, ticket: 'ticket'});
	fixture.mock.reservation.updateMany = async () => ({count: 0});
	let borrowed = false;
	fixture.mock.transaction.create = async () => {
		borrowed = true;
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 409, response.body);
	assert.equal(borrowed, false);
});

test('POST /book-copies/:id/borrow reports a conflict when an assigned copy changes status', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	fixture.mock.bookCopy.findUnique = async () => ({...copy, status: 'RESERVED'});
	fixture.mock.reservation.findFirst = async () => ({id: 1, memberId: member.id, ticket: 'ticket'});
	fixture.mock.reservation.updateMany = async () => ({count: 1});
	fixture.mock.bookCopy.updateMany = async () => ({count: 0});
	let borrowed = false;
	fixture.mock.transaction.create = async () => {
		borrowed = true;
		return {};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 409, response.body);
	assert.equal(borrowed, false);
});

test('POST /book-copies/:id/borrow claims a reserved copy for its member', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	const ticket = faker.string.uuid();
	let status: 'RESERVED' | 'BORROWED' = 'RESERVED';
	fixture.mock.bookCopy.findUnique = async () => ({...copy, status});
	fixture.mock.reservation.findFirst = async () => ({id: 1, ticket, memberId: member.id});
	const reservations: unknown[] = [];
	fixture.mock.reservation.updateMany = async (args: unknown) => {
		reservations.push(args);
		return {count: 1};
	};
	const copyUpdates: unknown[] = [];
	fixture.mock.bookCopy.updateMany = async (args: unknown) => {
		copyUpdates.push(args);
		status = 'BORROWED';
		return {count: 1};
	};
	const transactions: unknown[] = [];
	fixture.mock.transaction.update = async (args: unknown) => {
		transactions.push(args);
		return {};
	};
	const created: unknown[] = [];
	fixture.mock.transaction.create = async (args: {
		data: {ticket: string; reservationId: number};
		select: {reservation: unknown};
	}) => {
		assert.deepEqual(args.select.reservation, {select: {id: true, status: true}});
		created.push(args.data);
		return {
			...fixture.transaction(member, {...copy, status: 'BORROWED'}),
			ticket: args.data.ticket,
			reservation: {id: 1, status: 'COMPLETED'},
		};
	};
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.bookCopy.status, 'BORROWED');
	assert.equal(response.json().data.transaction.ticket, ticket);
	assert.deepEqual(response.json().data.transaction.reservation, {id: 1, status: 'COMPLETED'});
	assert.deepEqual(reservations, [
		{
			where: {id: 1, status: 'PENDING', bookCopyId: copy.id},
			data: {status: 'COMPLETED'},
		},
	]);
	assert.deepEqual(copyUpdates[0], {
		where: {id: copy.id, status: 'RESERVED'},
		data: {status: 'BORROWED'},
	});
	assert.deepEqual(transactions, [
		{where: {ticket_type: {ticket, type: 'RESERVE'}}, data: {status: 'COMPLETED'}},
	]);
	assert.equal(created.length, 1);
	const borrowData = created[0] as {
		type: string;
		status: string;
		ticket: string;
		bookCopyId: number;
		memberId: number;
		reservationId: number;
	};
	assert.equal(borrowData.type, 'BORROW');
	assert.equal(borrowData.status, 'PENDING');
	assert.equal(borrowData.ticket, ticket);
	assert.equal(borrowData.bookCopyId, copy.id);
	assert.equal(borrowData.memberId, member.id);
	assert.equal(borrowData.reservationId, 1);
});

test('returning a claimed reserved copy records RETURN with the reservation ticket', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	const ticket = faker.string.uuid();
	let status: 'RESERVED' | 'BORROWED' | 'AVAILABLE' = 'RESERVED';
	let borrowId: number | null = null;
	fixture.mock.bookCopy.findUnique = async () => ({
		...copy,
		status,
		transactions:
			borrowId === null ? [] : [{id: borrowId, memberId: member.id, ticket, reservationId: 1}],
	});
	fixture.mock.reservation.findFirst = async () => ({id: 1, ticket, memberId: member.id});
	fixture.mock.reservation.updateMany = async () => ({count: 1});
	fixture.mock.bookCopy.updateMany = async (args: {data: {status: typeof status}}) => {
		status = args.data.status;
		return {count: 1};
	};
	const created: {
		type: string;
		status: string;
		ticket: string;
		bookCopyId: number;
		memberId: number;
		reservationId: number;
	}[] = [];
	fixture.mock.transaction.create = async (args: {
		data: (typeof created)[number];
		select: {reservation: unknown};
	}) => {
		assert.deepEqual(args.select.reservation, {select: {id: true, status: true}});
		created.push(args.data);
		const transaction = fixture.transaction(member, {...copy, status});
		if (args.data.type === 'BORROW') borrowId = transaction.id;
		return {
			...transaction,
			...args.data,
			bookCopy: {...copy, status},
			reservation: {id: args.data.reservationId, status: 'COMPLETED'},
		};
	};
	const updated: unknown[] = [];
	fixture.mock.transaction.update = async (args: unknown) => {
		updated.push(args);
		return {};
	};
	const borrow = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(borrow.statusCode, 200, borrow.body);
	const returned = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/return`,
		headers,
		payload: {},
	});
	assert.equal(returned.statusCode, 200, returned.body);
	assert.equal(returned.json().data.bookCopy.status, 'AVAILABLE');
	assert.deepEqual(borrow.json().data.transaction.reservation, {id: 1, status: 'COMPLETED'});
	assert.deepEqual(returned.json().data.transaction.reservation, {id: 1, status: 'COMPLETED'});
	assert.equal(created[0].reservationId, 1);
	assert.equal(created[1].reservationId, 1);
	assert.deepEqual(
		created.map(({type, status, ticket}) => ({type, status, ticket})),
		[
			{type: 'BORROW', status: 'PENDING', ticket},
			{type: 'RETURN', status: 'COMPLETED', ticket},
		],
	);
	assert.deepEqual(updated, [
		{where: {ticket_type: {ticket, type: 'RESERVE'}}, data: {status: 'COMPLETED'}},
		{where: {id: borrowId}, data: {status: 'COMPLETED'}},
	]);
});

test('POST /book-copies/:id/return stays allowed while the book is reserved', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	const borrowed = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(borrowed.statusCode, 200, borrowed.body);
	fixture.mock.reservation.findFirst = async () => ({id: 1});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/return`,
		headers,
		payload: {},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.bookCopy.status, 'AVAILABLE');
});

test('POST /book-copies/:id/return rejects a reserved copy that was not borrowed', async () => {
	const headers = await fixture.auth();
	const {copy} = mockBorrow();
	fixture.mock.bookCopy.findUnique = async () => ({...copy, status: 'RESERVED', transactions: []});
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/return`,
		headers,
		payload: {},
	});
	assert.equal(response.statusCode, 409, response.body);
});

test('POST /book-copies/export', async () => {
	const headers = await fixture.auth();
	const copy = fixture.copy(fixture.book());
	fixture.mock.bookCopy.findMany = async () => [copy];
	const response = await fixture.app.inject({method: 'POST', url: '/book-copies/export', headers});
	assert.equal(response.statusCode, 200, response.body);
	const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
	assert.ok(
		XLSX.utils
			.sheet_to_json<{isbn: string}>(workbook.Sheets[workbook.SheetNames[0]])
			.some((row) => row.isbn === copy.isbn),
	);
});
