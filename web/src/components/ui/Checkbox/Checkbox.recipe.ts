import {checkboxAnatomy} from '@ark-ui/react/checkbox';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const checkboxRecipe = tv({
	slots: anatomyToRecipeSlots(checkboxAnatomy, {
		root: 'flex items-center gap-2',
		control: [
			'size-5',
			'rounded-sm',
			'flex',
			'items-center',
			'justify-center',
			'shrink-0',
			'cursor-pointer',
			'ui-disabled:cursor-not-allowed',
			'ui-readonly:cursor-default',
			'ui-disabled:opacity-50',
			'border bg-white text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800',
			'border-neutral-200 dark:border-neutral-800',
			'ui-checked:border-blue-600 ui-checked:bg-blue-600 ui-checked:text-white dark:ui-checked:border-blue-500 dark:ui-checked:bg-blue-600',
		],
		indicator: 'size-4 text-white',
		label: 'font-medium text-neutral-600 text-sm dark:text-neutral-300',
	}),
});
