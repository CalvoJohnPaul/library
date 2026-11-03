import {type Dispatch, type SetStateAction, useCallback, useEffect, useState} from 'react';

export type Theme = 'dark' | 'light';
export type UseThemeReturn = [value: Theme, setValue: Dispatch<SetStateAction<Theme>>];

const localStorageKey = 'library/theme';
const darkModeQuery = '(prefers-color-scheme: dark)';
const parseTheme = (value: unknown): Theme => {
	if (typeof value === 'string' && (value === 'dark' || value === 'light')) {
		return value;
	} else {
		return window.matchMedia(darkModeQuery).matches ? 'dark' : 'light';
	}
};

export function useTheme(): UseThemeReturn {
	const [theme, setTheme_] = useState(parseTheme(localStorage.getItem(localStorageKey)));

	const setTheme = useCallback((valueOrFn: Theme | ((prevValue: Theme) => Theme)) => {
		setTheme_((oldValue) => {
			const newValue: Theme = typeof valueOrFn === 'function' ? valueOrFn(oldValue) : valueOrFn;

			if (newValue === oldValue) {
				return newValue;
			}

			const style = document.createElement('style');
			style.textContent = '*,*::before,*::after{transition:none!important;}';
			document.head.append(style);

			if (newValue === 'dark') {
				localStorage.setItem(localStorageKey, 'dark');
				document.documentElement.classList.add('dark');
				document.documentElement.style.colorScheme = 'dark';
			} else {
				localStorage.setItem(localStorageKey, 'light');
				document.documentElement.classList.remove('dark');
				document.documentElement.style.colorScheme = 'light';
			}

			setTimeout(() => style.remove(), 0);

			return newValue;
		});
	}, []);

	useEffect(() => {
		const media = window.matchMedia(darkModeQuery);
		const handle = (e: MediaQueryListEvent) => {
			setTheme(e.matches ? 'dark' : 'light');
		};

		media.addEventListener('change', handle);

		return () => {
			media.removeEventListener('change', handle);
		};
	}, [setTheme]);

	useEffect(() => {
		const handle = (e: StorageEvent) => {
			if (e.key === localStorageKey) {
				setTheme(parseTheme(e.newValue));
			}
		};

		window.addEventListener('storage', handle);

		return () => {
			window.removeEventListener('storage', handle);
		};
	}, [setTheme]);

	return [theme, setTheme];
}
