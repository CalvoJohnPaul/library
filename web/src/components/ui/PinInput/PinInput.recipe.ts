import {pinInputAnatomy} from '@ark-ui/react/pin-input';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const pinInputRecipe = tv({
	slots: anatomyToRecipeSlots(pinInputAnatomy, {
		control: 'grid grid-cols-6 gap-3',
		input: [
			'w-full',
			'aspect-square',
			'rounded-lg',
			'text-[1.25em]',
			'font-semibold',
			'text-center',
			'border',
			'bg-neutral-900',
			'focus:outline-2',
			'focus:outline-solid',
			'focus:outline-blue-600',
			'focus:-outline-offset-1',
			'ui-invalid:border-red-400',
			'ui-invalid:focus:outline-red-400',
		],
	}),
});
