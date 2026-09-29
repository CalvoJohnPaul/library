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
			'rounded-lg',
			'border',
			'bg-neutral-900',
			'ui-invalid:border-red-400',
			'ui-invalid:focus-within:outline-red-400',
			'focus-within:outline-2',
			'focus-within:outline-solid',
			'focus-within:outline-blue-600',
			'focus-within:-outline-offset-1',
		],
		input: 'row-span-2 w-full bg-transparent px-4 outline-none',
		decrementTrigger:
			'inline-flex icon:size-5 items-center justify-center border-t border-l text-neutral-400 disabled:opacity-65',
		incrementTrigger:
			'inline-flex icon:size-5 items-center justify-center border-l text-neutral-400 disabled:opacity-65',
	}),
});
