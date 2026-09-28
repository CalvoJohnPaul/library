import {fieldAnatomy} from '@ark-ui/react';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const fieldRecipe = tv({
	slots: anatomyToRecipeSlots(fieldAnatomy, {
		input: 'block w-full rounded-md border border-gray-300 ui-invalid:border-red-400 outline-none',
		textarea:
			'block w-full rounded-md border border-gray-300 ui-invalid:border-red-400 outline-none',
		label: 'mb-1.5 inline-block font-semibold text-gray-600 text-sm',
		errorText: 'mt-1.5 inline-block text-red-600 text-sm',
	}),
	variants: {
		size: {
			sm: {
				input: 'h-10 px-3.5 text-sm',
				textarea: 'px-3.5 py-2.5 text-sm',
			},
			md: {
				input: 'h-11 px-4',
				textarea: 'px-4 py-3',
			},
			lg: {
				input: 'h-12 px-4.5',
				textarea: 'px-4.5 py-3',
			},
		},
	},
	defaultVariants: {
		size: 'md',
	},
});
