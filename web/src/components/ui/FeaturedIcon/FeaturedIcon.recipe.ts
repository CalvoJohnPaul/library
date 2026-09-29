import {tv} from 'tailwind-variants';

export const featuredIconRecipe = tv({
	slots: {
		root: [
			'relative',
			'flex',
			'shrink-0',
			'items-center',
			'justify-center',
			'rounded-xl',
			'before:absolute',
			'before:right-0',
			'before:z-2',
			'before:rounded-lg',
			'after:absolute',
			'after:z-1',
			'after:rounded-lg',
		],
		icon: 'z-3 stroke-[1.33333]',
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
				root: 'before:bg-blue-600 after:bg-blue-600/25',
				icon: 'text-blue-50',
			},
			danger: {
				root: 'before:bg-rose-600 after:bg-rose-600/25',
				icon: 'text-rose-50',
			},
			warning: {
				root: 'before:bg-amber-600 after:bg-amber-600/25',
				icon: 'text-amber-50',
			},
			info: {
				root: 'before:bg-blue-600 after:bg-blue-600/25',
				icon: 'text-blue-50',
			},
		},
	},
	defaultVariants: {
		size: 'md',
		accent: 'primary',
	},
});
