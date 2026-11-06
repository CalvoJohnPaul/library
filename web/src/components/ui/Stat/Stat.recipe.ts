import {tv} from 'tailwind-variants';

export const statRecipe = tv({
	slots: {
		root: 'grid min-w-0 grid-cols-[minmax(0,1fr)_auto] content-start items-center rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/40',
		label: 'col-start-1 row-start-1 text-neutral-600 dark:text-neutral-400',
		icon: 'col-start-2 row-start-1 flex shrink-0 items-center justify-center rounded-full border [&>svg]:shrink-0',
		valueText: 'col-span-2 font-bold',
		helpText: 'col-span-2 text-neutral-600 text-xs dark:text-neutral-400',
	},
	variants: {
		size: {
			sm: {
				root: 'gap-x-2 gap-y-1 p-3',
				label: 'text-xs',
				icon: 'size-6 [&>svg]:size-3.5',
				valueText: 'text-xl',
			},
			md: {
				root: 'gap-x-2 gap-y-2 p-5',
				label: 'text-sm',
				icon: 'size-9 [&>svg]:size-4.5',
				valueText: 'text-2xl',
			},
		},
		accent: {
			info: {
				icon: 'border-blue-50 bg-blue-50 text-blue-600 dark:border-blue-900/20 dark:bg-blue-900/20 dark:text-blue-400',
			},
			success: {
				icon: 'border-emerald-50 bg-emerald-50 text-emerald-600 dark:border-emerald-900/20 dark:bg-emerald-900/20 dark:text-emerald-400',
			},
			warning: {
				icon: 'border-amber-50 bg-amber-50 text-amber-600 dark:border-amber-900/20 dark:bg-amber-900/20 dark:text-amber-400',
			},
			danger: {
				icon: 'border-rose-50 bg-rose-50 text-rose-600 dark:border-rose-900/20 dark:bg-rose-900/20 dark:text-rose-400',
			},
			purple: {
				icon: 'border-violet-50 bg-violet-50 text-violet-600 dark:border-violet-900/20 dark:bg-violet-900/20 dark:text-violet-400',
			},
			indigo: {
				icon: 'border-indigo-50 bg-indigo-50 text-indigo-600 dark:border-indigo-900/20 dark:bg-indigo-900/20 dark:text-indigo-400',
			},
		},
	},
	defaultVariants: {
		size: 'md',
		accent: 'info',
	},
});

export const statBadgeRecipe = tv({
	slots: {
		root: 'col-span-2 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs',
		icon: 'size-3 shrink-0',
		label: '',
	},
	variants: {
		direction: {
			up: {root: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'},
			down: {root: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'},
			flat: {root: 'bg-neutral-50 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400'},
		},
	},
	defaultVariants: {
		direction: 'up',
	},
});
