import {tv} from 'tailwind-variants';

export const badgeRecipe = tv({
	slots: {
		root: 'inline-flex rounded-full border px-2 py-1',
		label: 'font-medium text-xs leading-none',
		icon: '',
	},
	variants: {
		accent: {
			info: {
				root: 'border-blue-600/25 bg-blue-600/10',
				label: 'text-blue-700',
			},
			success: {
				root: 'border-green-600/25 bg-green-600/10',
				label: 'text-green-700',
			},
			danger: {
				root: 'border-red-600/25 bg-red-600/10',
				label: 'text-red-700',
			},
			warning: {
				root: 'border-amber-600/25 bg-amber-600/10',
				label: 'text-amber-700',
			},
		},
	},
	defaultVariants: {
		accent: 'info',
	},
});
