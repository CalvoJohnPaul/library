import {progressAnatomy} from '@ark-ui/react/progress';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const progressLinearRecipe = tv({
	slots: anatomyToRecipeSlots(progressAnatomy.omit('circle', 'circleTrack', 'circleRange'), {
		root: 'flex items-center gap-2',
		view: 'grow',
		track: 'h-2 rounded-full bg-neutral-800',
		range: 'h-2 rounded-full bg-blue-600',
		valueText: 'font-medium text-neutral-300 text-sm',
	}),
});
