import {avatarAnatomy} from '@ark-ui/react/avatar';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const avatarRecipe = tv({
	slots: anatomyToRecipeSlots(avatarAnatomy, {
		root: 'flex items-center justify-center overflow-hidden rounded-full',
		fallback: 'font-medium text-gray-600 dark:text-neutral-300',
		image: 'size-full object-cover object-center',
	}),
	variants: {
		size: {
			sm: {
				root: 'size-8',
				fallback: 'icon:size-4 text-sm',
			},
			md: {
				root: 'size-10',
				fallback: 'icon:size-5 text-base',
			},
			lg: {
				root: 'size-12',
				fallback: 'icon:size-6 text-lg',
			},
			xl: {
				root: 'size-14',
				fallback: 'icon:size-7 text-lg',
			},
		},
	},
	defaultVariants: {
		size: 'md',
	},
});
