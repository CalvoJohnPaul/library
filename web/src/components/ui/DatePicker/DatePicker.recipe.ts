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
			'bg-neutral-900',
			'rounded-lg',
			'ui-invalid:border-red-400',
			'ui-invalid:focus-within:outline-red-400',
			'focus:outline-2',
			'focus:outline-solid',
			'focus:outline-blue-600',
			'focus:-outline-offset-1',
		],
		trigger: [
			'size-11',
			'border',
			'bg-neutral-900',
			'rounded-lg',
			'shrink-0',
			'flex',
			'shrink-0',
			'items-center',
			'justify-center',
			'icon:size-5',
			'icon:text-neutral-300',
		],
		positioner: 'z-dropdown',
		content: [
			'z-dropdown',
			'max-h-(--available-height)',
			'overflow-y-auto',
			'rounded-lg',
			'border',
			'border-neutral-700',
			'bg-neutral-800',
			'focus-visible:outline-2',
			'focus-visible:outline-offset-2',
			'focus-visible:outline-white/50',

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
			'text-neutral-200',
			'rounded-md',

			'ui-view-day:size-10',
			'ui-view-month:h-9',
			'ui-view-month:w-17.5',
			'ui-view-year:h-9',
			'ui-view-year:w-17.5',

			'ui-disabled:text-neutral-400',

			'hover:ui-not-disabled:bg-neutral-700/25',
			'hover:ui-not-disabled:text-neutral-100',

			'ui-selected:ui-not-disabled:font-medium',
			'ui-selected:ui-not-disabled:bg-blue-600',
			'ui-selected:ui-not-disabled:text-white',

			'ui-today:after:absolute',
			'ui-today:after:bottom-[8%]',
			'ui-today:after:left-1/2',
			'ui-today:after:size-1',
			'ui-today:after:-translate-x-1/2',
			'ui-today:after:rounded-full',
			'ui-today:after:bg-blue-800',

			'ui-in-range:ui-not-disabled:font-medium',
			'ui-in-range:ui-not-disabled:bg-blue-600/25',
			'ui-in-range:ui-not-disabled:text-blue-100',

			'ui-range-start:ui-not-disabled:font-medium',
			'ui-range-start:ui-not-disabled:bg-blue-600',
			'ui-range-start:ui-not-disabled:text-white',

			'ui-range-end:ui-not-disabled:font-medium',
			'ui-range-end:ui-not-disabled:bg-blue-600',
			'ui-range-end:ui-not-disabled:text-white',
		],
		tableHeader: 'py-3 font-medium text-neutral-300 text-sm',
		view: 'p-4',
		viewControl: 'flex items-center justify-between py-2',
		prevTrigger:
			'flex icon:size-5 size-9 items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700/25 hover:text-neutral-100',
		nextTrigger:
			'flex icon:size-5 size-9 items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-700/25 hover:text-neutral-100',
		rangeText:
			'rounded-md px-1.5 py-0.5 font-semibold text-neutral-300 text-sm hover:bg-neutral-700/25 hover:text-neutral-100',
	}),
});
