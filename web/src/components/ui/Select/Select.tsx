import type {CollectionItem} from '@ark-ui/react/collection';
import {Select} from '@ark-ui/react/select';
import {CheckIcon, ChevronDownIcon, XIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {selectRecipe} from './Select.recipe';

const {withProvider, withContext} = createRecipeContext(selectRecipe);

export const Root = withProvider(Select.Root<CollectionItem>, 'root', {
	defaultProps: {
		lazyMount: true,
		unmountOnExit: true,
		loopFocus: true,
		deselectable: true,
		positioning: {
			placement: 'bottom',
			sameWidth: true,
		},
	},
});
export const ClearTrigger = withContext(Select.ClearTrigger, 'clearTrigger', {
	defaultProps: {
		children: <XIcon />,
	},
});
export const Content = withContext(Select.Content, 'content');
export const Control = withContext(Select.Control, 'control');
export const HiddenSelect = Select.HiddenSelect;
export const Indicator = withContext(Select.Indicator, 'indicator', {
	defaultProps: {
		asChild: true,
		children: <ChevronDownIcon />,
	},
});
export const Item = withContext(Select.Item, 'item');
export const ItemGroup = withContext(Select.ItemGroup, 'itemGroup');
export const ItemGroupLabel = withContext(Select.ItemGroupLabel, 'itemGroupLabel');
export const ItemIndicator = withContext(Select.ItemIndicator, 'itemIndicator', {
	defaultProps: {
		asChild: true,
		children: <CheckIcon />,
	},
});
export const ItemText = withContext(Select.ItemText, 'itemText');
export const Label = withContext(Select.Label, 'label');
export const List = withContext(Select.List, 'list');
export const Positioner = withContext(Select.Positioner, 'positioner');
export const Trigger = withContext(Select.Trigger, 'trigger');
export const ValueText = withContext(Select.ValueText, 'valueText');
export const Context = Select.Context;
export const ItemContext = Select.ItemContext;
