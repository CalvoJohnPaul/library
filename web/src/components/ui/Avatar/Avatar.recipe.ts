import {avatarAnatomy} from '@ark-ui/react/avatar';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const avatarRecipe = tv({
	slots: anatomyToRecipeSlots(avatarAnatomy, {
		root: 'flex items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-100',
		fallback: 'font-medium icon:text-gray-400 text-gray-600',
		image: 'size-full object-cover object-center',
	}),
	variants: {
		size: {
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
