import {sliderAnatomy} from '@ark-ui/react/slider';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const sliderRecipe = tv({
	slots: anatomyToRecipeSlots(sliderAnatomy, {
		root: 'flex items-center gap-2',
		control: 'relative flex h-2 w-full grow items-center',
		track: 'h-full grow overflow-hidden rounded-full bg-gray-300 dark:bg-neutral-600',
		range: 'h-full bg-blue-600 dark:bg-blue-300',
		thumb: [
			'z-1',
			'size-5.5',
			'cursor-pointer',
			'rounded-full',
			'border-2',
			'border-gray-200 dark:border-neutral-700',
			'bg-white dark:bg-neutral-900',
		],
		valueText: 'font-medium text-gray-600 text-sm dark:text-neutral-300',
	}),
});
