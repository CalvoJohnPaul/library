import {isFunction} from 'es-toolkit';
import {type Dispatch, type SetStateAction, useCallback, useState} from 'react';

export interface UseLocalStorageOptions<T> {
	serialize(value: T): string;
	deserialize(value: string): T;
}

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
	options?: UseLocalStorageOptions<T>,
): [T, Dispatch<SetStateAction<T>>] {
	const serialize = options?.serialize ?? ((value: T) => JSON.stringify(value));
	const deserialize = options?.deserialize ?? ((value: string) => JSON.parse(value) as T);

	const [value, setValue] = useState<T>(() => {
		const storedValue = window.localStorage.getItem(key);

		if (storedValue === null) {
			return initialValue;
		}

		try {
			return deserialize(storedValue);
		} catch (e) {
			console.error(e);
			return initialValue;
		}
	});

	const setStoredValue = useCallback<Dispatch<SetStateAction<T>>>(
		(action) => {
			setValue((prevValue) => {
				const nextValue = isFunction(action) ? action(prevValue) : action;
				window.localStorage.setItem(key, serialize(nextValue));
				return nextValue;
			});
		},
		[key, serialize],
	);

	return [value, setStoredValue];
}
