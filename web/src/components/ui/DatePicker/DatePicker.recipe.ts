import {datePickerAnatomy} from '@ark-ui/react/date-picker';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const datePickerRecipe = tv({
	slots: anatomyToRecipeSlots(datePickerAnatomy, {
		control: 'flex gap-2',
		input: [
			'h-11',
			'px-4',
			'grow',
			'border',
			'border-neutral-200 dark:border-neutral-800',
			'bg-white dark:bg-neutral-950',
			'rounded-md',
			'ui-invalid:border-rose-400 dark:ui-invalid:border-rose-300',
		],
		trigger: [
			'size-11',
			'border',
			'border-neutral-200 dark:border-neutral-800',
			'bg-white dark:bg-neutral-950',
			'rounded-md',
			'shrink-0',
			'flex',
			'items-center',
			'justify-center',
			'icon:size-5',
			'icon:text-neutral-600 dark:icon:text-neutral-300',
		],
		clearTrigger:
			'flex icon:size-5 size-11 items-center justify-center rounded-md border border-neutral-200 bg-white icon:text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:icon:text-neutral-300',
		positioner: 'z-dropdown',
		content: [
			'z-dropdown',
			'overflow-y-auto',
			'rounded-lg',
			'border',
			'border-neutral-200 dark:border-neutral-800',
			'bg-white dark:bg-neutral-950',

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
		table: 'border-separate border-spacing-0.5',
		tableCellTrigger: [
			'relative',
			'flex',
			'items-center',
			'justify-center',
			'text-sm',
			'text-neutral-700 dark:text-neutral-200',
			'rounded-md',

			'ui-view-day:size-10',
			'ui-view-month:h-9',
			'ui-view-month:w-17.5',
			'ui-view-year:h-9',
			'ui-view-year:w-17.5',

			'ui-disabled:text-neutral-400 dark:ui-disabled:text-neutral-500',

			'hover:ui-not-disabled:bg-neutral-50 dark:hover:ui-not-disabled:bg-neutral-950',
			'hover:ui-not-disabled:text-neutral-900 dark:hover:ui-not-disabled:text-neutral-50',

			'ui-selected:ui-not-disabled:font-medium',
			'ui-selected:ui-not-disabled:bg-blue-600 dark:ui-selected:ui-not-disabled:bg-blue-300',
			'ui-selected:ui-not-disabled:text-white',

			'ui-today:after:absolute',
			'ui-today:after:bottom-[8%]',
			'ui-today:after:left-1/2',
			'ui-today:after:size-1',
			'ui-today:after:-translate-x-1/2',
			'ui-today:after:rounded-full',
			'ui-today:after:bg-blue-600 dark:ui-today:after:bg-blue-300',

			'ui-in-range:ui-not-disabled:font-medium',
			'ui-in-range:ui-not-disabled:bg-blue-50 dark:ui-in-range:ui-not-disabled:bg-blue-950',
			'ui-in-range:ui-not-disabled:text-blue-500 dark:ui-in-range:ui-not-disabled:text-blue-400',

			'ui-range-start:ui-not-disabled:font-medium',
			'ui-range-start:ui-not-disabled:bg-blue-600 dark:ui-range-start:ui-not-disabled:bg-blue-300',
			'ui-range-start:ui-not-disabled:text-white',

			'ui-range-end:ui-not-disabled:font-medium',
			'ui-range-end:ui-not-disabled:bg-blue-600 dark:ui-range-end:ui-not-disabled:bg-blue-300',
			'ui-range-end:ui-not-disabled:text-white',
		],
		tableHeader: 'py-3 font-medium text-neutral-600 text-sm dark:text-neutral-300',
		view: 'p-4',
		viewControl: 'flex items-center justify-between py-2',
		prevTrigger:
			'flex icon:size-5 size-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-950 dark:hover:text-neutral-50',
		nextTrigger:
			'flex icon:size-5 size-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-950 dark:hover:text-neutral-50',
		rangeText:
			'rounded-md px-1.5 py-0.5 font-semibold text-neutral-700 text-sm hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-950 dark:hover:text-neutral-50',
	}),
});
