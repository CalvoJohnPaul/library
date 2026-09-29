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
			'w-[calc(100dvw-(var(--gap)*2))]',
			'lg:w-96',
			'scale-(--scale)',
			'items-center',
			'gap-2',
			'rounded-md',
			'border',
			'border-gray-300',
			'bg-white',
			'p-4',
			'opacity-(--opacity)',
			'transition-all',
			'duration-300',
			'[translate:var(--x)_var(--y)_0]',
		],
		title: 'block font-medium',
		description: 'block grow text-gray-700 text-sm',
		closeTrigger: [
			'absolute',
			'top-2',
			'right-2',
			'flex',
			'icon:size-4.5',
			'shrink-0',
			'items-center',
			'text-gray-500',
			'transition-colors',
			'duration-300',
			'hover:text-gray-700',
		],
	}),
});
