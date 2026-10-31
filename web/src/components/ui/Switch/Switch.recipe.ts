import {switchAnatomy} from '@ark-ui/react/switch';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const switchRecipe = tv({
	slots: anatomyToRecipeSlots(switchAnatomy, {
		root: 'relative inline-block',
		label:
			'mb-1.5 flex items-center gap-1.5 font-medium text-neutral-600 text-sm dark:text-neutral-300',
		control: [
			'w-11',
			'p-0.5',
			'flex',
			'shrink-0',
			'cursor-pointer',
			'items-center',
			'rounded-full',
			'bg-neutral-300 dark:bg-neutral-600',
			'transition-transform',
			'duration-200',
			'ui-checked:border-blue-600 dark:ui-checked:border-blue-300',
			'ui-checked:bg-blue-600 dark:ui-checked:bg-blue-300',
		],
		thumb:
			'size-5 ui-checked:translate-x-full rounded-full bg-white transition-transform duration-200 dark:bg-neutral-950',
	}),
});
