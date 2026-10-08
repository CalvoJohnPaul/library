import type {ReactNode} from 'react';
import {cx} from 'tailwind-variants';

interface DashboardCardProps {
	title: string;
	subtitle?: string;
	children: ReactNode;
	className?: string;
}

export function DashboardCard({title, subtitle, children, className}: DashboardCardProps) {
	return (
		<section className={cx('rounded-xl border border-gray-200 bg-white p-5', className)}>
			<div className="mb-4">
				<h2 className="font-semibold text-sm">{title}</h2>
				{subtitle && <p className="text-gray-600 text-xs">{subtitle}</p>}
			</div>
			{children}
		</section>
	);
}
