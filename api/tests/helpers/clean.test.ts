import assert from 'node:assert/strict';
import {test} from 'vitest';
import {faker} from '@faker-js/faker';
import {clean} from '../../src/helpers/clean.js';

test('clean removes null, undefined, and empty strings', () => {
	const name = faker.person.fullName();
	assert.deepEqual(clean({name, missing: null, absent: undefined, empty: ''}), {name});
});

test('clean preserves other falsy values and nonempty objects', () => {
	const values = {zero: 0, false: false, whitespace: ' ', list: [], nested: {empty: ''}};
	assert.deepEqual(clean(values), values);
});

test('clean does not mutate its input', () => {
	const input = {title: faker.book.title(), empty: '', missing: null};
	const original = {...input};
	const result = clean(input);
	assert.deepEqual(input, original);
	assert.notStrictEqual(result, input);
});
