import {passwordInputAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const passwordInputRecipe = tv({
	slots: anatomyToRecipeSlots(passwordInputAnatomy, {
		control: 'flex overflow-hidden rounded-md border border-gray-300',
		input: 'grow outline-none placeholder:text-gray-400',
		visibilityTrigger:
			'flex aspect-square h-full shrink-0 cursor-pointer items-center justify-center',
		indicator: 'text-gray-600',
	}),
	variants: {
		size: {
			sm: {
				control: 'h-10',
				input: 'px-3.5',
				indicator: 'size-4.5',
			},
			md: {
				control: 'h-11',
				input: 'px-4',
				indicator: 'size-5',
			},
			lg: {
				control: 'h-12',
				input: 'px-4.5',
				indicator: 'size-5.5',
			},
		},
	},
	defaultVariants: {
		size: 'md',
	},
});
