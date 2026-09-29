import {Pagination} from '@ark-ui/react';
import {
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeft,
	ChevronRightIcon,
	EllipsisIcon,
} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {paginationRecipe} from './Pagination.recipe';

const {withContext, withProvider} = createRecipeContext(paginationRecipe);

export const Root = withProvider(Pagination.Root, 'root');
export const Item = withContext(Pagination.Item, 'item');
export const Ellipsis = withContext(Pagination.Ellipsis, 'ellipsis', {
	defaultProps: {
		children: <EllipsisIcon />,
	},
});
export const FirstTrigger = withContext(Pagination.FirstTrigger, 'firstTrigger', {
	defaultProps: {
		children: <ChevronFirstIcon />,
	},
});
export const LastTrigger = withContext(Pagination.LastTrigger, 'lastTrigger', {
	defaultProps: {
		children: <ChevronLastIcon />,
	},
});
export const NextTrigger = withContext(Pagination.NextTrigger, 'nextTrigger', {
	defaultProps: {
		children: <ChevronRightIcon />,
	},
});
export const PrevTrigger = withContext(Pagination.PrevTrigger, 'prevTrigger', {
	defaultProps: {
		children: <ChevronLeft />,
	},
});
export const Context = Pagination.Context;
