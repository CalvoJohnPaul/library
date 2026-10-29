import assert from 'node:assert/strict';
import {test} from 'vitest';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /stats', async () => {
	const anonymous = await fixture.app.inject({method: 'GET', url: '/stats'});
	assert.equal(anonymous.statusCode, 401);
	const headers = await fixture.auth();
	const book = await fixture.book();
	fixture.mock.book.count = async () => 1;
	fixture.mock.bookCopy.count = async (args?: {where?: {status?: string}}) => {
		if (!args?.where?.status) return 1;
		assert.ok(['AVAILABLE', 'BORROWED'].includes(args.where.status));
		return args.where.status === 'AVAILABLE' ? 0 : 1;
	};
	fixture.mock.reservation.count = async (args: {where: unknown}) => {
		if (args.where && typeof args.where === 'object' && 'bookCopy' in args.where) {
			assert.deepEqual(args.where, {status: 'PENDING', bookCopy: {is: {status: 'RESERVED'}}});
			return 1;
		}
		assert.deepEqual(args.where, {status: 'PENDING'});
		return 2;
	};
	fixture.mock.member.count = async () => 0;
	fixture.mock.transaction.count = async () => 0;
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	fixture.mock.transaction.findMany = async (args: {
		where: {type: {in?: string[]}; dateTimeCreated?: {gte: Date}};
		select?: {bookCopy?: {select: {book: {select: unknown}}}};
	}) => {
		if (args.select?.bookCopy) {
			assert.deepEqual(args.select.bookCopy.select.book.select, {
				id: true,
				title: true,
				author: true,
				genre: true,
			});
			return [
				{
					bookCopy: {
						book: {id: book.id, title: book.title, author: book.author, genre: book.genre},
					},
				},
			];
		}
		if (args.where.type?.in?.includes('RESERVE')) {
			assert.deepEqual(args.where.type.in, ['RESERVE', 'UNRESERVE']);
			const startOfLast7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
			assert.equal(args.where.dateTimeCreated?.gte.getTime(), startOfLast7Days.getTime());
			return [
				{type: 'RESERVE', dateTimeCreated: today},
				{type: 'UNRESERVE', dateTimeCreated: yesterday},
			];
		}
		return [];
	};
	fixture.mock.book.findMany = async () => [{genre: book.genre, _count: {copies: 1}}];
	const response = await fixture.app.inject({method: 'GET', url: '/stats', headers});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.totalBooks, 1);
	assert.equal(response.json().data.totalBookCopies, 1);
	assert.equal(response.json().data.totalAvailableCopies, 0);
	assert.equal(response.json().data.totalPendingReservations, 2);
	assert.equal(response.json().data.totalReadyToClaimReservations, 1);
	assert.deepEqual(response.json().data.topBorrowedBooksThisMonth, [
		{book: {id: book.id, title: book.title, author: book.author, genre: book.genre}, total: 1},
	]);
	const activity = response.json().data.last7DaysReservationActivity;
	assert.equal(activity.length, 7);
	assert.equal(activity.at(-1).totalBooksReserved, 1);
	assert.equal(activity.at(-1).totalBooksUnreserved, 0);
	assert.equal(activity.at(-2).totalBooksReserved, 0);
	assert.equal(activity.at(-2).totalBooksUnreserved, 1);
	assert.ok(
		activity
			.slice(0, -2)
			.every(
				(point: {totalBooksReserved: number; totalBooksUnreserved: number}) =>
					point.totalBooksReserved === 0 && point.totalBooksUnreserved === 0,
			),
	);
});
