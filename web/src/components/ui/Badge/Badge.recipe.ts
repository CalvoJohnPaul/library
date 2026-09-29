import {tv} from 'tailwind-variants';

export const badgeRecipe = tv({
	slots: {
		root: 'inline-flex rounded-full border px-2 py-1',
		label: 'font-medium text-xs leading-none',
		icon: '',
	},
	variants: {
		accent: {
			primary: {
				root: 'border-blue-900 bg-blue-900/25',
				label: 'text-blue-300',
			},
			danger: {
				root: 'border-red-900 bg-red-900/25',
				label: 'text-red-300',
			},
			info: {
				root: 'border-indigo-900 bg-indigo-900/25',
				label: 'text-indigo-300',
			},
			warning: {
				root: 'border-amber-900 bg-amber-900/25',
				label: 'text-amber-300',
			},
			gray: {
				root: 'border-neutral-800 bg-neutral-800/25',
				label: 'text-neutral-300',
			},
		},
	},
	defaultVariants: {
		accent: 'primary',
	},
});
