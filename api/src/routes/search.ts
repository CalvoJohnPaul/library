import {
	FailedHttpResponseDefinition,
	type SearchResult,
	SearchResultDefinition,
	type SearchResultType,
	SuccessfulHttpResponseDefinition,
} from '@library/types';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import * as z from 'zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Search'],
				querystring: z.object({
					q: z.string().trim().max(250).optional(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(z.array(SearchResultDefinition)),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const q = req.query.q;

			if (!q) return reply.send({ok: true, data: []});

			const ordered = await app.prisma.$transaction(
				async (tx) => {
					const escaped = q.replace(/[\\%_]/g, '\\$&');
					const prefix = `${escaped}%`;
					const contains = `%${escaped}%`;
					const hits = await tx.$queryRaw<{id: number; type: SearchResultType}[]>`
				WITH matches AS (
					SELECT 'BOOK' AS type, b.id, b."dateTimeCreated" AS created,
						CASE WHEN b.title ILIKE ${escaped} THEN 0
							WHEN b.title ILIKE ${prefix} THEN 1 ELSE 2 END AS score
					FROM "Book" b WHERE b.title ILIKE ${contains}
					UNION ALL
					SELECT 'BOOK', b.id, b."dateTimeCreated",
						CASE WHEN b.author ILIKE ${escaped} THEN 0
							WHEN b.author ILIKE ${prefix} THEN 1 ELSE 2 END
					FROM "Book" b WHERE b.author ILIKE ${contains}
					UNION ALL
					SELECT 'BOOK', b.id, b."dateTimeCreated",
						CASE WHEN c.isbn ILIKE ${escaped} THEN 0
							WHEN c.isbn ILIKE ${prefix} THEN 1 ELSE 2 END
					FROM "BookCopy" c JOIN "Book" b ON b.id = c."bookId"
					WHERE c.isbn ILIKE ${contains}
					UNION ALL
					SELECT 'MEMBER', m.id, m."dateTimeCreated",
						CASE WHEN m."externalId" ILIKE ${escaped} THEN 0
							WHEN m."externalId" ILIKE ${prefix} THEN 1 ELSE 2 END
					FROM "Member" m WHERE m."externalId" ILIKE ${contains}
					UNION ALL
					SELECT 'MEMBER', m.id, m."dateTimeCreated",
						CASE WHEN m.name ILIKE ${escaped} THEN 0
							WHEN m.name ILIKE ${prefix} THEN 1 ELSE 2 END
					FROM "Member" m WHERE m.name ILIKE ${contains}
					UNION ALL
					SELECT 'RESERVATION', r.id, r."dateTimeCreated",
						CASE WHEN r.ticket ILIKE ${escaped} THEN 0
							WHEN r.ticket ILIKE ${prefix} THEN 1 ELSE 2 END
					FROM "Reservation" r WHERE r.ticket ILIKE ${contains}
					UNION ALL
					SELECT 'TRANSACTION', t.id, t."dateTimeCreated",
						CASE WHEN t.ticket ILIKE ${escaped} THEN 0
							WHEN t.ticket ILIKE ${prefix} THEN 1 ELSE 2 END
					FROM "Transaction" t WHERE t.ticket ILIKE ${contains}
				)
				SELECT type, id FROM matches
				GROUP BY type, id
				ORDER BY MIN(score), MAX(created) DESC, type, id DESC
				LIMIT ${25}
			`;

					if (hits.length === 0) return [];

					const ids = (type: SearchResultType) =>
						hits.filter((hit) => hit.type === type).map((hit) => hit.id);

					const bookIds = ids('BOOK');
					const memberIds = ids('MEMBER');
					const reservationIds = ids('RESERVATION');
					const transactionIds = ids('TRANSACTION');

					const books =
						bookIds.length > 0
							? await tx.book.findMany({
									where: {id: {in: bookIds}},
									select: {
										id: true,
										title: true,
										author: true,
									},
								})
							: [];

					const members =
						memberIds.length > 0
							? await tx.member.findMany({
									where: {id: {in: memberIds}},
									select: {
										id: true,
										externalId: true,
										name: true,
									},
								})
							: [];

					const reservations =
						reservationIds.length > 0
							? await tx.reservation.findMany({
									where: {id: {in: reservationIds}},
									select: {
										id: true,
										status: true,
										ticket: true,
									},
								})
							: [];

					const transactions =
						transactionIds.length > 0
							? await tx.transaction.findMany({
									where: {id: {in: transactionIds}},
									select: {
										id: true,
										type: true,
										status: true,
										ticket: true,
									},
								})
							: [];

					const results: SearchResult[] = [
						...books.map((book) => ({
							type: 'BOOK' as const,
							data: book,
						})),
						...members.map((member) => ({
							type: 'MEMBER' as const,
							data: member,
						})),
						...reservations.map((reservation) => ({
							type: 'RESERVATION' as const,
							data: reservation,
						})),
						...transactions.map((transaction) => ({
							type: 'TRANSACTION' as const,
							data: transaction,
						})),
					];

					const byId = new Map(
						results.map((result) => [`${result.type}:${result.data.id}`, result]),
					);

					return hits.flatMap((hit) => {
						const result = byId.get(`${hit.type}:${hit.id}`);
						return result ? [result] : [];
					});
				},
				{isolationLevel: 'RepeatableRead'},
			);

			return reply.send({ok: true, data: ordered});
		},
	);
};

export const autoPrefix = '/search';
export default plugin;
