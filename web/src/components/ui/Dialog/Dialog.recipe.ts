import {dialogAnatomy} from '@ark-ui/react/dialog';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

const anatomy = dialogAnatomy.extendWith('header', 'body', 'footer');

export const dialogRecipe = tv({
	slots: anatomyToRecipeSlots(anatomy, {
		backdrop:
			'fixed inset-0 z-backdrop ui-closed:animate-backdrop-out ui-open:animate-backdrop-in bg-black/25 backdrop-blur-xs',
		positioner: 'fixed inset-0 z-dialog flex items-center overflow-y-auto p-8',
		content: [
			'relative z-dialog mx-auto flex size-full h-auto w-full max-w-105 ui-closed:animate-dialog-out ui-open:animate-dialog-in flex-col rounded-lg bg-white shadow-lg dark:border dark:border-neutral-800 dark:bg-neutral-950',
		],
		header: 'relative flex gap-4 p-6 pb-8',
		body: 'relative grow space-y-2.5 px-6 pb-8',
		footer: 'relative flex justify-end gap-3 px-6 py-5',
		title: 'font-semibold text-lg leading-normal',
		description: 'text-neutral-500 text-sm leading-tight dark:text-neutral-400',
		closeTrigger:
			'absolute top-2 right-2 flex icon:size-5 size-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200',
	}),
});
