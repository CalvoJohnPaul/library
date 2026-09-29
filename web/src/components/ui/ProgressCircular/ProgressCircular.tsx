import {Progress} from '@ark-ui/react/progress';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {progressCircularRecipe} from './ProgressCircular.recipe';

const {withProvider, withContext} = createRecipeContext(progressCircularRecipe);

/**
 * @example

  <ProgressCircular.Root>
    <ProgressCircular.ValueText />
    <ProgressCircular.Control>
      <ProgressCircular.Track />
      <ProgressCircular.Range />
    </ProgressCircular.Control>
  </ProgressCircular.Root>

 *
 */
export const Root = withProvider(Progress.Root, 'root', {
	defaultProps: {
		min: 0,
		max: 100,
	},
});
export const Label = withContext(Progress.Label, 'label');
export const Control = withContext(Progress.Circle, 'circle');
export const Range = withContext(Progress.CircleRange, 'circleRange');
export const Track = withContext(Progress.CircleTrack, 'circleTrack');
export const ValueText = withContext(Progress.ValueText, 'valueText');
export const Context = Progress.Context;
