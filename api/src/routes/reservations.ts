import {
	CreateReservationInputDefinition,
	FailedHttpResponseDefinition,
	PaginatedDefinition,
	ReservationDefinition,
	ReservationSortByInputDefinition,
	ReservationStatusDefinition,
	SortOrderDefinition,
	SuccessfulHttpResponseDefinition,
	UpdateReservationInputDefinition,
} from '@library/types';
import {clamp} from 'es-toolkit';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import {uid} from 'uid';
import * as XLSX from 'xlsx';
import * as z from 'zod';
import type {Prisma} from '../../prisma/.generated/client';
import {
	ExcelWorkbookDefinition,
	QueryString__DateDefinition,
	QueryString__EnumArrayDefinition,
	QueryString__EnumDefinition,
	QueryString__NumberArrayDefinition,
	QueryString__NumberDefinition,
	QueryString__StringArrayDefinition,
	QueryString__StringDefinition,
} from '../types';

const reservationSelect = {
	id: true,
	book: {select: {id: true, title: true}},
	bookCopy: {select: {id: true, isbn: true, status: true}},
	member: {select: {id: true, name: true, externalId: true}},
	status: true,
	ticket: true,
	remarks: true,
	dateTimeCreated: true,
	dateTimeUpdated: true,
} satisfies Prisma.ReservationSelect;

const params = z.object({id: z.coerce.number().int().positive()});
const headers = z.object({'x-csrf-token': z.string().nullable().optional()});

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Reservations'],
				querystring: z.object({
					page: QueryString__NumberDefinition,
					pageSize: QueryString__NumberDefinition,
					bookId__eq: QueryString__NumberDefinition,
					bookId__neq: QueryString__NumberDefinition,
					bookId__in: QueryString__NumberArrayDefinition,
					bookId__nin: QueryString__NumberArrayDefinition,
					memberId__eq: QueryString__NumberDefinition,
					memberId__neq: QueryString__NumberDefinition,
					memberId__in: QueryString__NumberArrayDefinition,
					memberId__nin: QueryString__NumberArrayDefinition,
					ticket__eq: QueryString__StringDefinition,
					ticket__neq: QueryString__StringDefinition,
					ticket__in: QueryString__StringArrayDefinition,
					ticket__nin: QueryString__StringArrayDefinition,
					ticket__contains: QueryString__StringDefinition,
					isbn__eq: QueryString__StringDefinition,
					isbn__neq: QueryString__StringDefinition,
					isbn__in: QueryString__StringArrayDefinition,
					isbn__nin: QueryString__StringArrayDefinition,
					isbn__contains: QueryString__StringDefinition,
					status__eq: QueryString__EnumDefinition(ReservationStatusDefinition),
					status__neq: QueryString__EnumDefinition(ReservationStatusDefinition),
					status__in: QueryString__EnumArrayDefinition(ReservationStatusDefinition),
					status__nin: QueryString__EnumArrayDefinition(ReservationStatusDefinition),
					dateTimeCreated__gt: QueryString__DateDefinition,
					dateTimeCreated__gte: QueryString__DateDefinition,
					dateTimeCreated__lt: QueryString__DateDefinition,
					dateTimeCreated__lte: QueryString__DateDefinition,
					dateTimeUpdated__gt: QueryString__DateDefinition,
					dateTimeUpdated__gte: QueryString__DateDefinition,
					dateTimeUpdated__lt: QueryString__DateDefinition,
					dateTimeUpdated__lte: QueryString__DateDefinition,
					sortBy: ReservationSortByInputDefinition.optional().nullable(),
					sortOrder: SortOrderDefinition.optional().nullable(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(PaginatedDefinition(ReservationDefinition)),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const query = req.query;
			const where: Prisma.ReservationWhereInput = {};

			if (
				query.bookId__eq != null ||
				query.bookId__neq != null ||
				query.bookId__in != null ||
				query.bookId__nin != null
			) {
				where.bookId = {
					...(query.bookId__eq != null && {equals: query.bookId__eq}),
					...(query.bookId__neq != null && {not: query.bookId__neq}),
					...(query.bookId__in != null && {in: query.bookId__in}),
					...(query.bookId__nin != null && {notIn: query.bookId__nin}),
				};
			}

			if (
				query.memberId__eq != null ||
				query.memberId__neq != null ||
				query.memberId__in != null ||
				query.memberId__nin != null
			) {
				where.memberId = {
					...(query.memberId__eq != null && {equals: query.memberId__eq}),
					...(query.memberId__neq != null && {not: query.memberId__neq}),
					...(query.memberId__in != null && {in: query.memberId__in}),
					...(query.memberId__nin != null && {notIn: query.memberId__nin}),
				};
			}

			if (
				query.status__eq != null ||
				query.status__neq != null ||
				query.status__in != null ||
				query.status__nin != null
			) {
				where.status = {
					...(query.status__eq != null && {equals: query.status__eq}),
					...(query.status__neq != null && {not: query.status__neq}),
					...(query.status__in != null && {in: query.status__in}),
					...(query.status__nin != null && {notIn: query.status__nin}),
				};
			}

			if (
				query.ticket__eq != null ||
				query.ticket__neq != null ||
				query.ticket__in != null ||
				query.ticket__nin != null ||
				query.ticket__contains != null
			) {
				where.ticket = {
					...(query.ticket__eq != null && {equals: query.ticket__eq}),
					...(query.ticket__neq != null && {not: query.ticket__neq}),
					...(query.ticket__in != null && {in: query.ticket__in}),
					...(query.ticket__nin != null && {notIn: query.ticket__nin}),
					...(query.ticket__contains != null && {
						contains: query.ticket__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				query.isbn__eq != null ||
				query.isbn__neq != null ||
				query.isbn__in != null ||
				query.isbn__nin != null ||
				query.isbn__contains != null
			) {
				where.bookCopy = {
					is: {
						isbn: {
							...(query.isbn__eq != null && {equals: query.isbn__eq}),
							...(query.isbn__neq != null && {not: query.isbn__neq}),
							...(query.isbn__in != null && {in: query.isbn__in}),
							...(query.isbn__nin != null && {notIn: query.isbn__nin}),
							...(query.isbn__contains != null && {
								contains: query.isbn__contains,
								mode: 'insensitive',
							}),
						},
					},
				};
			}

			if (
				query.dateTimeCreated__gt != null ||
				query.dateTimeCreated__gte != null ||
				query.dateTimeCreated__lt != null ||
				query.dateTimeCreated__lte != null
			) {
				where.dateTimeCreated = {
					...(query.dateTimeCreated__gt != null && {gt: query.dateTimeCreated__gt}),
					...(query.dateTimeCreated__gte != null && {gte: query.dateTimeCreated__gte}),
					...(query.dateTimeCreated__lt != null && {lt: query.dateTimeCreated__lt}),
					...(query.dateTimeCreated__lte != null && {lte: query.dateTimeCreated__lte}),
				};
			}

			if (
				query.dateTimeUpdated__gt != null ||
				query.dateTimeUpdated__gte != null ||
				query.dateTimeUpdated__lt != null ||
				query.dateTimeUpdated__lte != null
			) {
				where.dateTimeUpdated = {
					...(query.dateTimeUpdated__gt != null && {gt: query.dateTimeUpdated__gt}),
					...(query.dateTimeUpdated__gte != null && {gte: query.dateTimeUpdated__gte}),
					...(query.dateTimeUpdated__lt != null && {lt: query.dateTimeUpdated__lt}),
					...(query.dateTimeUpdated__lte != null && {lte: query.dateTimeUpdated__lte}),
				};
			}

			const page = Math.max(1, Math.floor(req.query.page ?? 1));
			const take = clamp(Math.floor(req.query.pageSize ?? 10), 10, 100);
			const [total, rows] = await app.prisma.$transaction([
				app.prisma.reservation.count({where}),
				app.prisma.reservation.findMany({
					where,
					skip: take * (page - 1),
					take,
					select: reservationSelect,
					orderBy:
						req.query.sortBy == null
							? [{dateTimeCreated: 'desc'}, {id: 'desc'}]
							: {[req.query.sortBy]: req.query.sortOrder === 'ASC' ? 'asc' : 'desc'},
				}),
			]);

			return reply.send({
				ok: true,
				data: {
					rows,
					total,
					next: page * take < total ? page + 1 : null,
					hasNext: page * take < total,
					previous: page > 1 ? page - 1 : null,
					hasPrevious: page > 1,
				},
			});
		},
	);

	app.get(
		'/:id',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Reservations'],
				params,
				response: {
					200: SuccessfulHttpResponseDefinition(ReservationDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const reservation = await app.prisma.reservation.findUnique({
				where: {id: req.params.id},
				select: reservationSelect,
			});

			if (!reservation) return reply.notFound();

			return reply.send({ok: true, data: reservation});
		},
	);

	app.post(
		'/',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Reservations'],
				headers,
				body: CreateReservationInputDefinition,
				response: {
					201: SuccessfulHttpResponseDefinition(ReservationDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					409: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const {bookId, memberId, remarks} = req.body;
			const [bookExists, memberExists] = await Promise.all([
				app.prisma.book.exists({id: bookId}),
				app.prisma.member.exists({id: memberId}),
			]);

			if (!bookExists) {
				return reply.badRequest('Book not found');
			}

			if (!memberExists) {
				return reply.badRequest('Member not found');
			}

			if (await app.prisma.reservation.exists({bookId, memberId, status: 'PENDING'})) {
				return reply.conflict('Reservation already exists');
			}

			const reservation = await app.prisma.$transaction(async (tx) => {
				const date = new Date();
				const ticket = `${req.account.id.toString().padStart(4, '0')}-${uid(4).toUpperCase()}-${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getFullYear()}`;

				const reservation = await tx.reservation.create({
					data: {bookId, memberId, remarks, ticket},
					select: reservationSelect,
				});

				await tx.transaction.create({
					data: {
						type: 'RESERVE',
						status: 'PENDING',
						ticket,
						remarks,
						bookId,
						memberId,
						reservationId: reservation.id,
					},
				});

				return reservation;
			});

			return reply.code(201).send({ok: true, data: reservation});
		},
	);

	app.patch(
		'/:id',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Reservations'],
				headers,
				params,
				body: UpdateReservationInputDefinition,
				response: {
					200: SuccessfulHttpResponseDefinition(ReservationDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			if (!(await app.prisma.reservation.exists({id: req.params.id}))) {
				return reply.notFound();
			}

			const reservation = await app.prisma.reservation.update({
				where: {id: req.params.id},
				data: req.body,
				select: reservationSelect,
			});

			return reply.send({ok: true, data: reservation});
		},
	);

	app.post(
		'/:id/unreserve',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Reservations'],
				headers,
				params,
				body: UpdateReservationInputDefinition.nullish(),
				response: {
					200: SuccessfulHttpResponseDefinition(ReservationDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
					409: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const existing = await app.prisma.reservation.findUnique({
				where: {id: req.params.id},
				select: {
					status: true,
					ticket: true,
					bookId: true,
					memberId: true,
					bookCopyId: true,
					remarks: true,
				},
			});

			if (!existing) {
				return reply.notFound();
			}

			if (existing.status !== 'PENDING') {
				return reply.conflict('Reservation is not pending');
			}

			const note = req.body?.remarks?.trim();
			const reason = 'Cancelled manually.';

			const unreserved = await app.prisma.$transaction(async (tx) => {
				const {count} = await tx.reservation.updateMany({
					where: {
						id: req.params.id,
						status: 'PENDING',
					},
					data: {
						status: 'CANCELLED',
						remarks: [existing.remarks, note, reason].filter(Boolean).join('; '),
					},
				});

				if (count === 0) {
					return false;
				}

				if (existing.bookCopyId != null) {
					const released = await tx.bookCopy.updateMany({
						where: {id: existing.bookCopyId, status: 'RESERVED'},
						data: {status: 'AVAILABLE'},
					});

					if (released.count === 0) {
						throw app.httpErrors.conflict('Assigned copy is not reserved');
					}
				}

				await tx.transaction.update({
					where: {ticket_type: {ticket: existing.ticket, type: 'RESERVE'}},
					data: {status: 'COMPLETED'},
				});

				await tx.transaction.create({
					data: {
						type: 'UNRESERVE',
						status: 'COMPLETED',
						ticket: existing.ticket,
						bookId: existing.bookId,
						memberId: existing.memberId,
						reservationId: req.params.id,
						remarks: [note, reason].filter(Boolean).join('; '),
					},
				});

				return true;
			});

			if (!unreserved) {
				return reply.conflict('Reservation is not pending');
			}

			const reservation = await app.prisma.reservation.findUnique({
				where: {id: req.params.id},
				select: reservationSelect,
			});

			if (!reservation) {
				return reply.notFound();
			}

			return reply.send({ok: true, data: reservation});
		},
	);

	app.post(
		'/:id/claim',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Reservations'],
				headers,
				params,
				body: UpdateReservationInputDefinition.nullish(),
				response: {
					200: SuccessfulHttpResponseDefinition(ReservationDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
					409: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const existing = await app.prisma.reservation.findUnique({
				where: {id: req.params.id},
				select: {
					status: true,
					bookCopyId: true,
					remarks: true,
				},
			});

			if (!existing) {
				return reply.notFound();
			}

			if (existing.status !== 'PENDING' || existing.bookCopyId == null) {
				return reply.conflict('Reservation is not pending or has no assigned copy');
			}

			const copyId = existing.bookCopyId;
			const note = req.body?.remarks?.trim();

			const claimed = await app.prisma.$transaction(async (tx) => {
				const {count} = await tx.reservation.updateMany({
					where: {
						id: req.params.id,
						status: 'PENDING',
						bookCopyId: copyId,
					},
					data: {
						status: 'COMPLETED',
						...(note && {remarks: [existing.remarks, note].filter(Boolean).join('; ')}),
					},
				});

				if (count === 0) {
					return null;
				}

				const copy = await tx.bookCopy.updateMany({
					where: {id: copyId, status: 'RESERVED'},
					data: {status: 'BORROWED'},
				});

				if (copy.count === 0) {
					throw app.httpErrors.conflict('Assigned copy is not reserved');
				}

				const reservation = await tx.reservation.findUniqueOrThrow({
					where: {id: req.params.id},
					select: {
						ticket: true,
						memberId: true,
					},
				});

				await tx.transaction.update({
					where: {ticket_type: {ticket: reservation.ticket, type: 'RESERVE'}},
					data: {status: 'COMPLETED'},
				});

				await tx.transaction.create({
					data: {
						type: 'BORROW',
						status: 'PENDING',
						ticket: reservation.ticket,
						memberId: reservation.memberId,
						bookCopyId: copyId,
						reservationId: req.params.id,
						...(note && {remarks: note}),
					},
				});

				await tx.member.update({
					where: {id: reservation.memberId},
					data: {dateTimeLastBorrowedBook: new Date()},
				});

				return tx.reservation.findUniqueOrThrow({
					where: {id: req.params.id},
					select: reservationSelect,
				});
			});

			if (!claimed) {
				return reply.conflict('Reservation is not pending');
			}

			return reply.send({ok: true, data: claimed});
		},
	);

	app.post(
		'/export',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Reservations'],
				querystring: z.object({
					bookId__eq: QueryString__NumberDefinition,
					bookId__neq: QueryString__NumberDefinition,
					bookId__in: QueryString__NumberArrayDefinition,
					bookId__nin: QueryString__NumberArrayDefinition,
					memberId__eq: QueryString__NumberDefinition,
					memberId__neq: QueryString__NumberDefinition,
					memberId__in: QueryString__NumberArrayDefinition,
					memberId__nin: QueryString__NumberArrayDefinition,
					ticket__eq: QueryString__StringDefinition,
					ticket__neq: QueryString__StringDefinition,
					ticket__in: QueryString__StringArrayDefinition,
					ticket__nin: QueryString__StringArrayDefinition,
					ticket__contains: QueryString__StringDefinition,
					isbn__eq: QueryString__StringDefinition,
					isbn__neq: QueryString__StringDefinition,
					isbn__in: QueryString__StringArrayDefinition,
					isbn__nin: QueryString__StringArrayDefinition,
					isbn__contains: QueryString__StringDefinition,
					status__eq: QueryString__EnumDefinition(ReservationStatusDefinition),
					status__neq: QueryString__EnumDefinition(ReservationStatusDefinition),
					status__in: QueryString__EnumArrayDefinition(ReservationStatusDefinition),
					status__nin: QueryString__EnumArrayDefinition(ReservationStatusDefinition),
					dateTimeCreated__gt: QueryString__DateDefinition,
					dateTimeCreated__gte: QueryString__DateDefinition,
					dateTimeCreated__lt: QueryString__DateDefinition,
					dateTimeCreated__lte: QueryString__DateDefinition,
					dateTimeUpdated__gt: QueryString__DateDefinition,
					dateTimeUpdated__gte: QueryString__DateDefinition,
					dateTimeUpdated__lt: QueryString__DateDefinition,
					dateTimeUpdated__lte: QueryString__DateDefinition,
					sortBy: ReservationSortByInputDefinition.optional().nullable(),
					sortOrder: SortOrderDefinition.optional().nullable(),
				}),
				response: {
					200: {
						description: 'Excel file',
						content: {
							'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
								schema: ExcelWorkbookDefinition,
							},
						},
					},
				},
			},
		},
		async (req, reply) => {
			const query = req.query;
			const where: Prisma.ReservationWhereInput = {};

			if (
				query.bookId__eq != null ||
				query.bookId__neq != null ||
				query.bookId__in != null ||
				query.bookId__nin != null
			) {
				where.bookId = {
					...(query.bookId__eq != null && {equals: query.bookId__eq}),
					...(query.bookId__neq != null && {not: query.bookId__neq}),
					...(query.bookId__in != null && {in: query.bookId__in}),
					...(query.bookId__nin != null && {notIn: query.bookId__nin}),
				};
			}

			if (
				query.memberId__eq != null ||
				query.memberId__neq != null ||
				query.memberId__in != null ||
				query.memberId__nin != null
			) {
				where.memberId = {
					...(query.memberId__eq != null && {equals: query.memberId__eq}),
					...(query.memberId__neq != null && {not: query.memberId__neq}),
					...(query.memberId__in != null && {in: query.memberId__in}),
					...(query.memberId__nin != null && {notIn: query.memberId__nin}),
				};
			}

			if (
				query.status__eq != null ||
				query.status__neq != null ||
				query.status__in != null ||
				query.status__nin != null
			) {
				where.status = {
					...(query.status__eq != null && {equals: query.status__eq}),
					...(query.status__neq != null && {not: query.status__neq}),
					...(query.status__in != null && {in: query.status__in}),
					...(query.status__nin != null && {notIn: query.status__nin}),
				};
			}

			if (
				query.ticket__eq != null ||
				query.ticket__neq != null ||
				query.ticket__in != null ||
				query.ticket__nin != null ||
				query.ticket__contains != null
			) {
				where.ticket = {
					...(query.ticket__eq != null && {equals: query.ticket__eq}),
					...(query.ticket__neq != null && {not: query.ticket__neq}),
					...(query.ticket__in != null && {in: query.ticket__in}),
					...(query.ticket__nin != null && {notIn: query.ticket__nin}),
					...(query.ticket__contains != null && {
						contains: query.ticket__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				query.isbn__eq != null ||
				query.isbn__neq != null ||
				query.isbn__in != null ||
				query.isbn__nin != null ||
				query.isbn__contains != null
			) {
				where.bookCopy = {
					is: {
						isbn: {
							...(query.isbn__eq != null && {equals: query.isbn__eq}),
							...(query.isbn__neq != null && {not: query.isbn__neq}),
							...(query.isbn__in != null && {in: query.isbn__in}),
							...(query.isbn__nin != null && {notIn: query.isbn__nin}),
							...(query.isbn__contains != null && {
								contains: query.isbn__contains,
								mode: 'insensitive',
							}),
						},
					},
				};
			}

			if (
				query.dateTimeCreated__gt != null ||
				query.dateTimeCreated__gte != null ||
				query.dateTimeCreated__lt != null ||
				query.dateTimeCreated__lte != null
			) {
				where.dateTimeCreated = {
					...(query.dateTimeCreated__gt != null && {gt: query.dateTimeCreated__gt}),
					...(query.dateTimeCreated__gte != null && {gte: query.dateTimeCreated__gte}),
					...(query.dateTimeCreated__lt != null && {lt: query.dateTimeCreated__lt}),
					...(query.dateTimeCreated__lte != null && {lte: query.dateTimeCreated__lte}),
				};
			}

			if (
				query.dateTimeUpdated__gt != null ||
				query.dateTimeUpdated__gte != null ||
				query.dateTimeUpdated__lt != null ||
				query.dateTimeUpdated__lte != null
			) {
				where.dateTimeUpdated = {
					...(query.dateTimeUpdated__gt != null && {gt: query.dateTimeUpdated__gt}),
					...(query.dateTimeUpdated__gte != null && {gte: query.dateTimeUpdated__gte}),
					...(query.dateTimeUpdated__lt != null && {lt: query.dateTimeUpdated__lt}),
					...(query.dateTimeUpdated__lte != null && {lte: query.dateTimeUpdated__lte}),
				};
			}

			const rows = await app.prisma.reservation.findMany({
				where,
				select: reservationSelect,
				orderBy:
					req.query.sortBy == null
						? [{dateTimeCreated: 'desc'}, {id: 'desc'}]
						: {[req.query.sortBy]: req.query.sortOrder === 'ASC' ? 'asc' : 'desc'},
			});

			const worksheet = XLSX.utils.json_to_sheet(
				rows.map((reservation) => ({
					id: reservation.id,
					ticket: reservation.ticket,
					status: reservation.status,
					memberId: reservation.member.id,
					externalId: reservation.member.externalId,
					memberName: reservation.member.name,
					bookId: reservation.book.id,
					bookTitle: reservation.book.title,
					bookCopyId: reservation.bookCopy?.id ?? null,
					isbn: reservation.bookCopy?.isbn ?? null,
					remarks: reservation.remarks,
					dateTimeCreated: reservation.dateTimeCreated.toISOString(),
					dateTimeUpdated: reservation.dateTimeUpdated.toISOString(),
				})),
			);

			const workbook = XLSX.utils.book_new();

			XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservations');

			const buffer = XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'}) as Buffer;

			return reply
				.header('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
				.header('content-disposition', `attachment; filename="reservations-${Date.now()}.xlsx"`)
				.send(buffer);
		},
	);
};

export const autoPrefix = '/reservations';
export default plugin;
