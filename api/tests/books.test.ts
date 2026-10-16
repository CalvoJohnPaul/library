import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {after, before, describe, it} from 'node:test';
import type {FastifyInstance} from 'fastify';
import {prisma} from '../src/config/prisma';
import {
	buildServer,
	createTestAccount,
	createTestBook,
	deleteTestAccounts,
	deleteTestBooks,
	disconnectPrisma,
	login,
	type TestAccount,
	type TestBook,
} from './helpers';

describe('book routes', () => {
	const EMAIL_PREFIX = 'route-tests+books+';
	const BOOK_TITLE_PREFIX = 'Route Tests Book ';

	let server: FastifyInstance;
	let account: TestAccount;
	let cookie: string | undefined;
	let token: string;
	let books: TestBook[] = [];

	before(async () => {
		server = await buildServer();
		await deleteTestAccounts(EMAIL_PREFIX);
		await deleteTestBooks(BOOK_TITLE_PREFIX);
		account = await createTestAccount(EMAIL_PREFIX);
		({cookie, token} = await login(server, {
			email: account.email,
			password: account.password,
		}));
		books = [
			await createTestBook(BOOK_TITLE_PREFIX),
			await createTestBook(BOOK_TITLE_PREFIX),
			await createTestBook(BOOK_TITLE_PREFIX),
		];
	});

	after(async () => {
		await deleteTestBooks(BOOK_TITLE_PREFIX);
		await deleteTestAccounts(EMAIL_PREFIX);
		await disconnectPrisma();
		await server?.close();
	});

	describe('POST /books', () => {
		it('rejects a request without a csrf token', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/books',
				headers: {'content-type': 'application/json'},
				payload: {
					title: 'New Book',
					author: 'Author',
					genre: 'FANTASY',
					yearPublished: 2024,
				},
			});

			assert.equal(response.statusCode, 403);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'FastifyError', message: 'Missing csrf secret'},
			});
		});

		it('rejects a request with an invalid csrf token', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/books',
				headers: {cookie, 'x-csrf-token': 'invalid-token', 'content-type': 'application/json'},
				payload: {
					title: 'New Book',
					author: 'Author',
					genre: 'FANTASY',
					yearPublished: 2024,
				},
			});

			assert.equal(response.statusCode, 403);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'FastifyError', message: 'Invalid csrf token'},
			});
		});

		it('rejects an invalid body', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/books',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {title: '', author: '', genre: 'INVALID', yearPublished: -1},
			});

			assert.equal(response.statusCode, 400);
			assert.equal(response.json().ok, false);
		});

		it('creates a book', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/books',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {
					title: `${BOOK_TITLE_PREFIX}Created ${randomUUID()}`,
					author: 'Route Tests Author',
					genre: 'FANTASY',
					yearPublished: 2024,
				},
			});
			const body = response.json();

			assert.equal(response.statusCode, 201);
			assert.equal(body.ok, true);
			assert.equal(body.data.author, 'Route Tests Author');
			assert.equal(body.data.genre, 'FANTASY');
			assert.equal(body.data.yearPublished, 2024);
			assert.equal(body.data.totalCopies, 0);
			assert.equal(body.data.available, false);

			const stored = await prisma.book.findUnique({
				where: {id: body.data.id},
				select: {author: true},
			});

			assert.equal(stored?.author, 'Route Tests Author');
		});
	});

	describe('GET /books', () => {
		it('rejects an unauthenticated request', async () => {
			const response = await server.inject({method: 'GET', url: '/books'});

			assert.equal(response.statusCode, 401);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'UnauthorizedError', message: 'Unauthorized'},
			});
		});

		it('lists books with pagination metadata', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/books',
				query: {id__in: books.map((book) => book.id.toString())},
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.total, 3);
			assert.equal(body.data.rows.length, 3);
			assert.deepEqual(
				body.data.rows.map((row: {id: number}) => row.id).sort(),
				books.map((book) => book.id).sort(),
			);
			assert.equal(body.data.hasNext, false);
			assert.equal(body.data.hasPrevious, false);
			assert.equal(body.data.next, null);
			assert.equal(body.data.previous, null);
		});

		it('filters books by title', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/books',
				query: {title__contains: books[1].title},
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.data.total, 1);
			assert.equal(body.data.rows[0].title, books[1].title);
		});

		it('filters books by genre', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/books',
				query: {id__in: books.map((book) => book.id.toString()), genre__eq: 'FANTASY'},
				headers: {cookie},
			});

			assert.equal(response.statusCode, 200);
			assert.equal(response.json().data.total, 3);
		});

		it('filters books by availability', async () => {
			await prisma.bookCopy.create({
				data: {
					isbn: `route-tests-book-${books[0].id}-${randomUUID()}`,
					bookId: books[0].id,
				},
			});

			const available = await server.inject({
				method: 'GET',
				url: '/books',
				query: {
					id__in: books.map((book) => book.id.toString()),
					available__eq: 'true',
				},
				headers: {cookie},
			});
			const availableBody = available.json();

			assert.equal(available.statusCode, 200);
			assert.equal(availableBody.data.total, 1);
			assert.equal(availableBody.data.rows[0].id, books[0].id);
			assert.equal(availableBody.data.rows[0].totalCopies, 1);
			assert.equal(availableBody.data.rows[0].available, true);

			const unavailable = await server.inject({
				method: 'GET',
				url: '/books',
				query: {
					id__in: books.map((book) => book.id.toString()),
					available__eq: 'false',
				},
				headers: {cookie},
			});

			assert.equal(unavailable.statusCode, 200);
			assert.equal(unavailable.json().data.total, 2);
		});
	});

	describe('GET /books/:id', () => {
		it('returns a book', async () => {
			const response = await server.inject({
				method: 'GET',
				url: `/books/${books[2].id}`,
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.id, books[2].id);
			assert.equal(body.data.title, books[2].title);
			assert.equal(body.data.author, books[2].author);
			assert.equal(body.data.genre, books[2].genre);
			assert.equal(body.data.yearPublished, books[2].yearPublished);
		});

		it('returns 404 for a missing book', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/books/999999999',
				headers: {cookie},
			});

			assert.equal(response.statusCode, 404);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'NotFoundError', message: 'Not Found'},
			});
		});

		it('returns 400 for an invalid id', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/books/not-a-number',
				headers: {cookie},
			});

			assert.equal(response.statusCode, 400);
			assert.equal(response.json().ok, false);
		});
	});

	describe('PATCH /books/:id', () => {
		it('returns 404 for a missing book', async () => {
			const response = await server.inject({
				method: 'PATCH',
				url: '/books/999999999',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {title: `${BOOK_TITLE_PREFIX}Updated`},
			});

			assert.equal(response.statusCode, 404);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'NotFoundError', message: 'Not Found'},
			});
		});

		it('updates a book', async () => {
			const response = await server.inject({
				method: 'PATCH',
				url: `/books/${books[1].id}`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {author: 'Updated Author', genre: 'SCIENCE_FICTION'},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.id, books[1].id);
			assert.equal(body.data.author, 'Updated Author');
			assert.equal(body.data.genre, 'SCIENCE_FICTION');

			const stored = await prisma.book.findUnique({
				where: {id: books[1].id},
				select: {author: true, genre: true},
			});

			assert.equal(stored?.author, 'Updated Author');
			assert.equal(stored?.genre, 'SCIENCE_FICTION');
		});
	});

	describe('DELETE /books/:id', () => {
		it('deletes a book', async () => {
			const response = await server.inject({
				method: 'DELETE',
				url: `/books/${books[2].id}`,
				headers: {cookie, 'x-csrf-token': token},
			});

			assert.equal(response.statusCode, 200);
			assert.deepEqual(response.json(), {ok: true});

			const stored = await prisma.book.findUnique({
				where: {id: books[2].id},
				select: {id: true},
			});

			assert.equal(stored, null);
		});
	});

	describe('POST /books/export', () => {
		it('rejects an unauthenticated request', async () => {
			const response = await server.inject({method: 'POST', url: '/books/export'});

			assert.equal(response.statusCode, 401);
			assert.equal(response.json().ok, false);
		});

		it('exports books as an excel workbook', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/books/export',
				headers: {cookie},
			});

			assert.equal(response.statusCode, 200);
			assert.ok(response.headers['content-type']?.includes('spreadsheetml'));
			assert.equal(response.rawPayload.subarray(0, 2).toString(), 'PK');
		});
	});
});
