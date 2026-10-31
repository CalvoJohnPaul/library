import {tv} from 'tailwind-variants';

export const tagsRecipe = tv({
	slots: {
		root: 'flex flex-wrap gap-1.5',
		item: [
			'text-sm',
			'font-medium',
			'inline-flex',
			'items-center',
			'gap-0.5',
			'border',
			'border-neutral-200 dark:border-neutral-800',
			'bg-white dark:bg-neutral-950',
			'px-2.5',
			'py-1',
			'rounded-md',
		],
		itemText: 'text-neutral-700 dark:text-neutral-200',
		itemCloseTrigger:
			'flex icon:size-4 h-2.5 items-center justify-center pl-1 icon:text-neutral-500 dark:icon:text-neutral-400',
	},
});
