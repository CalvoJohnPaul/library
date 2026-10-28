import assert from 'node:assert/strict';
import {test} from 'vitest';
import * as XLSX from 'xlsx';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /transactions', async () => {
	const headers = await fixture.auth();
	const row = fixture.transaction(fixture.member(), fixture.copy(fixture.book()));
	fixture.mock.transaction.count = async () => 1;
	fixture.mock.transaction.findMany = async () => [row];
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/transactions?ticket__eq=${row.ticket}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.total, 1);
	assert.equal(response.json().data.rows[0].id, row.id);
});

test('GET /transactions/:id', async () => {
	const headers = await fixture.auth();
	const row = fixture.transaction(fixture.member(), fixture.copy(fixture.book()));
	fixture.mock.transaction.findUnique = async () => row;
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/transactions/${row.id}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.ticket, row.ticket);
});

test('POST /transactions/export', async () => {
	const headers = await fixture.auth();
	const row = fixture.transaction(fixture.member(), fixture.copy(fixture.book()));
	fixture.mock.transaction.findMany = async () => [row];
	const response = await fixture.app.inject({method: 'POST', url: '/transactions/export', headers});
	assert.equal(response.statusCode, 200, response.body);
	const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
	assert.ok(
		XLSX.utils
			.sheet_to_json<{ticket: string}>(workbook.Sheets[workbook.SheetNames[0]])
			.some((item) => item.ticket === row.ticket),
	);
});
