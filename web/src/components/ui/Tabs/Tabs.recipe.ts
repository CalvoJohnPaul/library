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
				list: 'flex h-12 items-center gap-md rounded-lg border bg-neutral-700/10 p-1',
				trigger:
					'relative z-1 flex h-full grow cursor-pointer ui-disabled:cursor-not-allowed items-center justify-center px-3 font-semibold text-neutral-400 ui-selected:text-neutral-200 ui-disabled:opacity-60 disabled:opacity-60',
				indicator: 'rounded-md bg-neutral-800 shadow-md',
			},
		},
	},
	defaultVariants: {
		variant: 'button',
	},
});
