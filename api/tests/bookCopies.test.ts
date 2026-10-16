import assert from 'node:assert/strict';
import {after, before, describe, it} from 'node:test';
import type {FastifyInstance} from 'fastify';
import {prisma} from '../src/config/prisma';
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

describe('book copy routes', () => {
	const EMAIL_PREFIX = 'route-tests+book-copies+';
	const BOOK_TITLE_PREFIX = 'Route Tests Copy Book ';
	const MEMBER_EXTERNAL_ID_PREFIX = 'Route Tests Copy Member ';
	const ISBN_PREFIX = 'route-tests-copy-';

	let server: FastifyInstance;
	let account: TestAccount;
	let cookie: string | undefined;
	let token: string;
	let book: TestBook;
	let member: TestMember;
	let copy: TestBookCopy;
	let patchableCopy: TestBookCopy;
	let borrowableCopy: TestBookCopy;

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
		copy = await createTestBookCopy(ISBN_PREFIX, book.id);
		patchableCopy = await createTestBookCopy(ISBN_PREFIX, book.id);
		borrowableCopy = await createTestBookCopy(ISBN_PREFIX, book.id);
	});

	after(async () => {
		await deleteTestBooks(BOOK_TITLE_PREFIX);
		await deleteTestMembers(MEMBER_EXTERNAL_ID_PREFIX);
		await deleteTestAccounts(EMAIL_PREFIX);
		await disconnectPrisma();
		await server?.close();
	});

	describe('GET /book-copies', () => {
		it('rejects an unauthenticated request', async () => {
			const response = await server.inject({method: 'GET', url: '/book-copies'});

			assert.equal(response.statusCode, 401);
			assert.equal(response.json().ok, false);
		});

		it('lists book copies with their book', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/book-copies',
				query: {isbn__eq: copy.isbn},
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.total, 1);
			assert.equal(body.data.rows.length, 1);
			assert.equal(body.data.rows[0].id, copy.id);
			assert.equal(body.data.rows[0].isbn, copy.isbn);
			assert.equal(body.data.rows[0].status, 'AVAILABLE');
			assert.equal(body.data.rows[0].book.id, book.id);
			assert.equal(body.data.rows[0].book.title, book.title);
			assert.equal(body.data.rows[0].book.author, book.author);
			assert.equal(body.data.rows[0].book.genre, book.genre);
			assert.equal(body.data.rows[0].book.yearPublished, book.yearPublished);
		});
	});

	describe('GET /book-copies/:id', () => {
		it('returns a book copy', async () => {
			const response = await server.inject({
				method: 'GET',
				url: `/book-copies/${copy.id}`,
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.data.id, copy.id);
			assert.equal(body.data.isbn, copy.isbn);
			assert.equal(body.data.status, 'AVAILABLE');
			assert.equal(body.data.book.id, book.id);
		});

		it('returns 404 for a missing book copy', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/book-copies/999999999',
				headers: {cookie},
			});

			assert.equal(response.statusCode, 404);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'NotFoundError', message: 'Not Found'},
			});
		});
	});

	describe('POST /book-copies', () => {
		it('rejects a request without a csrf token', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/book-copies',
				headers: {'content-type': 'application/json'},
				payload: {isbn: `${ISBN_PREFIX}created`, bookId: book.id},
			});

			assert.equal(response.statusCode, 403);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'FastifyError', message: 'Missing csrf secret'},
			});
		});

		it('rejects an invalid body', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/book-copies',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {isbn: `${ISBN_PREFIX}invalid`},
			});

			assert.equal(response.statusCode, 400);
			assert.equal(response.json().ok, false);
		});

		it('rejects an unknown book', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/book-copies',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {isbn: `${ISBN_PREFIX}unknown-book`, bookId: 999999999},
			});

			assert.equal(response.statusCode, 400);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'BadRequestError', message: 'Book not found'},
			});
		});

		it('creates a book copy', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/book-copies',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {isbn: `${ISBN_PREFIX}created`, bookId: book.id},
			});
			const body = response.json();

			assert.equal(response.statusCode, 201);
			assert.equal(body.ok, true);
			assert.equal(body.data.isbn, `${ISBN_PREFIX}created`);
			assert.equal(body.data.status, 'AVAILABLE');
			assert.equal(body.data.book.id, book.id);

			const stored = await prisma.bookCopy.findUnique({
				where: {isbn: `${ISBN_PREFIX}created`},
				select: {bookId: true, status: true},
			});

			assert.equal(stored?.bookId, book.id);
			assert.equal(stored?.status, 'AVAILABLE');
		});

		it('rejects a duplicate isbn', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/book-copies',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {isbn: `${ISBN_PREFIX}created`, bookId: book.id},
			});

			assert.equal(response.statusCode, 409);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'ConflictError', message: 'ISBN already exists'},
			});
		});
	});

	describe('PATCH /book-copies/:id', () => {
		it('returns 404 for a missing book copy', async () => {
			const response = await server.inject({
				method: 'PATCH',
				url: '/book-copies/999999999',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {isbn: `${ISBN_PREFIX}patched`},
			});

			assert.equal(response.statusCode, 404);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'NotFoundError', message: 'Not Found'},
			});
		});

		it('rejects an unknown book', async () => {
			const response = await server.inject({
				method: 'PATCH',
				url: `/book-copies/${patchableCopy.id}`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {bookId: 999999999},
			});

			assert.equal(response.statusCode, 400);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'BadRequestError', message: 'Book not found'},
			});
		});

		it('rejects an isbn that already exists', async () => {
			const response = await server.inject({
				method: 'PATCH',
				url: `/book-copies/${patchableCopy.id}`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {isbn: copy.isbn},
			});

			assert.equal(response.statusCode, 409);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'ConflictError', message: 'ISBN already exists'},
			});
		});

		it('updates a book copy', async () => {
			const response = await server.inject({
				method: 'PATCH',
				url: `/book-copies/${patchableCopy.id}`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {isbn: `${ISBN_PREFIX}patched`},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.isbn, `${ISBN_PREFIX}patched`);

			const stored = await prisma.bookCopy.findUnique({
				where: {id: patchableCopy.id},
				select: {isbn: true},
			});

			assert.equal(stored?.isbn, `${ISBN_PREFIX}patched`);
		});
	});

	describe('DELETE /book-copies/:id', () => {
		it('deletes a book copy', async () => {
			const response = await server.inject({
				method: 'DELETE',
				url: `/book-copies/${patchableCopy.id}`,
				headers: {cookie, 'x-csrf-token': token},
			});

			assert.equal(response.statusCode, 200);
			assert.deepEqual(response.json(), {ok: true});

			const stored = await prisma.bookCopy.findUnique({
				where: {id: patchableCopy.id},
				select: {id: true},
			});

			assert.equal(stored, null);
		});
	});

	describe('POST /book-copies/:id/borrow and /book-copies/:id/return', () => {
		it('rejects a request without a csrf token', async () => {
			const response = await server.inject({
				method: 'POST',
				url: `/book-copies/${borrowableCopy.id}/borrow`,
				headers: {'content-type': 'application/json'},
				payload: {memberId: member.id},
			});

			assert.equal(response.statusCode, 403);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'FastifyError', message: 'Missing csrf secret'},
			});
		});

		it('returns 404 for a missing book copy', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/book-copies/999999999/borrow',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {memberId: member.id},
			});

			assert.equal(response.statusCode, 404);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'NotFoundError', message: 'Not Found'},
			});
		});

		it('rejects an unknown member', async () => {
			const response = await server.inject({
				method: 'POST',
				url: `/book-copies/${borrowableCopy.id}/borrow`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {memberId: 999999999},
			});

			assert.equal(response.statusCode, 400);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'BadRequestError', message: 'Member not found'},
			});
		});

		it('borrows a book copy', async () => {
			const response = await server.inject({
				method: 'POST',
				url: `/book-copies/${borrowableCopy.id}/borrow`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {memberId: member.id, remarks: 'Route test borrow'},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.bookCopy.id, borrowableCopy.id);
			assert.equal(body.data.bookCopy.status, 'BORROWED');
			assert.equal(body.data.transaction.type, 'BORROW');
			assert.equal(body.data.transaction.status, 'PENDING');
			assert.match(body.data.transaction.ticket, /^\d{4}-[A-Z0-9]{4}-\d{8}$/);
			assert.equal(body.data.transaction.remarks, 'Route test borrow');
			assert.equal(body.data.transaction.member.id, member.id);
			assert.equal(body.data.transaction.bookCopy.id, borrowableCopy.id);

			const storedCopy = await prisma.bookCopy.findUnique({
				where: {id: borrowableCopy.id},
				select: {status: true},
			});

			assert.equal(storedCopy?.status, 'BORROWED');

			const storedMember = await prisma.member.findUnique({
				where: {id: member.id},
				select: {dateTimeLastBorrowedBook: true},
			});

			assert.ok(storedMember?.dateTimeLastBorrowedBook != null);
		});

		it('rejects borrowing an unavailable book copy', async () => {
			const response = await server.inject({
				method: 'POST',
				url: `/book-copies/${borrowableCopy.id}/borrow`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {memberId: member.id},
			});

			assert.equal(response.statusCode, 409);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'ConflictError', message: 'Book copy is not available'},
			});
		});

		it('returns a borrowed book copy', async () => {
			const borrow = await prisma.transaction.findFirst({
				where: {bookCopyId: borrowableCopy.id, type: 'BORROW', status: 'PENDING'},
				select: {ticket: true},
			});

			const response = await server.inject({
				method: 'POST',
				url: `/book-copies/${borrowableCopy.id}/return`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {remarks: 'Route test return'},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.bookCopy.status, 'AVAILABLE');
			assert.equal(body.data.transaction.type, 'RETURN');
			assert.equal(body.data.transaction.status, 'COMPLETED');
			assert.equal(body.data.transaction.ticket, borrow?.ticket);
			assert.equal(body.data.transaction.remarks, 'Route test return');
			assert.equal(body.data.transaction.member.id, member.id);

			const storedCopy = await prisma.bookCopy.findUnique({
				where: {id: borrowableCopy.id},
				select: {status: true},
			});

			assert.equal(storedCopy?.status, 'AVAILABLE');

			const storedBorrow = await prisma.transaction.findFirst({
				where: {bookCopyId: borrowableCopy.id, type: 'BORROW'},
				select: {status: true},
			});

			assert.equal(storedBorrow?.status, 'COMPLETED');
		});

		it('rejects returning a book copy that is not borrowed', async () => {
			const response = await server.inject({
				method: 'POST',
				url: `/book-copies/${borrowableCopy.id}/return`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {remarks: null},
			});

			assert.equal(response.statusCode, 409);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'ConflictError', message: 'Book copy is not borrowed'},
			});
		});
	});

	describe('POST /book-copies/export', () => {
		it('exports book copies as an excel workbook', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/book-copies/export',
				headers: {cookie},
			});

			assert.equal(response.statusCode, 200);
			assert.ok(response.headers['content-type']?.includes('spreadsheetml'));
			assert.equal(response.rawPayload.subarray(0, 2).toString(), 'PK');
		});
	});
});
