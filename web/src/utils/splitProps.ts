import {omit, pick} from 'es-toolkit';
import type {Simplify} from 'type-fest';

// biome-ignore lint/suspicious/noExplicitAny: ""
export function splitProps<T extends Record<string, any>, K extends keyof T>(
	props: T,
	keys: K[],
): [Simplify<Pick<T, K>>, Simplify<Omit<T, K>>] {
	const picked = pick(props, keys);
	const omitted = omit(props, keys);

	return [picked, omitted];
}
