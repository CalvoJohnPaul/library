import {invariant} from 'es-toolkit';
import {createContext, useContext} from 'react';
import type {UseThemeReturn} from './useTheme';

export const ThemeContext = createContext<UseThemeReturn | null>(null);

export function useThemeContext() {
	const context = useContext(ThemeContext);
	invariant(context, "'useThemeContext' must be used within 'ThemeProvider'");
	return context;
}
