import {omit, pick} from 'es-toolkit';
import type {Simplify} from 'type-fest';

export function splitProps<T extends Record<string, any>, K extends keyof T>(
	props: T,
	...keys: K[]
): [Simplify<Pick<T, K>>, Simplify<Omit<T, K>>] {
	const a = pick(props, keys);
	const b = omit(props, keys);

	return [a, b];
}
