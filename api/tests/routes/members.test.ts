import assert from 'node:assert/strict';
import {faker} from '@faker-js/faker';
import {test} from 'vitest';
import * as XLSX from 'xlsx';
import {createFixture} from './fixture.js';

const fixture = createFixture();

test('GET /members', async () => {
	const headers = await fixture.auth();
	const member = fixture.member();
	fixture.mock.member.count = async () => 1;
	fixture.mock.member.findMany = async () => [member];
	const response = await fixture.app.inject({
		method: 'GET',
		url: `/members?externalId__eq=${member.externalId}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.total, 1);
	assert.equal(response.json().data.rows[0].id, member.id);
});

test('GET /members/:id', async () => {
	const headers = await fixture.auth();
	const member = fixture.member();
	fixture.mock.member.findUnique = async () => member;
	const response = await fixture.app.inject({method: 'GET', url: `/members/${member.id}`, headers});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.externalId, member.externalId);
});

test('POST /members', async () => {
	const headers = await fixture.auth();
	const member = fixture.member();
	fixture.mock.member.exists = async () => false;
	fixture.mock.member.create = async () => member;
	const response = await fixture.app.inject({
		method: 'POST',
		url: '/members',
		headers,
		payload: {
			externalId: member.externalId,
			name: member.name,
		},
	});
	assert.equal(response.statusCode, 201, response.body);
	assert.equal(response.json().data.externalId, member.externalId);
});

test('PATCH /members/:id', async () => {
	const headers = await fixture.auth();
	const member = {...fixture.member(), name: faker.person.fullName()};
	fixture.mock.member.exists = async () => true;
	fixture.mock.member.update = async () => member;
	const response = await fixture.app.inject({
		method: 'PATCH',
		url: `/members/${member.id}`,
		headers,
		payload: {name: member.name},
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.equal(response.json().data.name, member.name);
});

test('DELETE /members/:id', async () => {
	const headers = await fixture.auth();
	fixture.mock.bookCopy.updateMany = async () => ({count: 0});
	fixture.mock.member.deleteMany = async () => ({count: 1});
	const response = await fixture.app.inject({
		method: 'DELETE',
		url: `/members/${faker.number.int({min: 1})}`,
		headers,
	});
	assert.equal(response.statusCode, 200, response.body);
	assert.deepEqual(response.json(), {ok: true});
});

test('POST /members/export', async () => {
	const headers = await fixture.auth();
	const member = fixture.member();
	fixture.mock.member.findMany = async () => [member];
	const response = await fixture.app.inject({method: 'POST', url: '/members/export', headers});
	assert.equal(response.statusCode, 200, response.body);
	const workbook = XLSX.read(response.rawPayload, {type: 'buffer'});
	assert.ok(
		XLSX.utils
			.sheet_to_json<{externalId: string}>(workbook.Sheets[workbook.SheetNames[0]])
			.some((row) => row.externalId === member.externalId),
	);
});
