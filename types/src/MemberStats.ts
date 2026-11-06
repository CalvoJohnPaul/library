import type * as z from 'zod';
import {StatsDefinition} from './Stats.js';

export const MemberStatsDefinition = StatsDefinition.pick({
	totalOutstandingBorrows: true,
	totalPendingReservations: true,
	totalReadyToClaimReservations: true,
	last14DaysActivity: true,
	last7DaysReservationActivity: true,
}).extend({
	topBorrowedBooksLast90Days: StatsDefinition.shape.topBorrowedBooksLast30Days,
	monthOverMonth: StatsDefinition.shape.monthOverMonth.pick({borrows: true}),
});

export type MemberStats = z.infer<typeof MemberStatsDefinition>;
