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
				list: 'flex h-12 items-center gap-md rounded-md border border-gray-300 bg-gray-100 p-1',
				trigger:
					'relative z-1 flex h-full grow cursor-pointer ui-disabled:cursor-not-allowed items-center justify-center px-3 font-semibold text-gray-500 ui-selected:text-gray-900 ui-disabled:opacity-60 disabled:opacity-60',
				indicator: 'rounded-md bg-white shadow-md',
			},
		},
	},
	defaultVariants: {
		variant: 'button',
	},
});
