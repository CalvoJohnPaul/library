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
			'border-neutral-200 dark:border-neutral-800',
			'bg-white dark:bg-neutral-950',
			'p-4',
			'opacity-(--opacity)',
			'transition-all',
			'duration-300',
			'[translate:var(--x)_var(--y)_0]',
		],
		title: 'block font-medium',
		description: 'block grow text-neutral-700 text-sm dark:text-neutral-200',
		closeTrigger: [
			'absolute',
			'top-2',
			'right-2',
			'flex',
			'icon:size-4.5',
			'shrink-0',
			'items-center',
			'text-neutral-500 dark:text-neutral-400',
			'transition-colors',
			'duration-300',
			'hover:text-neutral-700 dark:hover:text-neutral-200',
		],
	}),
});
