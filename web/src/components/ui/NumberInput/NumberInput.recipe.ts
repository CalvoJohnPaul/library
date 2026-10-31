import {numberInputAnatomy} from '@ark-ui/react/number-input';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const numberInputRecipe = tv({
	slots: anatomyToRecipeSlots(numberInputAnatomy, {
		control: [
			'h-11',
			'grid',
			'grid-cols-[1fr_32px]',
			'grid-rows-[1fr_1fr]',
			'overflow-hidden',
			'rounded-md',
			'border',
			'border-gray-200 dark:border-neutral-700',
			'bg-white dark:bg-neutral-900',
			'ui-invalid:border-rose-400 dark:ui-invalid:border-rose-300',
		],
		input: 'row-span-2 w-full bg-transparent px-4 outline-none',
		decrementTrigger:
			'inline-flex icon:size-5 items-center justify-center border-gray-200 border-t border-l text-gray-500 disabled:opacity-65 dark:border-neutral-700 dark:text-neutral-400',
		incrementTrigger:
			'inline-flex icon:size-5 items-center justify-center border-gray-200 border-l text-gray-500 disabled:opacity-65 dark:border-neutral-700 dark:text-neutral-400',
	}),
});
