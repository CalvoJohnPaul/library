import {toastAnatomy} from '@ark-ui/react/toast';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const toastRecipe = tv({
	slots: anatomyToRecipeSlots(toastAnatomy, {
		root: [
			'group',
			'z-(--z-index)',
			'flex',
			'h-(--height)',
			'w-96',
			'scale-(--scale)',
			'items-center',
			'gap-2',
			'rounded-md',
			'border',
			'border-gray-200 dark:border-neutral-700',
			'bg-white dark:bg-neutral-900',
			'p-4',
			'opacity-(--opacity)',
			'transition-all',
			'duration-300',
			'[translate:var(--x)_var(--y)_0]',
		],
		title: 'block font-medium',
		description: 'block grow text-gray-700 text-sm dark:text-neutral-200',
		closeTrigger: [
			'absolute',
			'top-2',
			'right-2',
			'flex',
			'icon:size-4.5',
			'shrink-0',
			'items-center',
			'text-gray-500 dark:text-neutral-400',
			'transition-colors',
			'duration-300',
			'hover:text-gray-700 dark:hover:text-neutral-200',
		],
	}),
});
