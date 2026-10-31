import {type Dispatch, type SetStateAction, useEffect, useState} from 'react';

export type Theme = 'dark' | 'light';
export type UseThemeReturn = [value: Theme, setValue: Dispatch<SetStateAction<Theme>>];

const query = '(prefers-color-scheme: dark)';
const apply = (theme: Theme) => {
	if (theme === 'dark') {
		localStorage.setItem('theme', 'dark');
		document.documentElement.classList.add('dark');
		document.documentElement.style.colorScheme = 'dark';
	} else {
		localStorage.setItem('theme', 'light');
		document.documentElement.classList.remove('dark');
		document.documentElement.style.colorScheme = 'light';
	}
};

export function useTheme(): UseThemeReturn {
	const [theme, setTheme_] = useState<Theme>(() => {
		const storageValue = localStorage.getItem('theme');
		return storageValue === 'dark' || (storageValue !== 'light' && window.matchMedia(query).matches)
			? 'dark'
			: 'light';
	});

	const setTheme = (valueOrFn: Theme | ((prevValue: Theme) => Theme)) => {
		setTheme_((oldValue) => {
			const newValue: Theme = typeof valueOrFn === 'function' ? valueOrFn(oldValue) : valueOrFn;
			apply(newValue);
			return newValue;
		});
	};

	useEffect(() => {
		const handle = (e: StorageEvent) => {
			if (e.key === 'theme') {
				apply(
					e.newValue === 'dark' || (e.newValue !== 'light' && window.matchMedia(query).matches)
						? 'dark'
						: 'light',
				);
			}
		};

		window.addEventListener('storage', handle);

		return () => {
			window.removeEventListener('storage', handle);
		};
	}, []);

	return [theme, setTheme];
}
