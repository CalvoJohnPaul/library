import {type Theme, useThemeContext} from '@/providers/ThemeProvider';

const map = {
	light: {
		grid: '#e5e5e5',
		label: '#525252',
		muted: '#737373',
		cursor: '#f5f5f5',
		surface: '#ffffff',
		border: '#e5e5e5',
		text: '#171717',
		item: '#525252',
	},
	dark: {
		grid: '#404040',
		label: '#d4d4d4',
		muted: '#a3a3a3',
		cursor: '#262626',
		surface: '#171717',
		border: '#404040',
		text: '#f5f5f5',
		item: '#d4d4d4',
	},
} satisfies Record<Theme, unknown>;

export function useChartColors() {
	const [theme] = useThemeContext();
	return map[theme];
}
