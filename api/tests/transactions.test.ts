import assert from 'node:assert/strict';
import {after, before, describe, it} from 'node:test';
import type {FastifyInstance} from 'fastify';
import {
	buildServer,
	createTestAccount,
	createTestBook,
	createTestBookCopy,
	createTestMember,
	createTestTransaction,
	deleteTestAccounts,
	deleteTestBooks,
	deleteTestMembers,
	disconnectPrisma,
	login,
	type TestAccount,
	type TestBook,
	type TestBookCopy,
	type TestMember,
	type TestTransaction,
} from './helpers';

describe('transaction routes', () => {
	const EMAIL_PREFIX = 'route-tests+transactions+';
	const BOOK_TITLE_PREFIX = 'Route Tests Transaction Book ';
	const MEMBER_EXTERNAL_ID_PREFIX = 'Route Tests Transaction Member ';
	const ISBN_PREFIX = 'route-tests-transaction-';
	const TICKET_PREFIX = 'route-tests-transaction-';

	let server: FastifyInstance;
	let account: TestAccount;
	let cookie: string | undefined;
	let book: TestBook;
	let member: TestMember;
	let copy: TestBookCopy;
	let borrow: TestTransaction;
	let returned: TestTransaction;

	before(async () => {
		server = await buildServer();
		await deleteTestAccounts(EMAIL_PREFIX);
		await deleteTestBooks(BOOK_TITLE_PREFIX);
		await deleteTestMembers(MEMBER_EXTERNAL_ID_PREFIX);
		account = await createTestAccount(EMAIL_PREFIX);
		({cookie} = await login(server, {
			email: account.email,
			password: account.password,
		}));
		book = await createTestBook(BOOK_TITLE_PREFIX);
		member = await createTestMember(MEMBER_EXTERNAL_ID_PREFIX);
		copy = await createTestBookCopy(ISBN_PREFIX, book.id);
		borrow = await createTestTransaction(TICKET_PREFIX, {
			type: 'BORROW',
			status: 'PENDING',
			remarks: 'Route test borrow',
			memberId: member.id,
			bookCopyId: copy.id,
		});
		returned = await createTestTransaction(TICKET_PREFIX, {
			type: 'RETURN',
			status: 'COMPLETED',
			remarks: null,
			memberId: member.id,
			bookCopyId: copy.id,
		});
	});

	after(async () => {
		await deleteTestBooks(BOOK_TITLE_PREFIX);
		await deleteTestMembers(MEMBER_EXTERNAL_ID_PREFIX);
		await deleteTestAccounts(EMAIL_PREFIX);
		await disconnectPrisma();
		await server?.close();
	});

	describe('GET /transactions', () => {
		it('rejects an unauthenticated request', async () => {
			const response = await server.inject({method: 'GET', url: '/transactions'});

			assert.equal(response.statusCode, 401);
			assert.equal(response.json().ok, false);
		});

		it('lists transactions with their member and book copy', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/transactions',
				query: {ticket__in: [borrow.ticket, returned.ticket]},
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.total, 2);
			assert.equal(body.data.rows.length, 2);

			const borrowRow = body.data.rows.find(
				(row: {ticket: string}) => row.ticket === borrow.ticket,
			);

			assert.equal(borrowRow.type, 'BORROW');
			assert.equal(borrowRow.status, 'PENDING');
			assert.equal(borrowRow.remarks, 'Route test borrow');
			assert.equal(borrowRow.member.id, member.id);
			assert.equal(borrowRow.member.externalId, member.externalId);
			assert.equal(borrowRow.member.name, member.name);
			assert.equal(borrowRow.bookCopy.id, copy.id);
			assert.equal(borrowRow.bookCopy.isbn, copy.isbn);
			assert.equal(borrowRow.bookCopy.book.id, book.id);
			assert.equal(borrowRow.bookCopy.book.title, book.title);
		});

		it('filters transactions by type', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/transactions',
				query: {
					ticket__in: [borrow.ticket, returned.ticket],
					type__eq: 'RETURN',
				},
				headers: {cookie},
			});

			assert.equal(response.statusCode, 200);
			assert.equal(response.json().data.total, 1);
			assert.equal(response.json().data.rows[0].type, 'RETURN');
		});

		it('filters transactions by status', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/transactions',
				query: {
					ticket__in: [borrow.ticket, returned.ticket],
					status__eq: 'PENDING',
				},
				headers: {cookie},
			});

			assert.equal(response.statusCode, 200);
			assert.equal(response.json().data.total, 1);
			assert.equal(response.json().data.rows[0].status, 'PENDING');
		});

		it('filters transactions by book id', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/transactions',
				query: {
					ticket__in: [borrow.ticket, returned.ticket],
					bookId__eq: book.id.toString(),
				},
				headers: {cookie},
			});

			assert.equal(response.statusCode, 200);
			assert.equal(response.json().data.total, 2);
		});
	});

	describe('GET /transactions/:id', () => {
		it('returns a transaction', async () => {
			const response = await server.inject({
				method: 'GET',
				url: `/transactions/${borrow.id}`,
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.id, borrow.id);
			assert.equal(body.data.type, 'BORROW');
			assert.equal(body.data.status, 'PENDING');
			assert.equal(body.data.ticket, borrow.ticket);
			assert.equal(body.data.member.id, member.id);
			assert.equal(body.data.bookCopy.id, copy.id);
		});

		it('returns 404 for a missing transaction', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/transactions/999999999',
				headers: {cookie},
			});

			assert.equal(response.statusCode, 404);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'NotFoundError', message: 'Not Found'},
			});
		});
	});

	describe('POST /transactions/export', () => {
		it('rejects an unauthenticated request', async () => {
			const response = await server.inject({method: 'POST', url: '/transactions/export'});

			assert.equal(response.statusCode, 401);
			assert.equal(response.json().ok, false);
		});

		it('exports transactions as an excel workbook', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/transactions/export',
				headers: {cookie},
			});

			assert.equal(response.statusCode, 200);
			assert.ok(response.headers['content-type']?.includes('spreadsheetml'));
			assert.equal(response.rawPayload.subarray(0, 2).toString(), 'PK');
		});
	});
});
