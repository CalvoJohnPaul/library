import * as z from 'zod';
import {BookGenreDefinition} from './Book.js';
import {DateDefinition} from './common.js';

export const StatsActivityPointDefinition = z.object({
	timestamp: DateDefinition,
	totalBooksBorrowed: z.number(),
	totalBooksReturned: z.number(),
});

export const StatsTopBorrowedBookDefinition = z.object({
	book: z.object({
		id: z.number(),
		title: z.string(),
		genre: BookGenreDefinition,
	}),
	total: z.number(),
});

export const StatsTopBorrowedMemberDefinition = z.object({
	member: z.object({
		id: z.number(),
		name: z.string(),
		externalId: z.string(),
	}),
	total: z.number(),
});

export const StatsGenreCountDefinition = z.object({
	genre: BookGenreDefinition,
	total: z.number(),
});

export const StatsMonthOverMonthDeltaDefinition = z.object({
	current: z.number(),
	previous: z.number(),
});

export const StatsDefinition = z.object({
	totalBooks: z.number(),
	totalBookCopies: z.number(),
	totalOutstandingBorrows: z.number(),
	last14DaysActivity: z.array(StatsActivityPointDefinition),
	topBorrowedBooksThisMonth: z.array(StatsTopBorrowedBookDefinition),
	topBorrowedMembersThisMonth: z.array(StatsTopBorrowedMemberDefinition),
	totalBookCopiesByGenre: z.array(StatsGenreCountDefinition),
	monthOverMonth: z.object({
		newBooks: StatsMonthOverMonthDeltaDefinition,
		newCopies: StatsMonthOverMonthDeltaDefinition,
		newMembers: StatsMonthOverMonthDeltaDefinition,
		borrows: StatsMonthOverMonthDeltaDefinition,
	}),
});

export type StatsActivityPoint = z.infer<typeof StatsActivityPointDefinition>;
export type StatsTopBorrowedBook = z.infer<typeof StatsTopBorrowedBookDefinition>;
export type StatsTopBorrowedMember = z.infer<typeof StatsTopBorrowedMemberDefinition>;
export type StatsGenreCount = z.infer<typeof StatsGenreCountDefinition>;
export type StatsMonthOverMonthDelta = z.infer<typeof StatsMonthOverMonthDeltaDefinition>;
export type Stats = z.infer<typeof StatsDefinition>;
