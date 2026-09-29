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
			'bg-neutral-900',
			'border',
			'ui-focus:outline-2',
			'ui-focus:outline-solid',
			'ui-focus:outline-offset-2',
			'ui-focus:outline-white/50',
			'ui-checked:border-blue-600',
			'ui-checked:bg-blue-600',
			'ui-checked:ui-focus:outline-blue-800',
		],
		indicator: 'size-4 text-white',
		label: 'font-medium text-neutral-300 text-sm',
	}),
});
