import assert from 'node:assert/strict';
import {faker} from '@faker-js/faker';
import {MemberStatsDefinition} from '@library/types';
import {test, vi} from 'vitest';
import * as XLSX from 'xlsx';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /members/:id/stats requires authentication', async () => {
	const response = await fixture.app.inject({url: '/members/1/stats'});
	assert.equal(response.statusCode, 401, response.body);
});

test('GET /members/:id/stats rejects invalid IDs', async () => {
	const headers = await fixture.auth();
	for (const id of ['0', '-1', '1.5', 'invalid']) {
		const response = await fixture.app.inject({url: `/members/${id}/stats`, headers});
		assert.equal(response.statusCode, 400, response.body);
	}
});

test('GET /members/:id/stats returns 404 for a missing member', async () => {
	const headers = await fixture.auth();
	fixture.mock.member.exists = async (where: unknown) => {
		assert.deepEqual(where, {id: 1});
		return false;
	};
	const response = await fixture.app.inject({url: '/members/1/stats', headers});
	assert.equal(response.statusCode, 404, response.body);
});

test('GET /members/:id/stats returns empty activity windows and zero counts', async () => {
	const headers = await fixture.auth();
	fixture.mock.member.exists = async () => true;
	fixture.mock.transaction.count = async () => 0;
	fixture.mock.transaction.findMany = async () => [];
	fixture.mock.reservation.count = async () => 0;
	const response = await fixture.app.inject({url: '/members/1/stats', headers});
	assert.equal(response.statusCode, 200, response.body);
	const data = MemberStatsDefinition.parse(response.json().data);
	assert.equal(data.totalOutstandingBorrows, 0);
	assert.equal(data.totalPendingReservations, 0);
	assert.equal(data.totalReadyToClaimReservations, 0);
	assert.deepEqual(data.monthOverMonth, {borrows: {current: 0, previous: 0}});
	assert.deepEqual(data.topBorrowedBooksLast90Days, []);
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

test('GET /members/:id/stats scopes top five books to 90 days and keeps monthly comparisons separate', async ({
	onTestFinished,
}) => {
	vi.useFakeTimers({toFake: ['Date']});
	vi.setSystemTime(new Date(2026, 10, 15, 12));
	onTestFinished(() => vi.useRealTimers());
	const headers = await fixture.auth();
	const memberId = 42;
	const now = new Date();
	const startOfLast90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
	const startOfMonth = new Date(2026, 10, 1);
	const startOfLastMonth = new Date(2026, 9, 1);
	const startOfLast14Days = new Date(2026, 10, 2);
	const startOfLast7Days = new Date(2026, 10, 9);
	fixture.mock.member.exists = async (where: unknown) => {
		assert.deepEqual(where, {id: memberId});
		return true;
	};
	fixture.mock.transaction.count = async ({
		where,
	}: {
		where: {status?: string; dateTimeCreated?: {lt?: Date}};
	}) => {
		if (where.status) {
			assert.deepEqual(where, {memberId, type: 'BORROW', status: 'PENDING'});
			return 2;
		}
		if (!where.dateTimeCreated?.lt) {
			assert.deepEqual(where, {memberId, type: 'BORROW', dateTimeCreated: {gte: startOfMonth}});
			return 4;
		}
		assert.deepEqual(where, {
			memberId,
			type: 'BORROW',
			dateTimeCreated: {gte: startOfLastMonth, lt: startOfMonth},
		});
		return 8;
	};
	fixture.mock.reservation.count = async ({where}: {where: {bookCopy?: unknown}}) => {
		if (where.bookCopy) {
			assert.deepEqual(where, {memberId, status: 'PENDING', bookCopy: {is: {status: 'RESERVED'}}});
			return 1;
		}
		assert.deepEqual(where, {memberId, status: 'PENDING'});
		return 3;
	};
	const books = ['Zulu', 'Yankee', 'Bravo', 'Alpha', 'Charlie', 'Delta'].map((title, index) => ({
		id: index + 1,
		title,
		author: `Author ${index + 1}`,
		genre: 'FICTION',
	}));
	const bookRows = [books[0], books[0], books[1], books[1], books[1], ...books.slice(2)].map(
		(book) => ({bookCopy: {book}}),
	);
	fixture.mock.transaction.findMany = async (args: {
		where: {type: string | {in: string[]}};
		select: unknown;
	}) => {
		if (args.where.type === 'BORROW') {
			assert.deepEqual(args, {
				where: {memberId, type: 'BORROW', dateTimeCreated: {gte: startOfLast90Days, lte: now}},
				select: {
					bookCopy: {select: {book: {select: {id: true, title: true, author: true, genre: true}}}},
				},
			});
			return [...bookRows, {bookCopy: null}];
		}
		if (typeof args.where.type !== 'string' && args.where.type.in.includes('BORROW')) {
			assert.deepEqual(args, {
				where: {
					memberId,
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
				{type: 'BORROW', dateTimeCreated: new Date(2026, 10, 1)},
			];
		}
		assert.deepEqual(args, {
			where: {
				memberId,
				type: {in: ['RESERVE', 'UNRESERVE']},
				dateTimeCreated: {gte: startOfLast7Days},
			},
			select: {type: true, dateTimeCreated: true},
		});
		return [
			{type: 'RESERVE', dateTimeCreated: startOfLast7Days},
			{type: 'RESERVE', dateTimeCreated: new Date(2026, 10, 15, 8)},
			{type: 'UNRESERVE', dateTimeCreated: new Date(2026, 10, 14, 16)},
			{type: 'RESERVE', dateTimeCreated: new Date(2026, 10, 8)},
		];
	};

	const response = await fixture.app.inject({url: `/members/${memberId}/stats`, headers});
	assert.equal(response.statusCode, 200, response.body);
	const data = MemberStatsDefinition.parse(response.json().data);
	assert.equal(data.totalOutstandingBorrows, 2);
	assert.equal(data.totalPendingReservations, 3);
	assert.equal(data.totalReadyToClaimReservations, 1);
	assert.deepEqual(data.monthOverMonth, {borrows: {current: 4, previous: 8}});
	assert.deepEqual(data.topBorrowedBooksLast90Days, [
		{book: books[1], total: 3},
		{book: books[0], total: 2},
		{book: books[3], total: 1},
		{book: books[2], total: 1},
		{book: books[4], total: 1},
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

test('GET /members', async () => {
	const headers = await fixture.auth();
	const member = fixture.member();
	fixture.mock.member.count = async () => 1;
	fixture.mock.member.findMany = async () => [member];
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/members?externalId__eq=${member.externalId}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.total, 1);
	assert.equal(response.json().data.rows[0].id, member.id);
});

test('GET /members/:id', async () => {
	const headers = await fixture.auth();
	const member = fixture.member();
	fixture.mock.member.findUnique = async () => member;
	const response = await fixture.app.inject({method: 'GET', url: `/members/${member.id}`, headers});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.externalId, member.externalId);
});

test('POST /members', async () => {
	const headers = await fixture.auth();
	const member = fixture.member();
	fixture.mock.member.exists = async () => false;
	fixture.mock.member.create = async () => member;
	const response = await fixture.app.inject({
		method: 'POST',
		url: '/members',
		headers,
		payload: {
			externalId: member.externalId,
			name: member.name,
		},
	});
	assert.equal(response.statusCode, 201, response.body);
	assert.equal(response.json().data.externalId, member.externalId);
});

test('PATCH /members/:id', async () => {
	const headers = await fixture.auth();
	const member = {...fixture.member(), name: faker.person.fullName()};
	fixture.mock.member.exists = async () => true;
	fixture.mock.member.update = async () => member;
	const response = await fixture.app.inject({
		method: 'PATCH',
		url: `/members/${member.id}`,
		headers,
		payload: {name: member.name},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.name, member.name);
});

test('DELETE /members/:id', async () => {
	const headers = await fixture.auth();
	fixture.mock.bookCopy.updateMany = async () => ({count: 0});
	fixture.mock.member.deleteMany = async () => ({count: 1});
	const response = await fixture.app.inject({
		method: 'DELETE',
		url: `/members/${faker.number.int({min: 1})}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(response.json(), {ok: true});
});

test('POST /members/export', async () => {
	const headers = await fixture.auth();
	const member = fixture.member();
	fixture.mock.member.findMany = async () => [member];
	const response = await fixture.app.inject({method: 'POST', url: '/members/export', headers});
	assert.equal(response.statusCode, 200, response.body);
	const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
	assert.ok(
		XLSX.utils
			.sheet_to_json<{externalId: string}>(workbook.Sheets[workbook.SheetNames[0]])
			.some((row) => row.externalId === member.externalId),
	);
});
