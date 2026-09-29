import {paginationAnatomy} from '@ark-ui/react';
import {cx, tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

const trigger = cx`flex icon:size-6 h-11 min-w-11 items-center justify-center rounded-md border border-gray-300 ui-selected:border-blue-600 bg-white ui-selected:bg-blue-600/10 px-2 text-center font-semibold ui-selected:text-blue-700 disabled:opacity-50`;

export const paginationRecipe = tv({
	slots: anatomyToRecipeSlots(paginationAnatomy, {
		root: 'flex gap-2',
		ellipsis: 'flex icon:size-4 size-11 items-center justify-center text-gray-400',
		item: trigger,
		firstTrigger: trigger,
		lastTrigger: trigger,
		nextTrigger: trigger,
		prevTrigger: trigger,
	}),
});
