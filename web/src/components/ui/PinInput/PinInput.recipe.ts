import {pinInputAnatomy} from '@ark-ui/react/pin-input';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const pinInputRecipe = tv({
	slots: anatomyToRecipeSlots(pinInputAnatomy, {
		control: 'grid grid-cols-6 gap-3',
		input: [
			'w-full',
			'aspect-square',
			'rounded-md',
			'text-[1.25em]',
			'font-semibold',
			'text-center',
			'border',
			'border-gray-200',
			'bg-white',
			'outline-none',
			'ui-invalid:border-rose-400',
		],
	}),
});
