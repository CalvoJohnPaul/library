import assert from 'node:assert/strict';
import {after, before, describe, it} from 'node:test';
import type {FastifyInstance} from 'fastify';
import {faker} from '@faker-js/faker';
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
	fakeMemberInput,
	login,
	type TestAccount,
	type TestMember,
} from './helpers';

describe('member routes', () => {
	const EMAIL_PREFIX = 'route-tests+members+';
	const MEMBER_EXTERNAL_ID_PREFIX = 'Route Tests Member ';
	const BOOK_TITLE_PREFIX = 'Route Tests Member Book ';

	let server: FastifyInstance;
	let account: TestAccount;
	let cookie: string | undefined;
	let token: string;
	let member: TestMember;
	let createdMemberExternalId: string;

	before(async () => {
		server = await buildServer();
		await deleteTestAccounts(EMAIL_PREFIX);
		await deleteTestMembers(MEMBER_EXTERNAL_ID_PREFIX);
		await deleteTestBooks(BOOK_TITLE_PREFIX);
		account = await createTestAccount(EMAIL_PREFIX);
		({cookie, token} = await login(server, {
			email: account.email,
			password: account.password,
		}));
		member = await createTestMember(MEMBER_EXTERNAL_ID_PREFIX);
	});

	after(async () => {
		await deleteTestBooks(BOOK_TITLE_PREFIX);
		await deleteTestMembers(MEMBER_EXTERNAL_ID_PREFIX);
		await deleteTestAccounts(EMAIL_PREFIX);
		await disconnectPrisma();
		await server?.close();
	});

	describe('POST /members', () => {
		it('rejects a request without a csrf token', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/members',
				headers: {'content-type': 'application/json'},
				payload: fakeMemberInput(),
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
				url: '/members',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {externalId: '', name: ''},
			});

			assert.equal(response.statusCode, 400);
			assert.equal(response.json().ok, false);
		});

		it('creates a member', async () => {
			const input = fakeMemberInput(MEMBER_EXTERNAL_ID_PREFIX);
			const response = await server.inject({
				method: 'POST',
				url: '/members',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: input,
			});
			const body = response.json();

			assert.equal(response.statusCode, 201);
			assert.equal(body.ok, true);
			assert.equal(body.data.externalId, input.externalId);
			assert.equal(body.data.name, input.name);
			assert.equal(body.data.course, input.course);
			assert.equal(body.data.yearAndSection, input.yearAndSection);
			assert.equal(body.data.dateTimeLastBorrowedBook, null);

			const stored = await prisma.member.findUnique({
				where: {externalId: input.externalId},
				select: {name: true},
			});

			assert.equal(stored?.name, input.name);
			createdMemberExternalId = input.externalId;
		});

		it('rejects a duplicate external id', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/members',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {externalId: createdMemberExternalId, name: faker.person.fullName()},
			});

			assert.equal(response.statusCode, 409);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'ConflictError', message: 'Member ID already exists'},
			});
		});
	});

	describe('GET /members', () => {
		it('rejects an unauthenticated request', async () => {
			const response = await server.inject({method: 'GET', url: '/members'});

			assert.equal(response.statusCode, 401);
			assert.equal(response.json().ok, false);
		});

		it('lists members', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/members',
				query: {externalId__eq: member.externalId},
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.total, 1);
			assert.equal(body.data.rows.length, 1);
			assert.equal(body.data.rows[0].id, member.id);
			assert.equal(body.data.rows[0].externalId, member.externalId);
			assert.equal(body.data.rows[0].name, member.name);
			assert.equal(body.data.rows[0].course, member.course);
			assert.equal(body.data.rows[0].yearAndSection, member.yearAndSection);
		});
	});

	describe('GET /members/:id', () => {
		it('returns a member', async () => {
			const response = await server.inject({
				method: 'GET',
				url: `/members/${member.id}`,
				headers: {cookie},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.data.id, member.id);
			assert.equal(body.data.externalId, member.externalId);
			assert.equal(body.data.name, member.name);
		});

		it('returns 404 for a missing member', async () => {
			const response = await server.inject({
				method: 'GET',
				url: '/members/999999999',
				headers: {cookie},
			});

			assert.equal(response.statusCode, 404);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'NotFoundError', message: 'Not Found'},
			});
		});
	});

	describe('PATCH /members/:id', () => {
		it('returns 404 for a missing member', async () => {
			const response = await server.inject({
				method: 'PATCH',
				url: '/members/999999999',
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {name: faker.person.fullName()},
			});

			assert.equal(response.statusCode, 404);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'NotFoundError', message: 'Not Found'},
			});
		});

		it('rejects an external id that already exists', async () => {
			const response = await server.inject({
				method: 'PATCH',
				url: `/members/${member.id}`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {externalId: createdMemberExternalId},
			});

			assert.equal(response.statusCode, 409);
			assert.deepEqual(response.json(), {
				ok: false,
				error: {name: 'ConflictError', message: 'Member ID already exists'},
			});
		});

		it('updates a member', async () => {
			const input = fakeMemberInput();
			const response = await server.inject({
				method: 'PATCH',
				url: `/members/${member.id}`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {name: input.name, course: input.course},
			});
			const body = response.json();

			assert.equal(response.statusCode, 200);
			assert.equal(body.ok, true);
			assert.equal(body.data.id, member.id);
			assert.equal(body.data.name, input.name);
			assert.equal(body.data.course, input.course);

			const stored = await prisma.member.findUnique({
				where: {id: member.id},
				select: {name: true, course: true},
			});

			assert.equal(stored?.name, input.name);
			assert.equal(stored?.course, input.course);
		});
	});

	describe('DELETE /members/:id', () => {
		it('deletes a member', async () => {
			const created = await prisma.member.findUnique({
				where: {externalId: createdMemberExternalId},
				select: {id: true},
			});

			const response = await server.inject({
				method: 'DELETE',
				url: `/members/${created?.id}`,
				headers: {cookie, 'x-csrf-token': token},
			});

			assert.equal(response.statusCode, 200);
			assert.deepEqual(response.json(), {ok: true});

			const stored = await prisma.member.findUnique({
				where: {id: created?.id},
				select: {id: true},
			});

			assert.equal(stored, null);
		});

		it('releases borrowed copies when a member is deleted', async () => {
			const book = await createTestBook(BOOK_TITLE_PREFIX);
			const copy = await createTestBookCopy(book.id);
			const borrower = await createTestMember(MEMBER_EXTERNAL_ID_PREFIX);

			const borrow = await server.inject({
				method: 'POST',
				url: `/book-copies/${copy.id}/borrow`,
				headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
				payload: {memberId: borrower.id},
			});

			assert.equal(borrow.statusCode, 200);

			const response = await server.inject({
				method: 'DELETE',
				url: `/members/${borrower.id}`,
				headers: {cookie, 'x-csrf-token': token},
			});

			assert.equal(response.statusCode, 200);
			assert.deepEqual(response.json(), {ok: true});

			const storedCopy = await prisma.bookCopy.findUnique({
				where: {id: copy.id},
				select: {status: true},
			});

			assert.equal(storedCopy?.status, 'AVAILABLE');
		});
	});

	describe('POST /members/export', () => {
		it('exports members as an excel workbook', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/members/export',
				headers: {cookie},
			});

			assert.equal(response.statusCode, 200);
			assert.ok(response.headers['content-type']?.includes('spreadsheetml'));
			assert.equal(response.rawPayload.subarray(0, 2).toString(), 'PK');
		});
	});
});
