import {tv} from 'tailwind-variants';

export const badgeRecipe = tv({
	slots: {
		root: 'inline-flex items-center gap-0.75 rounded-full px-2 py-1',
		label: 'font-medium text-xs uppercase leading-none',
		icon: 'size-3.75',
	},
	variants: {
		accent: {
			info: {
				root: 'bg-blue-50 dark:bg-blue-900/20',
				label: 'text-blue-600 dark:text-blue-400',
				icon: 'text-blue-600 dark:text-blue-400',
			},
			success: {
				root: 'bg-emerald-50 dark:bg-emerald-900/20',
				label: 'text-emerald-600 dark:text-emerald-400',
				icon: 'text-emerald-600 dark:text-emerald-400',
			},
			danger: {
				root: 'bg-rose-50 dark:bg-rose-900/20',
				label: 'text-rose-600 dark:text-rose-400',
				icon: 'text-rose-600 dark:text-rose-400',
			},
			warning: {
				root: 'bg-amber-50 dark:bg-amber-900/20',
				label: 'text-amber-600 dark:text-amber-400',
				icon: 'text-amber-600 dark:text-amber-400',
			},
			purple: {
				root: 'bg-purple-50 dark:bg-purple-900/20',
				label: 'text-purple-600 dark:text-purple-400',
				icon: 'text-purple-600 dark:text-purple-400',
			},
			indigo: {
				root: 'bg-indigo-50 dark:bg-indigo-900/20',
				label: 'text-indigo-600 dark:text-indigo-400',
				icon: 'text-indigo-600 dark:text-indigo-400',
			},
		},
	},
	defaultVariants: {
		accent: 'info',
	},
});
