import {
	type BookGenre,
	FailedHttpResponseDefinition,
	StatsDefinition,
	SuccessfulHttpResponseDefinition,
} from '@library/types';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Stats'],
				response: {
					200: SuccessfulHttpResponseDefinition(StatsDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
				},
			},
		},
		async (_req, reply) => {
			const now = new Date();

			const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			const startOfLast14Days = new Date(startOfToday);
			startOfLast14Days.setDate(startOfLast14Days.getDate() - 13);

			const [
				totalBooks,
				totalBookCopies,
				totalOutstandingBorrows,
				newBooksThisMonth,
				newBooksLastMonth,
				newCopiesThisMonth,
				newCopiesLastMonth,
				newMembersThisMonth,
				newMembersLastMonth,
				borrowsThisMonth,
				borrowsLastMonth,
				activityRows,
				borrowRows,
				memberRows,
				bookRows,
			] = await app.prisma.$transaction([
				app.prisma.book.count(),
				app.prisma.bookCopy.count(),
				app.prisma.bookCopy.count({
					where: {status: 'BORROWED'},
				}),
				app.prisma.book.count({
					where: {dateTimeCreated: {gte: startOfMonth}},
				}),
				app.prisma.book.count({
					where: {dateTimeCreated: {gte: startOfLastMonth, lt: startOfMonth}},
				}),
				app.prisma.bookCopy.count({
					where: {dateTimeCreated: {gte: startOfMonth}},
				}),
				app.prisma.bookCopy.count({
					where: {dateTimeCreated: {gte: startOfLastMonth, lt: startOfMonth}},
				}),
				app.prisma.member.count({
					where: {dateTimeCreated: {gte: startOfMonth}},
				}),
				app.prisma.member.count({
					where: {dateTimeCreated: {gte: startOfLastMonth, lt: startOfMonth}},
				}),
				app.prisma.transaction.count({
					where: {type: 'BORROW', dateTimeCreated: {gte: startOfMonth}},
				}),
				app.prisma.transaction.count({
					where: {type: 'BORROW', dateTimeCreated: {gte: startOfLastMonth, lt: startOfMonth}},
				}),
				app.prisma.transaction.findMany({
					where: {
						type: {in: ['BORROW', 'RETURN']},
						dateTimeCreated: {gte: startOfLast14Days},
					},
					select: {type: true, dateTimeCreated: true},
				}),
				app.prisma.transaction.findMany({
					where: {
						type: 'BORROW',
						dateTimeCreated: {gte: startOfMonth},
					},
					select: {
						bookCopy: {
							select: {
								book: {
									select: {id: true, title: true, genre: true},
								},
							},
						},
					},
				}),
				app.prisma.transaction.findMany({
					where: {
						type: 'BORROW',
						dateTimeCreated: {gte: startOfMonth},
					},
					select: {
						member: {
							select: {id: true, name: true, externalId: true},
						},
					},
				}),
				app.prisma.book.findMany({
					select: {
						genre: true,
						_count: {select: {copies: true}},
					},
				}),
			]);

			const last14DaysActivity = Array.from({length: 14}, (_, index) => {
				const timestamp = new Date(startOfToday);
				timestamp.setDate(timestamp.getDate() - (13 - index));

				return {
					timestamp,
					totalBooksBorrowed: 0,
					totalBooksReturned: 0,
				};
			});

			for (const row of activityRows) {
				const startOfDay = new Date(
					row.dateTimeCreated.getFullYear(),
					row.dateTimeCreated.getMonth(),
					row.dateTimeCreated.getDate(),
				);

				const index =
					13 + Math.round((startOfDay.getTime() - startOfToday.getTime()) / DAY_IN_MILLISECONDS);

				if (index < 0 || index >= last14DaysActivity.length) continue;

				if (row.type === 'BORROW') last14DaysActivity[index].totalBooksBorrowed += 1;
				else last14DaysActivity[index].totalBooksReturned += 1;
			}

			const topBorrowedBooksThisMonthMap = new Map<
				number,
				{book: {id: number; title: string; genre: BookGenre}; total: number}
			>();

			for (const row of borrowRows) {
				const {id, title, genre} = row.bookCopy.book;
				const existing = topBorrowedBooksThisMonthMap.get(id);

				if (existing) existing.total += 1;
				else topBorrowedBooksThisMonthMap.set(id, {book: {id, title, genre}, total: 1});
			}

			// Keep enough books for the dashboard to filter by genre client-side.
			const TOP_BORROWED_BOOKS_LIMIT = 30;

			const topBorrowedBooksThisMonth = [...topBorrowedBooksThisMonthMap.values()]
				.sort((a, b) => b.total - a.total || a.book.title.localeCompare(b.book.title))
				.slice(0, TOP_BORROWED_BOOKS_LIMIT);

			const topBorrowedMembersThisMonthMap = new Map<
				number,
				{member: {id: number; name: string; externalId: string}; total: number}
			>();

			for (const row of memberRows) {
				const {id, name, externalId} = row.member;
				const existing = topBorrowedMembersThisMonthMap.get(id);

				if (existing) existing.total += 1;
				else topBorrowedMembersThisMonthMap.set(id, {member: {id, name, externalId}, total: 1});
			}

			const topBorrowedMembersThisMonth = [...topBorrowedMembersThisMonthMap.values()]
				.sort((a, b) => b.total - a.total || a.member.name.localeCompare(b.member.name))
				.slice(0, 5);

			const totalBookCopiesByGenreMap = new Map<BookGenre, number>();

			for (const row of bookRows) {
				totalBookCopiesByGenreMap.set(
					row.genre,
					(totalBookCopiesByGenreMap.get(row.genre) ?? 0) + row._count.copies,
				);
			}

			const totalBookCopiesByGenre = [...totalBookCopiesByGenreMap.entries()].map(
				([genre, total]) => ({genre, total}),
			);

			return reply.send({
				ok: true,
				data: {
					totalBooks,
					totalBookCopies,
					totalOutstandingBorrows,
					last14DaysActivity,
					topBorrowedBooksThisMonth,
					topBorrowedMembersThisMonth,
					totalBookCopiesByGenre,
					monthOverMonth: {
						newBooks: {current: newBooksThisMonth, previous: newBooksLastMonth},
						newCopies: {current: newCopiesThisMonth, previous: newCopiesLastMonth},
						newMembers: {current: newMembersThisMonth, previous: newMembersLastMonth},
						borrows: {current: borrowsThisMonth, previous: borrowsLastMonth},
					},
				},
			});
		},
	);
};

export const autoPrefix = '/stats';
export default plugin;
