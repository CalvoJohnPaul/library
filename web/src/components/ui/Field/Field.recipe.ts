import {fieldAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const fieldRecipe = tv({
	slots: anatomyToRecipeSlots(fieldAnatomy, {
		input:
			'block h-11 w-full rounded-md border border-gray-200 ui-invalid:border-rose-400 bg-white px-4 outline-none disabled:opacity-65 dark:border-neutral-700 dark:ui-invalid:border-rose-300 dark:bg-neutral-900',
		textarea:
			'block w-full rounded-md border border-gray-200 ui-invalid:border-rose-400 bg-white px-4 py-3 outline-none disabled:opacity-65 dark:border-neutral-700 dark:ui-invalid:border-rose-300 dark:bg-neutral-900',
		label: 'mb-1.5 inline-block font-semibold text-gray-600 text-sm dark:text-neutral-300',
		errorText: 'mt-1.5 inline-block text-rose-600 text-sm dark:text-rose-300',
	}),
});
