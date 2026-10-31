import {progressAnatomy} from '@ark-ui/react/progress';
import {tv} from 'tailwind-variants';
import {anatomyToRecipeSlots} from '@/utils/anatomyToRecipeSlots';

export const progressCircularRecipe = tv({
	slots: anatomyToRecipeSlots(progressAnatomy.omit('track', 'range', 'view'), {
		root: 'relative flex size-20 shrink-0 flex-col items-center justify-center gap-0.5',
		circle: 'absolute inset-0 [--size:5rem] [--thickness:0.525rem]',
		circleRange: 'stroke-blue-600 transition-all duration-300 [stroke-linecap:round]',
		circleTrack: 'stroke-neutral-300 dark:stroke-neutral-600',
		valueText: 'font-semibold text-neutral-600 leading-none dark:text-neutral-300',
	}),
});
