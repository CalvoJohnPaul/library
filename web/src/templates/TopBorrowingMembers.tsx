import {funEmoji} from '@dicebear/collection';
import {createAvatar} from '@dicebear/core';
import type {StatsTopBorrowedMember} from '@library/types';
import {Avatar} from '@/components/ui/Avatar';
import {ProgressLinear} from '@/components/ui/ProgressLinear';

export function TopBorrowingMembers({
	data: members,
	numOfDays,
}: {
	data: StatsTopBorrowedMember[];
	numOfDays: number;
}) {
	const highestTotal = Math.max(0, ...members.map((member) => member.total));
	const max = Math.max(100, Math.ceil(highestTotal / 100) * 100);

	return (
		<section className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
			<div className="mb-5">
				<h2 className="font-semibold text-sm">Top borrowing members</h2>
				<p className="text-neutral-600 text-xs dark:text-neutral-300">
					Most active members over the last {numOfDays} days
				</p>
			</div>
			<ol className="flex flex-col gap-4">
				{members.length === 0 && (
					<li className="text-neutral-600 text-sm dark:text-neutral-300">
						No borrows in the last {numOfDays} days.
					</li>
				)}
				{members.map(({member, total}) => (
					<li key={member.id} className="flex items-center gap-3">
						<Avatar.Root size="sm" className="shrink-0">
							<Avatar.Image
								src={createAvatar(funEmoji, {seed: member.id.toString()}).toDataUri()}
							/>
							<Avatar.Fallback />
						</Avatar.Root>

						<div className="min-w-0 grow">
							<div className="flex items-baseline justify-between gap-2">
								<p className="flex min-w-0 items-baseline gap-1 font-medium text-sm">
									<span className="truncate">{member.name}</span>
									<span aria-hidden className="text-neutral-300 dark:text-neutral-600">
										·
									</span>
									<span className="whitespace-nowrap text-neutral-500 text-xs dark:text-neutral-400">
										{member.externalId}
									</span>
								</p>
								<p className="whitespace-nowrap text-neutral-600 text-xs dark:text-neutral-300">
									{total} borrows
								</p>
							</div>
							<ProgressLinear.Root className="mt-1.5" value={total} max={max}>
								<ProgressLinear.Track className="h-1.5 grow bg-neutral-100 dark:bg-neutral-800">
									<ProgressLinear.Range className="h-1.5 animate-progress-fill bg-emerald-400 dark:bg-emerald-300" />
								</ProgressLinear.Track>
							</ProgressLinear.Root>
						</div>
					</li>
				))}
			</ol>
		</section>
	);
}
