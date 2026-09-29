import type {CollectionItem} from '@ark-ui/react/collection';
import {Combobox} from '@ark-ui/react/combobox';
import {CheckIcon, ChevronDownIcon, XIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {comboboxRecipe} from './Combobox.recipe';

const {withProvider, withContext} = createRecipeContext(comboboxRecipe);

export const Root = withProvider(Combobox.Root<CollectionItem>, 'root', {
	defaultProps: {
		lazyMount: true,
		loopFocus: true,
		positioning: {
			placement: 'bottom',
			sameWidth: true,
		},
	},
});
export const Label = withContext(Combobox.Label, 'label');
export const Control = withContext(Combobox.Control, 'control');
export const Input = withContext(Combobox.Input, 'input');
export const Trigger = withContext(Combobox.Trigger, 'trigger', {
	defaultProps: {
		children: <ChevronDownIcon />,
	},
});
export const ClearTrigger = withContext(Combobox.ClearTrigger, 'clearTrigger', {
	defaultProps: {
		children: <XIcon />,
	},
});
export const Positioner = withContext(Combobox.Positioner, 'positioner');
export const Content = withContext(Combobox.Content, 'content');
export const ItemGroup = withContext(Combobox.ItemGroup, 'itemGroup');
export const ItemGroupLabel = withContext(Combobox.ItemGroupLabel, 'itemGroupLabel');
export const Item = withContext(Combobox.Item, 'item');
export const ItemText = withContext(Combobox.ItemText, 'itemText');
export const ItemIndicator = withContext(Combobox.ItemIndicator, 'itemIndicator', {
	defaultProps: {
		asChild: true,
		children: <CheckIcon />,
	},
});
export const List = withContext(Combobox.List, 'list');
export const Empty = withContext(Combobox.Empty, 'empty');
export const Context = Combobox.Context;
export const ItemContext = Combobox.ItemContext;
