import {comboboxAnatomy} from '@ark-ui/react/combobox';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const comboboxRecipe = tv({
	slots: anatomyToRecipeSlots(comboboxAnatomy, {
		control:
			'flex h-11 grow ui-invalid:border-rose-400 bg-white dark:ui-invalid:border-rose-300 dark:bg-neutral-900',
		input:
			'h-11 grow rounded-l-md border border-gray-200 border-r-0 bg-white pl-4 outline-none disabled:opacity-65 dark:border-neutral-700 dark:bg-neutral-900',
		trigger:
			'flex icon:size-5 size-11 shrink-0 ui-closed:icon:rotate-0 ui-open:icon:rotate-180 items-center justify-center rounded-r-md border border-gray-200 border-l-0 bg-white icon:text-gray-600 icon:transition-transform icon:duration-300 disabled:opacity-65 dark:border-neutral-700 dark:bg-neutral-900 dark:icon:text-neutral-300',
		clearTrigger:
			'ml-2 flex icon:size-5 size-11 shrink-0 items-center justify-center rounded-md border border-gray-200 icon:text-gray-600 dark:border-neutral-700 dark:icon:text-neutral-300',
		positioner: 'z-dropdown',
		content: [
			'z-dropdown',
			'max-h-(--available-height)',
			'overflow-y-auto',
			'rounded-lg',
			'border',
			'border-gray-200 dark:border-neutral-700',
			'bg-white dark:bg-neutral-900',
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
			'ui-highlighted:bg-gray-50 dark:ui-highlighted:bg-neutral-900',
			'icon:size-5',
		],
		itemText: 'grow',
		itemIndicator: 'flex size-5 text-blue-500 dark:text-blue-400!',
	}),
});
