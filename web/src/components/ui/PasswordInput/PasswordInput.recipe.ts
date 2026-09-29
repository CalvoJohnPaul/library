import {passwordInputAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const passwordInputRecipe = tv({
	slots: anatomyToRecipeSlots(passwordInputAnatomy, {
		control:
			'flex h-11 overflow-hidden rounded-md border border-gray-300 ui-invalid:border-red-400 bg-white',
		input: 'grow px-4 outline-none',
		visibilityTrigger:
			'flex aspect-square h-full shrink-0 cursor-pointer items-center justify-center',
		indicator: 'size-5 text-gray-600',
	}),
});
