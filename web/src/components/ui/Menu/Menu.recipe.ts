import {menuAnatomy} from '@ark-ui/react/menu';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const menuRecipe = tv({
	slots: anatomyToRecipeSlots(menuAnatomy, {
		positioner: 'z-dropdown',
		content: [
			'z-dropdown',
			'min-w-48',
			'max-h-(--available-height)',
			'overflow-y-auto',
			'rounded-lg',
			'border',
			'border-neutral-200 dark:border-neutral-800',
			'bg-white dark:bg-neutral-950',
			'p-1',

			'ui-placement-bottom:ui-open:animate-popover-in-bottom',
			'ui-placement-bottom-start:ui-open:animate-popover-in-bottom',
			'ui-placement-bottom-end:ui-open:animate-popover-in-bottom',
			'ui-placement-bottom:ui-closed:animate-popover-out-bottom',
			'ui-placement-bottom-start:ui-closed:animate-popover-out-bottom',
			'ui-placement-bottom-end:ui-closed:animate-popover-out-bottom',

			'ui-placement-top:ui-open:animate-popover-in-top',
			'ui-placement-top-start:ui-open:animate-popover-in-top',
			'ui-placement-top-end:ui-open:animate-popover-in-top',
			'ui-placement-top:ui-closed:animate-popover-out-top',
			'ui-placement-top-start:ui-closed:animate-popover-out-top',
			'ui-placement-top-end:ui-closed:animate-popover-out-top',

			'ui-placement-left:ui-open:animate-popover-in-left',
			'ui-placement-left-start:ui-open:animate-popover-in-left',
			'ui-placement-left-end:ui-open:animate-popover-in-left',
			'ui-placement-left:ui-closed:animate-popover-out-left',
			'ui-placement-left-start:ui-closed:animate-popover-out-left',
			'ui-placement-left-end:ui-closed:animate-popover-out-left',

			'ui-placement-right:ui-open:animate-popover-in-right',
			'ui-placement-right-start:ui-open:animate-popover-in-right',
			'ui-placement-right-end:ui-open:animate-popover-in-right',
			'ui-placement-right:ui-closed:animate-popover-out-right',
			'ui-placement-right-start:ui-closed:animate-popover-out-right',
			'ui-placement-right-end:ui-closed:animate-popover-out-right',
		],
		item: [
			'flex',
			'w-full',
			'cursor-pointer',
			'items-center',
			'gap-2',
			'rounded-md',
			'px-3',
			'py-2',
			'transition-colors',
			'duration-200',
			'ui-disabled:cursor-not-allowed',
			'ui-disabled:opacity-65',
			'ui-highlighted:bg-neutral-50 dark:ui-highlighted:bg-neutral-950',
			'icon:size-5',
		],
		itemText: 'grow',
		separator: 'relative -mx-1 my-1 border-neutral-200 border-t dark:border-neutral-800',
	}),
});
