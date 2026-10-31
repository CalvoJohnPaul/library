import {tabsAnatomy} from '@ark-ui/react/tabs';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const tabsRecipe = tv({
	slots: anatomyToRecipeSlots(tabsAnatomy, {
		list: 'relative',
		indicator: 'h-(--height) w-(--width)',
	}),
	variants: {
		variant: {
			button: {
				list: 'inline-flex h-12 items-center gap-md rounded-md border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900/40',
				trigger:
					'relative z-1 flex h-full w-full cursor-pointer ui-disabled:cursor-not-allowed items-center justify-center px-3 font-semibold text-neutral-500 ui-selected:text-neutral-700 ui-disabled:opacity-60 disabled:opacity-60 dark:text-neutral-400 dark:ui-selected:text-neutral-200',
				indicator: 'rounded-md bg-white shadow-md dark:bg-neutral-900',
			},
		},
	},
	defaultVariants: {
		variant: 'button',
	},
});
