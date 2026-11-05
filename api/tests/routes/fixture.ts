import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {faker} from '@faker-js/faker';
import cors from '@fastify/cors';
import csrf from '@fastify/csrf-protection';
import rateLimit from '@fastify/rate-limit';
import session from '@fastify/secure-session';
import sensible from '@fastify/sensible';
import {hash} from 'bcrypt';
import fastify, {type FastifyInstance} from 'fastify';
import {serializerCompiler, validatorCompiler} from 'fastify-type-provider-zod';
import {afterAll, beforeAll, beforeEach, vi} from 'vitest';
import {prisma as configuredPrisma} from '../../src/config/prisma.js';
import {
	corsOptions,
	handleError,
	rateLimitOptions,
	options as serverOptions,
	sessionOptions,
} from '../../src/createApp.js';
import authPlugin from '../../src/plugins/auth.js';
import exportsPlugin from '../../src/plugins/exports.js';
import prismaPlugin from '../../src/plugins/prisma.js';
import bookCopiesRoute from '../../src/routes/bookCopies.js';
import booksRoute from '../../src/routes/books.js';
import csrfRoute from '../../src/routes/csrf.js';
import healthRoute from '../../src/routes/health.js';
import meRoute from '../../src/routes/me.js';
import membersRoute from '../../src/routes/members.js';
import reservationsRoute from '../../src/routes/reservations.js';
import searchRoute from '../../src/routes/search.js';
import sessionsRoute from '../../src/routes/sessions.js';
import statsRoute from '../../src/routes/stats.js';
import transactionsRoute from '../../src/routes/transactions.js';

type Headers = {cookie: string; 'x-csrf-token': string};
type Method = (...args: never[]) => Promise<unknown>;

const {mock, mockPrisma} = vi.hoisted(() => {
	const unmocked: Method = async () => {
		throw new Error('Unexpected Prisma call: configure a mock for this route');
	};
	function model() {
		return {
			count: unmocked,
			findMany: unmocked,
			findFirst: unmocked,
			findUnique: unmocked,
			findUniqueOrThrow: unmocked,
			exists: unmocked,
			create: unmocked,
			update: unmocked,
			updateMany: unmocked,
			deleteMany: unmocked,
			delete: unmocked,
		};
	}
	function mockPrisma() {
		const sessions = new Map<
			string,
			{
				id: string;
				accountId: number;
				accountVersion: number;
				expiresAt: Date;
			}
		>();
		const client = {
			account: model(),
			session: {
				...model(),
				create: async ({
					data,
				}: {
					data: {
						id: string;
						accountId: number;
						accountVersion: number;
						expiresAt: Date;
					};
				}) => {
					sessions.set(data.id, data);
					return data;
				},
				findUnique: async ({where}: {where: {id: string}}) => {
					const session = sessions.get(where.id);
					if (!session) return null;
					const account: unknown = await client.account.findUnique({
						where: {id: session.accountId},
					} as never);
					return account ? {...session, account} : null;
				},
				deleteMany: async ({
					where,
				}: {
					where: {
						id?: string;
						accountId?: number;
						expiresAt?: {lte: Date};
					};
				}) => {
					let count = 0;
					for (const [id, session] of sessions) {
						if (
							(where.id == null || where.id === id) &&
							(where.accountId == null || where.accountId === session.accountId) &&
							(where.expiresAt == null || session.expiresAt <= where.expiresAt.lte)
						) {
							sessions.delete(id);
							count++;
						}
					}
					return {count};
				},
			},
			book: model(),
			bookCopy: model(),
			member: model(),
			reservation: model(),
			transaction: model(),
			$queryRaw: unmocked,
			$connect: async () => {},
			$disconnect: async () => {},
			$transaction: async (input: unknown): Promise<unknown> =>
				Array.isArray(input)
					? Promise.all(input)
					: (input as (tx: typeof client) => Promise<unknown>)(client),
		};
		return client;
	}
	return {mock: mockPrisma(), mockPrisma};
});

vi.mock('../../src/config/prisma.js', () => ({prisma: mock}));

export function createFixture(options: {rateLimit?: boolean} = {}) {
	let app: FastifyInstance;
	beforeAll(async () => {
		app = fastify({...serverOptions, logger: false});
		app.setErrorHandler(handleError);
		app.setValidatorCompiler(validatorCompiler);
		app.setSerializerCompiler(serializerCompiler);
		await app.register(sensible);
		await app.register(cors, corsOptions);
		await app.register(rateLimit, {
			...rateLimitOptions,
			allowList: () => !options.rateLimit,
		});
		await app.register(session, {
			...sessionOptions,
			key: await fs.readFile(path.resolve(__dirname, '../../session-key')),
		});
		await app.register(csrf, {sessionPlugin: '@fastify/secure-session'});
		await app.register(prismaPlugin);
		await app.register(authPlugin);
		await app.register(exportsPlugin);
		await app.register(bookCopiesRoute, {prefix: '/book-copies'});
		await app.register(booksRoute, {prefix: '/books'});
		await app.register(csrfRoute, {prefix: '/csrf'});
		await app.register(healthRoute, {prefix: '/health'});
		await app.register(meRoute);
		await app.register(membersRoute, {prefix: '/members'});
		await app.register(reservationsRoute, {prefix: '/reservations'});
		await app.register(searchRoute, {prefix: '/search'});
		await app.register(sessionsRoute);
		await app.register(statsRoute, {prefix: '/stats'});
		await app.register(transactionsRoute, {prefix: '/transactions'});
		await app.ready();
	});
	beforeEach(() => {
		const fresh = mockPrisma();
		for (const name of [
			'account',
			'session',
			'book',
			'bookCopy',
			'member',
			'reservation',
			'transaction',
		] as const) {
			Object.assign(mock, {[name]: fresh[name]});
		}
		mock.$queryRaw = fresh.$queryRaw;
	});
	afterAll(async () => {
		await app?.close();
	});

	return {
		get app() {
			return app;
		},
		mock: configuredPrisma as unknown as typeof mock,
		async auth(credentials?: {id: number; email: string; password: string}): Promise<Headers> {
			const password = credentials?.password ?? faker.internet.password();
			const email = credentials?.email ?? faker.internet.email();
			const account = {
				id: credentials?.id ?? faker.number.int({min: 1, max: 1_000_000}),
				name: faker.person.fullName(),
				email,
				password: await hash(password, 4),
				sessionVersion: 0,
				dateTimeCreated: new Date(),
				dateTimeUpdated: new Date(),
			};
			mock.account.findUnique = async () => account;
			const csrf = await app.inject({method: 'GET', url: '/csrf'});
			assert.equal(csrf.statusCode, 200);
			const cookie = csrf.cookies
				.map(({name, value}) => `${name}=${encodeURIComponent(value)}`)
				.join('; ');
			assert.ok(cookie.includes('session'), JSON.stringify(csrf.cookies));
			const login = await app.inject({
				method: 'POST',
				url: '/sessions',
				headers: {cookie, 'x-csrf-token': csrf.json().data.token},
				payload: {email, password},
			});
			assert.equal(login.statusCode, 201, login.body);
			const sessionCookie = login.cookies
				.map(({name, value}) => `${name}=${encodeURIComponent(value)}`)
				.join('; ');
			const current = await app.inject({
				method: 'GET',
				url: '/csrf',
				headers: {cookie: sessionCookie},
			});
			assert.equal(current.statusCode, 200);
			return {cookie: sessionCookie, 'x-csrf-token': current.json().data.token};
		},
		book() {
			return {
				id: faker.number.int({min: 1, max: 1_000_000}),
				title: faker.book.title(),
				author: faker.person.fullName(),
				genre: 'FICTION' as const,
				yearPublished: faker.number.int({min: 1900, max: 2025}),
				dateTimeCreated: new Date(),
				dateTimeUpdated: new Date(),
				_count: {copies: 0},
				copies: [] as {id: number}[],
			};
		},
		member() {
			return {
				id: faker.number.int({min: 1, max: 1_000_000}),
				externalId: faker.string.uuid(),
				name: faker.person.fullName(),
				course: null,
				yearAndSection: null,
				dateTimeLastBorrowedBook: null,
				dateTimeCreated: new Date(),
				dateTimeUpdated: new Date(),
			};
		},
		copy(book: ReturnType<typeof this.book>) {
			return {
				id: faker.number.int({min: 1, max: 1_000_000}),
				isbn: faker.string.uuid(),
				book,
				status: 'AVAILABLE' as 'AVAILABLE' | 'BORROWED' | 'RESERVED',
				dateTimeCreated: new Date(),
				dateTimeUpdated: new Date(),
			};
		},
		transaction(member: ReturnType<typeof this.member>, copy: ReturnType<typeof this.copy>) {
			return {
				id: faker.number.int({min: 1, max: 1_000_000}),
				type: 'BORROW' as 'BORROW' | 'RETURN',
				status: 'PENDING' as 'PENDING' | 'COMPLETED',
				ticket: faker.string.uuid(),
				remarks: null,
				member,
				book: null,
				bookCopy: copy,
				reservation: null as {id: number; status: 'PENDING' | 'CANCELLED' | 'COMPLETED'} | null,
				dateTimeCreated: new Date(),
				dateTimeUpdated: new Date(),
			};
		},
	};
}
