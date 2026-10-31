import type {PropsWithChildren} from 'react';
import {ThemeContext} from './ThemeContext';
import {useTheme} from './useTheme';

export function ThemeProvider(props: PropsWithChildren) {
	const context = useTheme();
	return <ThemeContext.Provider value={context}>{props.children}</ThemeContext.Provider>;
}
