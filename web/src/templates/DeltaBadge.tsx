import type {StatsMonthOverMonthDelta} from '@library/types';
import {Stat} from '@/components/ui/Stat';

export function DeltaBadge({
	className,
	delta,
}: {
	className?: string;
	delta: StatsMonthOverMonthDelta;
}) {
	const diff = delta.current - delta.previous;
	const zero = delta.current === 0 && delta.previous === 0;
	const direction = zero ? 'up' : diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
	const percent = zero
		? null
		: delta.previous > 0
			? Math.round((diff / delta.previous) * 100)
			: null;
	const text = zero
		? '0% vs last month'
		: percent === null
			? `+${delta.current} vs last month`
			: `${diff >= 0 ? '+' : ''}${percent}% vs last month`;

	return (
		<Stat.Badge direction={direction} className={className}>
			<Stat.BadgeIcon />
			<Stat.BadgeLabel>{text}</Stat.BadgeLabel>
		</Stat.Badge>
	);
}
