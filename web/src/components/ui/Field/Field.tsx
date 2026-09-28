import {Field} from '@ark-ui/react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {fieldRecipe} from './Field.recipe';

const {withContext, withProvider} = createRecipeContext(fieldRecipe);

export const Root = withProvider(Field.Root, 'root');
export const Label = withContext(Field.Label, 'label');
export const Input = withContext(Field.Input, 'input');
export const Textarea = withContext(Field.Textarea, 'textarea');
export const ErrorText = withContext(Field.ErrorText, 'errorText');
export const HelperText = withContext(Field.HelperText, 'helperText');
export const Context = Field.Context;
