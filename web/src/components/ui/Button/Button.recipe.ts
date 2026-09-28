import {tv, type VariantProps} from 'tailwind-variants';

export const buttonRecipe = tv({
	base: 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-semibold outline-black/75 outline-offset-2 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-65',
	variants: {
		size: {
			sm: 'h-10 px-3.5 text-sm',
			md: 'h-11 px-4',
			lg: 'h-12 px-4.5',
		},
		variant: {
			solid: 'border-none bg-(--bg) text-white',
			outline: 'border border-(--border) bg-transparent text-(--fg)',
		},
		accent: {
			primary: [
				'[--bg:var(--color-blue-600)]',
				'[--border:var(--color-blue-500)]',
				'[--fg:var(--color-blue-600)]',
			],
			danger: [
				'[--bg:var(--color-red-600)]',
				'[--border:var(--color-red-500)]',
				'[--fg:var(--color-red-600)]',
			],
			gray: [
				'[--bg:var(--color-gray-900)]',
				'[--border:var(--color-gray-300)]',
				'[--fg:var(--color-gray-700)]',
			],
		},
	},
	defaultVariants: {
		size: 'md',
		variant: 'solid',
		accent: 'primary',
	},
});

export type ButtonRecipeProps = VariantProps<typeof buttonRecipe>;
