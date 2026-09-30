import {Tooltip} from '@ark-ui/react/tooltip';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {tooltipRecipe} from './Tooltip.recipe';

const {withContext, withRootProvider} = createRecipeContext(tooltipRecipe);

export const Root = withRootProvider(Tooltip.Root, {
	defaultProps: {
		lazyMount: true,
		unmountOnExit: true,
	},
});
export const Arrow = withContext(Tooltip.Arrow, 'arrow');
export const ArrowTip = withContext(Tooltip.ArrowTip, 'arrowTip');
export const Content = withContext(Tooltip.Content, 'content');
export const Positioner = withContext(Tooltip.Positioner, 'positioner');
export const Trigger = withContext(Tooltip.Trigger, 'trigger');
export const Context = Tooltip.Context;
