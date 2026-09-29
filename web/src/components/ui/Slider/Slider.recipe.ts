import {sliderAnatomy} from '@ark-ui/react/slider';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const sliderRecipe = tv({
	slots: anatomyToRecipeSlots(sliderAnatomy, {
		root: 'flex items-center gap-2',
		control: 'relative flex h-2 w-full grow items-center',
		track: 'h-full grow overflow-hidden rounded-full bg-neutral-800',
		range: 'h-full bg-blue-600',
		thumb: [
			'z-1',
			'size-5.5',
			'cursor-pointer',
			'rounded-full',
			'border-2',
			'border-neutral-900',
			'bg-white',
			'focus-visible:outline-2',
			'focus-visible:outline-solid',
			'focus-visible:outline-white/50',
		],
		valueText: 'font-medium text-neutral-300 text-sm',
	}),
});
