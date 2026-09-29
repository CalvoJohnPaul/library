import {Progress} from '@ark-ui/react/progress';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {progressLinearRecipe} from './ProgressLinear.recipe';

const {withProvider, withContext} = createRecipeContext(progressLinearRecipe);

export const Root = withProvider(Progress.Root, 'root', {
	defaultProps: {
		min: 0,
		max: 100,
	},
});
export const Label = withContext(Progress.Label, 'label');
export const Control = withContext(Progress.View, 'view');
export const Range = withContext(Progress.Range, 'range');
export const Track = withContext(Progress.Track, 'track');
export const ValueText = withContext(Progress.ValueText, 'valueText');
export const Context = Progress.Context;
