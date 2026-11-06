import type {StatsMonthOverMonthDelta} from '@library/types';
import {Stat} from '@/components/ui/Stat';

export function DeltaBadge({delta}: {delta: StatsMonthOverMonthDelta}) {
	const {current, previous} = delta;
	const diff = current - previous;
	const zero = current === 0 && previous === 0;
	const direction = zero || diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
	const percent = previous > 0 ? Math.round((diff / previous) * 100) : null;
	const text = zero
		? '0% vs last month'
		: percent === null
			? `+${current} vs last month`
			: `${diff >= 0 ? '+' : ''}${percent}% vs last month`;

	return (
		<Stat.Badge direction={direction}>
			<Stat.BadgeIcon />
			<Stat.BadgeLabel>{text}</Stat.BadgeLabel>
		</Stat.Badge>
	);
}
