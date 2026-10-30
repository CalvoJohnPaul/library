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
				root: 'bg-blue-50',
				label: 'text-blue-600',
				icon: 'text-blue-600',
			},
			success: {
				root: 'bg-emerald-50',
				label: 'text-emerald-600',
				icon: 'text-emerald-600',
			},
			danger: {
				root: 'bg-rose-50',
				label: 'text-rose-600',
				icon: 'text-rose-600',
			},
			warning: {
				root: 'bg-amber-50',
				label: 'text-amber-600',
				icon: 'text-amber-600',
			},
			purple: {
				root: 'bg-purple-50',
				label: 'text-purple-600',
				icon: 'text-purple-600',
			},
			indigo: {
				root: 'bg-indigo-50',
				label: 'text-indigo-600',
				icon: 'text-indigo-600',
			},
		},
	},
	defaultVariants: {
		accent: 'info',
	},
});
