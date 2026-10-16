import {adventurer} from '@dicebear/collection';
import {createAvatar} from '@dicebear/core';
import {ProgressLinear} from '@/components/ui/ProgressLinear';
import {useDashboardContext} from './DashboardContext';
import {roundedBarMax} from './utils';

export function TopBorrowingMembers() {
	const data = useDashboardContext();
	const members = data.topBorrowedMembersThisMonth;
	const max = roundedBarMax(members.map((member) => member.total));

	return (
		<section className="rounded-xl border border-gray-200 bg-white p-5">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Top borrowing members</h2>
				<p className="text-gray-600 text-xs">Most active members this month</p>
			</div>

			{members.length === 0 ? (
				<p className="pt-16 text-center text-gray-600 text-xs">No borrowing activity this month</p>
			) : (
				<ol className="flex flex-col gap-4">
					{members.map(({member, total}) => (
						<li key={member.id} className="flex items-center gap-3">
							<img
								src={createAvatar(adventurer, {seed: String(member.id)}).toDataUri()}
								alt=""
								className="size-8 shrink-0 rounded-full"
							/>
							<div className="min-w-0 grow">
								<div className="flex items-baseline justify-between gap-2">
									<p className="flex min-w-0 items-baseline gap-1 font-medium text-sm">
										<span className="truncate">{member.name}</span>
										<span aria-hidden className="text-gray-300">
											·
										</span>
										<span className="whitespace-nowrap text-gray-500 text-xs">
											{member.externalId}
										</span>
									</p>
									<p className="whitespace-nowrap text-gray-600 text-xs">{total} borrows</p>
								</div>
								<ProgressLinear.Root className="mt-1.5" value={total} max={max}>
									<ProgressLinear.Track className="h-1.5 grow bg-gray-100">
										<ProgressLinear.Range className="h-1.5 animate-progress-fill bg-emerald-400" />
									</ProgressLinear.Track>
								</ProgressLinear.Root>
							</div>
						</li>
					))}
				</ol>
			)}
		</section>
	);
}
