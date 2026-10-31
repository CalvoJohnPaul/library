import {tv, type VariantProps} from 'tailwind-variants';

export const buttonRecipe = tv({
	base: 'inline-flex icon:size-5 h-11 items-center justify-center gap-2 rounded-md px-4 font-semibold disabled:opacity-65',
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
				'dark:[--bg:var(--color-neutral-50)]',
				'dark:[--border:var(--color-neutral-700)]',
				'dark:[--fg:var(--color-neutral-200)]',
			],
			warning: [
				'[--bg:var(--color-amber-600)]',
				'[--border:var(--color-amber-500)]',
				'[--fg:var(--color-amber-600)]',
			],
		},
	},
	defaultVariants: {
		variant: 'solid',
		accent: 'primary',
	},
});

export type ButtonRecipeProps = VariantProps<typeof buttonRecipe>;
