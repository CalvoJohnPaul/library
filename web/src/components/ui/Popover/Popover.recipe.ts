import {popoverAnatomy} from '@ark-ui/react/popover';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const popoverRecipe = tv({
	slots: anatomyToRecipeSlots(popoverAnatomy, {
		content: [
			'z-popover',
			'relative',
			'max-h-(--available-height)',
			'rounded-lg',
			'bg-neutral-800',
			'p-3',
			'text-sm',
			'text-neutral-200',

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
		arrow: 'arrow-bg-neutral-800 arrow-size-[0.875rem]',
		title: 'font-medium',
		description: 'text-neutral-400',
		closeTrigger:
			'absolute top-2 right-2 icon:size-4 rounded p-0.5 text-neutral-500 transition-colors duration-300 hover:bg-neutral-600/25 hover:text-neutral-400',
	}),
});
