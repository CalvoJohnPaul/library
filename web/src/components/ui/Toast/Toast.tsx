import {ark} from '@ark-ui/react/factory';
import {Toast} from '@ark-ui/react/toast';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {toastRecipe} from './Toast.recipe';

const {withContext, withProvider} = createRecipeContext(toastRecipe);

export const Root = withProvider(Toast.Root, 'root');
export const ActionTrigger = withContext(Toast.ActionTrigger, 'actionTrigger');
export const CloseTrigger = withContext(Toast.CloseTrigger, 'closeTrigger');
export const Description = withContext(Toast.Description, 'description');
export const Title = withContext(Toast.Title, 'title');
export const Group = withContext(ark.div, 'group');
export const Context = Toast.Context;
