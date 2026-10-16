import {randomUUID} from 'node:crypto';
import {hash} from 'bcrypt';
import type {FastifyInstance} from 'fastify';
import {prisma} from '../src/config/prisma';
import {createApp} from '../src/createApp';

// Keep the server from enabling the development logger and secure cookies while testing.
process.env.NODE_ENV = 'test';

export type InjectResponse = Awaited<ReturnType<FastifyInstance['inject']>>;

export interface TestAccount {
	id: number;
	name: string;
	email: string;
	password: string;
}

const TEST_ACCOUNT_EMAIL_PREFIX = 'route-tests+';
const TEST_ACCOUNT_PASSWORD = 'password123';

export async function buildServer(): Promise<FastifyInstance> {
	return createApp();
}

export function getSessionCookie(response: InjectResponse): string {
	const setCookie = response.headers['set-cookie'];
	const cookies = setCookie == null ? [] : Array.isArray(setCookie) ? setCookie : [setCookie];
	const session = cookies.find((cookie) => cookie.startsWith('session='));

	if (session == null) throw new Error('Expected a session cookie in the response');

	return session.split(';')[0];
}

export async function getCsrf(server: FastifyInstance): Promise<{cookie: string; token: string}> {
	const response = await server.inject({method: 'GET', url: '/csrf'});
	const body = response.json() as {ok: boolean; data: {token: string}};

	if (body.ok !== true || typeof body.data.token !== 'string') {
		throw new Error('Expected a csrf token in the response');
	}

	return {cookie: getSessionCookie(response), token: body.data.token};
}

/**
 * Attempts to log in. The session cookie is only set when the login succeeds,
 * so `cookie` is undefined for failed attempts (check `response.statusCode`).
 */
export async function login(
	server: FastifyInstance,
	credentials: {email: string; password: string},
): Promise<{response: InjectResponse; cookie: string | undefined; token: string}> {
	const {cookie, token} = await getCsrf(server);
	const response = await server.inject({
		method: 'POST',
		url: '/sessions',
		headers: {cookie, 'x-csrf-token': token, 'content-type': 'application/json'},
		payload: credentials,
	});

	return {
		response,
		cookie: response.headers['set-cookie'] == null ? undefined : getSessionCookie(response),
		token,
	};
}

export async function createTestAccount(
	prefix: string = TEST_ACCOUNT_EMAIL_PREFIX,
): Promise<TestAccount> {
	const email = `${prefix}${randomUUID()}@library.test`;
	const account = await prisma.account.create({
		data: {
			name: 'Route Tests',
			email,
			password: await hash(TEST_ACCOUNT_PASSWORD, 10),
		},
		select: {id: true, name: true, email: true},
	});

	return {...account, password: TEST_ACCOUNT_PASSWORD};
}

export async function deleteTestAccounts(
	prefix: string = TEST_ACCOUNT_EMAIL_PREFIX,
): Promise<void> {
	await prisma.account.deleteMany({
		where: {email: {startsWith: prefix}},
	});
}

export interface TestBook {
	id: number;
	title: string;
	author: string;
	genre: string;
	yearPublished: number;
}

export async function createTestBook(prefix: string): Promise<TestBook> {
	return prisma.book.create({
		data: {
			title: `${prefix}${randomUUID()}`,
			author: 'Route Tests',
			genre: 'FANTASY',
			yearPublished: 2024,
		},
		select: {id: true, title: true, author: true, genre: true, yearPublished: true},
	});
}

export async function deleteTestBooks(prefix: string): Promise<void> {
	await prisma.book.deleteMany({where: {title: {startsWith: prefix}}});
}

export interface TestMember {
	id: number;
	externalId: string;
	name: string;
	course: string | null;
	yearAndSection: string | null;
}

export async function createTestMember(prefix: string): Promise<TestMember> {
	return prisma.member.create({
		data: {
			externalId: `${prefix}${randomUUID()}`,
			name: 'Route Tests',
			course: 'BS Computer Science',
			yearAndSection: '3-1',
		},
		select: {
			id: true,
			externalId: true,
			name: true,
			course: true,
			yearAndSection: true,
		},
	});
}

export async function deleteTestMembers(prefix: string): Promise<void> {
	await prisma.member.deleteMany({where: {externalId: {startsWith: prefix}}});
}

export interface TestBookCopy {
	id: number;
	isbn: string;
	bookId: number;
	status: string;
}

export async function createTestBookCopy(prefix: string, bookId: number): Promise<TestBookCopy> {
	return prisma.bookCopy.create({
		data: {isbn: `${prefix}${randomUUID()}`, bookId},
		select: {id: true, isbn: true, bookId: true, status: true},
	});
}

export interface TestTransaction {
	id: number;
	type: string;
	status: string;
	ticket: string;
	remarks: string | null;
	memberId: number;
	bookCopyId: number;
}

export async function createTestTransaction(
	prefix: string,
	data: {
		type: 'BORROW' | 'RETURN';
		status?: 'PENDING' | 'COMPLETED';
		remarks?: string | null;
		memberId: number;
		bookCopyId: number;
	},
): Promise<TestTransaction> {
	return prisma.transaction.create({
		data: {
			type: data.type,
			status: data.status ?? 'PENDING',
			ticket: `${prefix}${randomUUID()}`,
			remarks: data.remarks ?? null,
			memberId: data.memberId,
			bookCopyId: data.bookCopyId,
		},
		select: {
			id: true,
			type: true,
			status: true,
			ticket: true,
			remarks: true,
			memberId: true,
			bookCopyId: true,
		},
	});
}

export async function disconnectPrisma(): Promise<void> {
	await prisma.$disconnect();
}
