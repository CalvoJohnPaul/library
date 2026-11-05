import {Tabs} from '@ark-ui/react/tabs';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {tabsRecipe} from './Tabs.recipe';

const {withProvider, withContext} = createRecipeContext(tabsRecipe);

export const Root = withProvider(Tabs.Root, 'root', {
	defaultProps: {
		lazyMount: true,
		unmountOnExit: true,
	},
});
export const Content = withContext(Tabs.Content, 'content');
export const Indicator = withContext(Tabs.Indicator, 'indicator');
export const List = withContext(Tabs.List, 'list');
export const Trigger = withContext(Tabs.Trigger, 'trigger');
export const Context = Tabs.Context;
