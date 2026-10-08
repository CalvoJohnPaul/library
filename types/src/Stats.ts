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
	}),
	total: z.number(),
});

export const StatsGenreCountDefinition = z.object({
	genre: BookGenreDefinition,
	total: z.number(),
});

export const StatsDefinition = z.object({
	totalBooks: z.number(),
	totalBookCopies: z.number(),
	totalNewMembersThisMonth: z.number(),
	totalOutstandingBorrows: z.number(),
	last14DaysActivity: z.array(StatsActivityPointDefinition),
	topBorrowedBooksThisMonth: z.array(StatsTopBorrowedBookDefinition),
	totalBookCopiesByGenre: z.array(StatsGenreCountDefinition),
});

export type StatsActivityPoint = z.infer<typeof StatsActivityPointDefinition>;
export type StatsTopBorrowedBook = z.infer<typeof StatsTopBorrowedBookDefinition>;
export type StatsGenreCount = z.infer<typeof StatsGenreCountDefinition>;
export type Stats = z.infer<typeof StatsDefinition>;
