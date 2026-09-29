import {paginationAnatomy} from '@ark-ui/react';
import {cx, tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

const trigger = cx`flex icon:size-6 h-11 min-w-11 items-center justify-center rounded-lg border ui-selected:border-blue-700 bg-neutral-900 ui-selected:bg-blue-700/10 px-2 text-center font-semibold ui-selected:text-blue-300 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-white/50 focus-visible:outline-offset-2 disabled:opacity-50`;

export const paginationRecipe = tv({
	slots: anatomyToRecipeSlots(paginationAnatomy, {
		root: 'flex gap-2',
		ellipsis: 'flex icon:size-4 size-11 items-center justify-center text-neutral-400',
		item: trigger,
		firstTrigger: trigger,
		lastTrigger: trigger,
		nextTrigger: trigger,
		prevTrigger: trigger,
	}),
});
