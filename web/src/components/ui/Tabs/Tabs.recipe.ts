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
				list: 'inline-flex h-12 items-center gap-md rounded-md border border-gray-200 bg-gray-50 p-1',
				trigger:
					'relative z-1 flex h-full w-full cursor-pointer ui-disabled:cursor-not-allowed items-center justify-center px-3 font-semibold text-gray-500 ui-selected:text-gray-700 ui-disabled:opacity-60 disabled:opacity-60',
				indicator: 'rounded-md bg-white shadow-md',
			},
		},
	},
	defaultVariants: {
		variant: 'button',
	},
});
