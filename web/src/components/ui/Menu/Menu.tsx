import {Menu} from '@ark-ui/react/menu';
import {CheckIcon, ChevronDownIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {menuRecipe} from './Menu.recipe';

const {withRootProvider, withContext} = createRecipeContext(menuRecipe);

export const Root = withRootProvider(Menu.Root, {
	defaultProps: {
		lazyMount: true,
		loopFocus: true,
	},
});
export const Arrow = withContext(Menu.Arrow, 'arrow');
export const ArrowTip = withContext(Menu.ArrowTip, 'arrowTip');
export const CheckboxItem = withContext(Menu.CheckboxItem, 'item');
export const Content = withContext(Menu.Content, 'content');
export const ContextTrigger = withContext(Menu.ContextTrigger, 'contextTrigger');
export const Indicator = withContext(Menu.Indicator, 'indicator', {
	defaultProps: {
		asChild: true,
		children: <ChevronDownIcon />,
	},
});
export const Item = withContext(Menu.Item, 'item');
export const ItemGroup = withContext(Menu.ItemGroup, 'itemGroup');
export const ItemGroupLabel = withContext(Menu.ItemGroupLabel, 'itemGroupLabel');
export const ItemIndicator = withContext(Menu.ItemIndicator, 'itemIndicator', {
	defaultProps: {
		asChild: true,
		children: <CheckIcon />,
	},
});
export const ItemText = withContext(Menu.ItemText, 'itemText');
export const Positioner = withContext(Menu.Positioner, 'positioner');
export const RadioItem = withContext(Menu.RadioItem, 'item');
export const RadioItemGroup = withContext(Menu.RadioItemGroup, 'itemGroup');
export const Separator = withContext(Menu.Separator, 'separator');
export const Trigger = withContext(Menu.Trigger, 'trigger');
export const TriggerItem = withContext(Menu.TriggerItem, 'triggerItem');
export const Context = Menu.Context;
export const ItemContext = Menu.ItemContext;
