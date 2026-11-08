import {funEmoji} from '@dicebear/collection';
import {createAvatar} from '@dicebear/core';
import {isNil} from 'es-toolkit';

const cache = new Map<string, string>();

export function generateAvatar(id: string | number | null | undefined): string | undefined {
	if (isNil(id)) return;
	const key = id.toString();
	if (cache.has(key)) return cache.get(key);
	const value = createAvatar(funEmoji, {seed: key, size: 200}).toDataUri();
	cache.set(key, value);
	return value;
}
