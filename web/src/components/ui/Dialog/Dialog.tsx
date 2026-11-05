import {Dialog} from '@ark-ui/react/dialog';
import {ark} from '@ark-ui/react/factory';
import {XIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {dialogRecipe} from './Dialog.recipe';

const {withRootProvider, withContext} = createRecipeContext(dialogRecipe);

export const Root = withRootProvider(Dialog.Root, {
	defaultProps: {
		role: 'dialog',
		lazyMount: true,
		unmountOnExit: true,
		closeOnEscape: false,
		closeOnInteractOutside: false,
	},
});
export const Backdrop = withContext(Dialog.Backdrop, 'backdrop');
export const CloseTrigger = withContext(Dialog.CloseTrigger, 'closeTrigger', {
	defaultProps: {
		children: <XIcon />,
	},
});
export const Content = withContext(Dialog.Content, 'content');
export const Description = withContext(Dialog.Description, 'description');
export const Positioner = withContext(Dialog.Positioner, 'positioner');
export const Title = withContext(Dialog.Title, 'title');
export const Trigger = withContext(Dialog.Trigger, 'trigger');
export const Header = withContext(ark.section, 'header');
export const Body = withContext(ark.section, 'body');
export const Footer = withContext(ark.section, 'footer');
export const Context = Dialog.Context;
