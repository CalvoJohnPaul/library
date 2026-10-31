import {tv} from 'tailwind-variants';

export const featuredIconRecipe = tv({
	slots: {
		root: [
			'relative',
			'flex',
			'shrink-0',
			'items-center',
			'justify-center',
			'rounded-md',
			'before:absolute',
			'before:right-0',
			'before:z-2',
			'before:rounded-md',
			'after:absolute',
			'after:z-1',
			'after:rounded-md',
		],
		icon: 'z-3',
	},
	variants: {
		size: {
			sm: {
				root: 'mr-2 size-10 before:size-10 after:-top-1 after:-right-1.5 after:size-10 after:rotate-12',
				icon: 'size-6',
			},
			md: {
				root: 'mr-2 size-12 before:size-12 after:-top-2 after:-right-2 after:size-12 after:rotate-15',
				icon: 'size-7',
			},
		},
		accent: {
			primary: {
				root: 'before:bg-blue-600 after:bg-blue-100 dark:after:bg-blue-900/50 dark:before:bg-blue-600',
				icon: 'text-blue-50 dark:text-white',
			},
			danger: {
				root: 'before:bg-rose-600 after:bg-rose-100 dark:after:bg-rose-900/50 dark:before:bg-rose-600',
				icon: 'text-rose-50 dark:text-white',
			},
			success: {
				root: 'before:bg-emerald-600 after:bg-emerald-100 dark:after:bg-emerald-900/50 dark:before:bg-emerald-600',
				icon: 'text-emerald-50 dark:text-white',
			},
			warning: {
				root: 'before:bg-amber-600 after:bg-amber-100 dark:after:bg-amber-900/50 dark:before:bg-amber-600',
				icon: 'text-amber-50 dark:text-white',
			},
		},
	},
	defaultVariants: {
		size: 'md',
		accent: 'primary',
	},
});
