import {tv, type VariantProps} from 'tailwind-variants';

export const iconButtonRecipe = tv({
	base: 'inline-flex icon:size-5 size-11 items-center justify-center gap-2 rounded-md font-semibold disabled:opacity-65',
	variants: {
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
				'[--bg:var(--color-rose-600)]',
				'[--border:var(--color-rose-500)]',
				'[--fg:var(--color-rose-600)]',
			],
			gray: [
				'[--bg:var(--color-gray-900)]',
				'[--border:var(--color-gray-200)]',
				'[--fg:var(--color-gray-700)]',
			],
		},
	},
	defaultVariants: {
		variant: 'solid',
		accent: 'primary',
	},
});

export type IconButtonRecipeProps = VariantProps<typeof iconButtonRecipe>;
