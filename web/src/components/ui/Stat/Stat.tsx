import {ark} from '@ark-ui/react';
import {MinusIcon, TrendingDownIcon, TrendingUpIcon} from 'lucide-react';
import {type ComponentProps, createContext, useContext} from 'react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {statBadgeRecipe, statRecipe} from './Stat.recipe';

const {withProvider, withContext} = createRecipeContext(statRecipe);
const {withProvider: withBadgeProvider, withContext: withBadgeContext} =
	createRecipeContext(statBadgeRecipe);

export const Root = withProvider(ark.div, 'root');
export const Label = withContext(ark.div, 'label');
export const Icon = withContext(ark.span, 'icon');
export const ValueText = withContext(ark.div, 'valueText');
export const HelpText = withContext(ark.div, 'helpText');

const StyledBadge = withBadgeProvider(ark.span, 'root');
const BadgeDirectionContext = createContext<'up' | 'down' | 'flat'>('up');

export function Badge(props: ComponentProps<typeof StyledBadge>) {
	return (
		<BadgeDirectionContext value={props.direction ?? 'up'}>
			<StyledBadge {...props} />
		</BadgeDirectionContext>
	);
}

export const BadgeIcon = withBadgeContext(function BadgeIcon(
	props: ComponentProps<typeof ark.svg>,
) {
	const direction = useContext(BadgeDirectionContext);
	const Icon =
		direction === 'up' ? TrendingUpIcon : direction === 'down' ? TrendingDownIcon : MinusIcon;

	return (
		<ark.svg asChild {...props}>
			{props.children ?? <Icon />}
		</ark.svg>
	);
}, 'icon');

export const BadgeLabel = withBadgeContext(ark.span, 'label');
