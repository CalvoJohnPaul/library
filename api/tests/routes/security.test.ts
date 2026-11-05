import assert from 'node:assert/strict';
import {describe, test} from 'vitest';
import * as XLSX from 'xlsx';
import {createFixture} from './fixture.js';

const exports = [
	'/books/export',
	'/book-copies/export',
	'/members/export',
	'/reservations/export',
	'/transactions/export',
];

describe('export and error protections', () => {
	const fixture = createFixture();

	test('local HTTP development supports credentialed requests and CSRF headers', async () => {
		const preflight = await fixture.app.inject({
			method: 'OPTIONS',
			url: '/books/export',
			headers: {
				origin: 'http://localhost',
				'access-control-request-method': 'POST',
				'access-control-request-headers': 'X-CSRF-Token, Content-Type',
			},
		});
		assert.equal(preflight.statusCode, 204);
		assert.equal(preflight.headers['access-control-allow-origin'], 'http://localhost');
		assert.equal(preflight.headers['access-control-allow-credentials'], 'true');
		const csrf = await fixture.app.inject({url: '/csrf'});
		assert.equal(csrf.cookies[0].secure, undefined);
		assert.equal(csrf.cookies[0].httpOnly, true);
		const headers = await fixture.auth();
		const me = await fixture.app.inject({url: '/me', headers});
		assert.ok(me.json().data.id);
	});

	test('all exports reject missing and invalid CSRF tokens', async () => {
		const headers = await fixture.auth();
		for (const url of exports) {
			for (const token of [undefined, 'invalid']) {
				const response = await fixture.app.inject({
					method: 'POST',
					url,
					headers: {cookie: headers.cookie, ...(token && {'x-csrf-token': token})},
				});
				assert.equal(response.statusCode, 403, response.body);
			}
		}
	});

	test('all exports fetch bounded batches and reject more than 5,000 rows', async () => {
		const headers = await fixture.auth();
		for (const model of ['book', 'bookCopy', 'member', 'reservation', 'transaction'] as const) {
			fixture.mock[model].findMany = async ({take, skip}: {take: number; skip: number}) => {
				assert.ok(take <= 25);
				assert.ok(skip <= 5000);
				return Array.from({length: take}, () => ({id: 1}));
			};
		}
		for (const url of exports) {
			const response = await fixture.app.inject({method: 'POST', url, headers});
			assert.equal(response.statusCode, 413, response.body);
		}
	});

	test('exports reject oversized data and release the guard after failure', async () => {
		const headers = await fixture.auth();
		fixture.mock.book.findMany = async () => [{title: 'a'.repeat(5 * 1024 * 1024)}];
		const tooLarge = await fixture.app.inject({method: 'POST', url: '/books/export', headers});
		assert.equal(tooLarge.statusCode, 413, tooLarge.body);
		fixture.mock.book.findMany = async () => [];
		const retry = await fixture.app.inject({method: 'POST', url: '/books/export', headers});
		assert.equal(retry.statusCode, 200, retry.body);
	});

	test('an export of exactly 5,000 rows succeeds without truncation', async () => {
		const headers = await fixture.auth();
		const rows = Array.from({length: 5000}, (_, i) => ({...fixture.book(), id: i + 1}));
		fixture.mock.book.findMany = async ({take, skip}: {take: number; skip: number}) =>
			rows.slice(skip, skip + take);
		const response = await fixture.app.inject({method: 'POST', url: '/books/export', headers});
		assert.equal(response.statusCode, 200);
		const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
		assert.equal(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]).length, 5000);
	});

	test('only one export runs at a time across routes', async () => {
		const headers = await fixture.auth();
		const entered = Promise.withResolvers<void>();
		const rows = Promise.withResolvers<never[]>();
		fixture.mock.book.findMany = async () => {
			entered.resolve();
			return rows.promise;
		};
		const first = fixture.app
			.inject({method: 'POST', url: '/books/export', headers})
			.then((response) => response);
		await entered.promise;
		try {
			const second = await fixture.app.inject({method: 'POST', url: '/members/export', headers});
			assert.equal(second.statusCode, 429, second.body);
		} finally {
			rows.resolve([]);
			assert.equal((await first).statusCode, 200);
		}
	});

	test('internal errors are hidden, while expected client errors remain useful', async () => {
		const headers = await fixture.auth();
		fixture.mock.book.findUnique = async () => {
			throw new Error('private database credentials and SQL');
		};
		const failed = await fixture.app.inject({url: '/books/1', headers});
		assert.equal(failed.statusCode, 500);
		assert.deepEqual(failed.json(), {
			ok: false,
			error: {
				name: 'InternalServerError',
				message: 'An unexpected error occurred.',
			},
		});
		fixture.mock.book.findUnique = async () => null;
		const missing = await fixture.app.inject({url: '/books/1', headers});
		assert.equal(missing.statusCode, 404);
	});
});

describe('rate limits', () => {
	const fixture = createFixture({rateLimit: true});

	test('changing forwarded headers does not bypass login IP limits', async () => {
		fixture.mock.account.findUnique = async () => null;
		const csrf = await fixture.app.inject({url: '/csrf'});
		const cookie = csrf.cookies
			.map(({name, value}) => `${name}=${encodeURIComponent(value)}`)
			.join('; ');
		for (let i = 0; i < 11; i++) {
			const response = await fixture.app.inject({
				method: 'POST',
				url: '/sessions',
				remoteAddress: '192.0.2.10',
				headers: {
					cookie,
					'x-csrf-token': csrf.json().data.token,
					'x-forwarded-for': `198.51.100.${i + 1}`,
				},
				payload: {email: `attempt${i}@example.com`, password: 'incorrect'},
			});
			assert.equal(response.statusCode, i < 10 ? 401 : 429, response.body);
		}
	});

	test('login account limits apply across client IPs and email casing', async () => {
		fixture.mock.account.findUnique = async () => null;
		const csrf = await fixture.app.inject({url: '/csrf'});
		const cookie = csrf.cookies
			.map(({name, value}) => `${name}=${encodeURIComponent(value)}`)
			.join('; ');
		for (let i = 0; i < 6; i++) {
			const response = await fixture.app.inject({
				method: 'POST',
				url: '/sessions',
				remoteAddress: `192.0.2.${20 + i}`,
				headers: {cookie, 'x-csrf-token': csrf.json().data.token},
				payload: {
					email: i % 2 ? 'ACCOUNT@example.com' : 'account@example.com',
					password: 'incorrect',
				},
			});
			assert.equal(response.statusCode, i < 5 ? 401 : 429, response.body);
		}
	});

	test('export limits are shared across export routes', async () => {
		const headers = await fixture.auth();
		for (const model of ['book', 'bookCopy', 'member', 'reservation', 'transaction'] as const) {
			fixture.mock[model].findMany = async () => [];
		}
		for (const url of exports) {
			const response = await fixture.app.inject({
				method: 'POST',
				url,
				headers,
				remoteAddress: '192.0.2.40',
			});
			assert.equal(response.statusCode, 200, response.body);
		}
		const exceeded = await fixture.app.inject({
			method: 'POST',
			url: exports[0],
			headers,
			remoteAddress: '192.0.2.40',
		});
		assert.equal(exceeded.statusCode, 429, exceeded.body);
	});
});
