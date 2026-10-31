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
				root: 'bg-blue-50 dark:bg-blue-950',
				label: 'text-blue-600 dark:text-blue-300',
				icon: 'text-blue-600 dark:text-blue-300',
			},
			success: {
				root: 'bg-emerald-50 dark:bg-emerald-950',
				label: 'text-emerald-600 dark:text-emerald-300',
				icon: 'text-emerald-600 dark:text-emerald-300',
			},
			danger: {
				root: 'bg-rose-50 dark:bg-rose-950',
				label: 'text-rose-600 dark:text-rose-300',
				icon: 'text-rose-600 dark:text-rose-300',
			},
			warning: {
				root: 'bg-amber-50 dark:bg-amber-950',
				label: 'text-amber-600 dark:text-amber-300',
				icon: 'text-amber-600 dark:text-amber-300',
			},
			purple: {
				root: 'bg-purple-50 dark:bg-purple-950',
				label: 'text-purple-600 dark:text-purple-300',
				icon: 'text-purple-600 dark:text-purple-300',
			},
			indigo: {
				root: 'bg-indigo-50 dark:bg-indigo-950',
				label: 'text-indigo-600 dark:text-indigo-300',
				icon: 'text-indigo-600 dark:text-indigo-300',
			},
		},
	},
	defaultVariants: {
		accent: 'info',
	},
});
