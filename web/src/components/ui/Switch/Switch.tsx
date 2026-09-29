import {Switch} from '@ark-ui/react/switch';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {switchRecipe} from './Switch.recipe';

const {withContext, withProvider} = createRecipeContext(switchRecipe);

export const Root = withProvider(Switch.Root, 'root');
export const Control = withContext(Switch.Control, 'control');
export const HiddenInput = Switch.HiddenInput;
export const Label = withContext(Switch.Label, 'label');
export const Thumb = withContext(Switch.Thumb, 'thumb');
export const Context = Switch.Context;
