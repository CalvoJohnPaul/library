import type * as z from 'zod';
import {StatsDefinition} from './Stats.js';

export const BookStatsDefinition = StatsDefinition.pick({
	totalBookCopies: true,
	totalAvailableCopies: true,
	totalOutstandingBorrows: true,
	totalPendingReservations: true,
	totalReadyToClaimReservations: true,
	last14DaysActivity: true,
	last7DaysReservationActivity: true,
	topBorrowedMembersThisMonth: true,
}).extend({
	monthOverMonth: StatsDefinition.shape.monthOverMonth.pick({newCopies: true, borrows: true}),
});

export type BookStats = z.infer<typeof BookStatsDefinition>;
