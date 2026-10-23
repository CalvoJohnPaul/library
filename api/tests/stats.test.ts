import assert from 'node:assert/strict';
import {after, before, describe, it} from 'node:test';
import type {FastifyInstance} from 'fastify';
import {
	buildServer,
	createTestAccount,
	createTestBook,
	createTestBookCopy,
	createTestMember,
	deleteTestAccounts,
	deleteTestBooks,
	deleteTestMembers,
	disconnectPrisma,
	login,
	type TestAccount,
	type TestBook,
	type TestBookCopy,
	type TestMember,
} from './helpers';

describe('stats routes', () => {
	const EMAIL_PREFIX = 'route-tests+stats+';
	const BOOK_TITLE_PREFIX = 'Route Tests Stats Book ';
	const MEMBER_EXTERNAL_ID_PREFIX = 'Route Tests Stats Member ';

	let server: FastifyInstance;
	let account: TestAccount;
	let cookie: string | undefined;
	let token: string;
	let book: TestBook;
	let member: TestMember;
	let copy: TestBookCopy;

	before(async () => {
		server = await buildServer();
		await deleteTestAccounts(EMAIL_PREFIX);
		await deleteTestBooks(BOOK_TITLE_PREFIX);
		await deleteTestMembers(MEMBER_EXTERNAL_ID_PREFIX);
		account = await createTestAccount(EMAIL_PREFIX);
		({cookie, token} = await login(server, {
			email: account.email,
			password: account.password,
		}));
		book = await createTestBook(BOOK_TITLE_PREFIX);
		member = await createTestMember(MEMBER_EXTERNAL_ID_PREFIX);
		copy = await createTestBookCopy(book.id);
	});

	after(async () => {
		await deleteTestBooks(BOOK_TITLE_PREFIX);
		await deleteTestMembers(MEMBER_EXTERNAL_ID_PREFIX);
		await deleteTestAccounts(EMAIL_PREFIX);
		await disconnectPrisma();
		await server?.close();
	});

	describe('GET /stats', () => {
		it('rejects an unauthenticated request', async () => {
			const response = await server.inject({method: 'GET', url: '/stats'});

			assert.equal(response.statusCode, 401);
			assert.equal(response.json().ok, false);
		});

		it('returns library statistics', async () => {
			const borrow = await server.inject({
				method: 'POST',
				url: `/book-copies/${copy.id}/borrow`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {memberId: member.id},
			});

			assert.equal(borrow.statusCode, 200);

			const response = await server.inject({
				method: 'GET',
				url: '/stats',
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.ok(body.data.totalBooks >= 1);
			assert.ok(body.data.totalBookCopies >= 1);
			assert.ok(body.data.totalOutstandingBorrows >= 1);

			const activity = body.data.last14DaysActivity;

			assert.equal(activity.length, 14);

			for (const [index, point] of activity.entries()) {
				assert.equal(typeof point.timestamp, 'string');
				assert.equal(typeof point.totalBooksBorrowed, 'number');
				assert.equal(typeof point.totalBooksReturned, 'number');

				if (index > 0) {
					assert.ok(new Date(point.timestamp) > new Date(activity[index - 1].timestamp));
				}
			}

			assert.ok(activity.at(-1).totalBooksBorrowed >= 1);
			assert.ok(Array.isArray(body.data.topBorrowedBooksThisMonth));
			assert.ok(body.data.topBorrowedBooksThisMonth.length <= 30);
			assert.equal(typeof body.data.topBorrowedBooksThisMonth[0]?.book.genre, 'string');

			assert.ok(Array.isArray(body.data.topBorrowedMembersThisMonth));
			assert.ok(body.data.topBorrowedMembersThisMonth.length <= 5);
			assert.ok(body.data.topBorrowedMembersThisMonth[0]?.total >= 1);
			assert.equal(typeof body.data.topBorrowedMembersThisMonth[0]?.member.externalId, 'string');

			const monthOverMonth = body.data.monthOverMonth;

			assert.equal(typeof monthOverMonth.newBooks.current, 'number');
			assert.equal(typeof monthOverMonth.newBooks.previous, 'number');
			assert.equal(typeof monthOverMonth.newCopies.current, 'number');
			assert.equal(typeof monthOverMonth.newCopies.previous, 'number');
			assert.equal(typeof monthOverMonth.newMembers.current, 'number');
			assert.equal(typeof monthOverMonth.newMembers.previous, 'number');
			assert.equal(typeof monthOverMonth.borrows.current, 'number');
			assert.equal(typeof monthOverMonth.borrows.previous, 'number');
			assert.ok(monthOverMonth.borrows.current >= 1);

			const genre = body.data.totalBookCopiesByGenre.find(
				(point: {genre: string}) => point.genre === book.genre,
			);

			assert.ok(genre?.total >= 1);
		});
	});
});
