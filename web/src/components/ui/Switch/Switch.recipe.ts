import {switchAnatomy} from '@ark-ui/react/switch';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const switchRecipe = tv({
	slots: anatomyToRecipeSlots(switchAnatomy, {
		root: 'relative inline-block',
		label: 'mb-1.5 flex items-center gap-1.5 font-medium text-neutral-300 text-sm',
		control: [
			'w-11',
			'p-0.5',
			'flex',
			'shrink-0',
			'cursor-pointer',
			'items-center',
			'rounded-full',
			'bg-neutral-800',
			'transition-transform',
			'duration-200',
			'ui-focus:outline-2',
			'ui-focus:outline-solid',
			'ui-focus:outline-offset-2',
			'ui-focus:outline-white/50',
			'ui-checked:border-blue-600',
			'ui-checked:bg-blue-600',
			'ui-checked:ui-focus:outline-blue-800',
		],
		thumb:
			'size-5 ui-checked:translate-x-full rounded-full bg-white transition-transform duration-200',
	}),
});
