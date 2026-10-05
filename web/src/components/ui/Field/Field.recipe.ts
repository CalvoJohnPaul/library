import {fieldAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const fieldRecipe = tv({
	slots: anatomyToRecipeSlots(fieldAnatomy, {
		input:
			'block h-11 w-full rounded-md border border-gray-200 ui-invalid:border-red-400 bg-white px-4 outline-none disabled:opacity-65',
		textarea:
			'block w-full rounded-md border border-gray-200 ui-invalid:border-red-400 bg-white px-4 py-3 outline-none disabled:opacity-65',
		label: 'mb-1.5 inline-block font-semibold text-gray-600 text-sm',
		errorText: 'mt-1.5 inline-block text-red-600 text-sm',
	}),
});
