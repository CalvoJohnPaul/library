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
	fixture.mock.bookCopy.findUnique = async () => ({
		...copy,
		status,
		transactions: [
			{
				id: borrow.id,
				ticket: borrow.ticket,
				memberId: member.id,
			},
		],
	});
	fixture.mock.member.count = async () => 1;
	fixture.mock.bookCopy.updateMany = async () => {
		status = status === 'AVAILABLE' ? 'BORROWED' : 'AVAILABLE';
		return {count: 1};
	};
	fixture.mock.member.update = async () => member;
	fixture.mock.transaction.create = async () => ({
		...borrow,
		type: status === 'BORROWED' ? 'BORROW' : 'RETURN',
		status: status === 'BORROWED' ? 'PENDING' : 'COMPLETED',
		bookCopy: {...copy, status},
	});
	fixture.mock.transaction.update = async () => borrow;
	return {copy, member};
}

test('POST /book-copies/:id/borrow', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
	const response = await fixture.app.inject({
		method: 'POST',
		url: `/book-copies/${copy.id}/borrow`,
		headers,
		payload: {memberId: member.id},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.bookCopy.status, 'BORROWED');
	assert.equal(response.json().data.transaction.member.id, member.id);
});

test('POST /book-copies/:id/return', async () => {
	const headers = await fixture.auth();
	const {copy, member} = mockBorrow();
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
		payload: {},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.bookCopy.status, 'AVAILABLE');
	assert.equal(response.json().data.transaction.type, 'RETURN');
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
