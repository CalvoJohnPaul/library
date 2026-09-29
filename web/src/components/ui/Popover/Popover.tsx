import {Popover} from '@ark-ui/react/popover';
import {XIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {popoverRecipe} from './Popover.recipe';

const {withContext, withRootProvider} = createRecipeContext(popoverRecipe);

export const Root = withRootProvider(Popover.Root, {
	defaultProps: {
		lazyMount: true,
	},
});
export const Anchor = withContext(Popover.Anchor, 'anchor');
export const Arrow = withContext(Popover.Arrow, 'arrow');
export const ArrowTip = withContext(Popover.ArrowTip, 'arrowTip');
export const CloseTrigger = withContext(Popover.CloseTrigger, 'closeTrigger', {
	defaultProps: {
		children: <XIcon />,
	},
});
export const Content = withContext(Popover.Content, 'content');
export const Description = withContext(Popover.Description, 'description');
export const Indicator = withContext(Popover.Indicator, 'indicator');
export const Positioner = withContext(Popover.Positioner, 'positioner');
export const Trigger = withContext(Popover.Trigger, 'trigger');
export const Title = withContext(Popover.Title, 'title');
export const Context = Popover.Context;
