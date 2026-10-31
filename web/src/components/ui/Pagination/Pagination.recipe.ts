import {paginationAnatomy} from '@ark-ui/react';
import {cx, tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

const trigger = cx(
	'flex',
	'h-11',
	'min-w-11',
	'items-center',
	'justify-center',
	'rounded-md',
	'border',
	'border-neutral-200 dark:border-neutral-800',
	'bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800',
	'px-2',
	'text-center',
	'font-semibold',
	'ui-selected:border-blue-600',
	'ui-selected:bg-blue-600',
	'ui-selected:text-white',
	'dark:ui-selected:border-blue-500',
	'dark:ui-selected:bg-blue-600',
	'disabled:opacity-50',
	'icon:size-5',
);

export const paginationRecipe = tv({
	slots: anatomyToRecipeSlots(paginationAnatomy, {
		root: 'flex gap-2',
		ellipsis:
			'flex icon:size-4 size-11 items-center justify-center text-neutral-400 dark:text-neutral-500',
		item: trigger,
		firstTrigger: trigger,
		lastTrigger: trigger,
		nextTrigger: trigger,
		prevTrigger: trigger,
	}),
});
