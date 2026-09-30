import {dialogAnatomy} from '@ark-ui/react/dialog';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

const anatomy = dialogAnatomy.extendWith('header', 'body', 'footer');

export const dialogRecipe = tv({
	slots: anatomyToRecipeSlots(anatomy, {
		backdrop:
			'fixed inset-0 z-backdrop ui-closed:animate-backdrop-out ui-open:animate-backdrop-in bg-black/50 backdrop-blur-xs',
		positioner: 'fixed inset-0 z-dialog overflow-y-auto lg:px-8 lg:py-16',
		content: [
			'relative z-dialog mx-auto flex size-full h-auto w-full max-w-105 ui-closed:animate-dialog-out ui-open:animate-dialog-in flex-col rounded-lg bg-white',
		],
		header: 'relative flex gap-4 p-6 pb-8',
		body: 'relative grow px-6 pb-8',
		footer: 'relative flex justify-end gap-3 px-6 py-5',
		title: 'font-semibold text-lg leading-normal',
		description: 'text-gray-500 text-sm leading-tight',
		closeTrigger:
			'absolute top-2 right-2 flex icon:size-5 size-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700',
	}),
});
