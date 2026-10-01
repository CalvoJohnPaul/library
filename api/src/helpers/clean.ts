import {isNil, omitBy} from 'es-toolkit';

type NonNullablePartial<T> = {
	[K in keyof T]?: NonNullable<T[K]>;
};

/**
 * @description Cleans an object by removing properties with null, undefined, or empty string values.
 * @example
 * ```ts
 * const obj = { a: 1, b: null, c: '', d: undefined };
 * const cleaned = clean(obj);
 * console.log(cleaned); // Output: { a: 1 }
 */
// biome-ignore lint/suspicious/noExplicitAny: ""
export function clean<T extends Record<string, any>>(obj: T): NonNullablePartial<T> {
	return omitBy(obj, (v) => isNil(v) || v === '');
}
