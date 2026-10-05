import {
	BookCopyDefinition,
	BookCopySortByInputDefinition,
	BookCopyStatusDefinition,
	BorrowBookCopyDataInputDefinition,
	CreateBookCopyInputDefinition,
	FailedHttpResponseDefinition,
	PaginatedDefinition,
	ReturnBookCopyDataInputDefinition,
	SortOrderDefinition,
	SuccessfulHttpResponseDefinition,
	TransactionDefinition,
	UpdateBookCopyDataInputDefinition,
	VoidSuccessfulHttpResponseDefinition,
} from '@library/types';
import {clamp} from 'es-toolkit';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import {uid} from 'uid';
import * as XLSX from 'xlsx';
import * as z from 'zod';
import type {Prisma} from '../../prisma/.generated/client';
import {clean} from '../helpers/clean';
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

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Book Copies'],
				querystring: z.object({
					page: QueryString__NumberDefinition,
					pageSize: QueryString__NumberDefinition,
					id__eq: QueryString__NumberDefinition,
					id__neq: QueryString__NumberDefinition,
					id__in: QueryString__NumberArrayDefinition,
					id__nin: QueryString__NumberArrayDefinition,
					isbn__eq: QueryString__StringDefinition,
					isbn__neq: QueryString__StringDefinition,
					isbn__in: QueryString__StringArrayDefinition,
					isbn__nin: QueryString__StringArrayDefinition,
					isbn__contains: QueryString__StringDefinition,
					status__eq: QueryString__EnumDefinition(BookCopyStatusDefinition),
					status__neq: QueryString__EnumDefinition(BookCopyStatusDefinition),
					status__in: QueryString__EnumArrayDefinition(BookCopyStatusDefinition),
					status__nin: QueryString__EnumArrayDefinition(BookCopyStatusDefinition),
					bookId__eq: QueryString__NumberDefinition,
					bookId__neq: QueryString__NumberDefinition,
					bookId__in: QueryString__NumberArrayDefinition,
					bookId__nin: QueryString__NumberArrayDefinition,
					dateTimeCreated__gt: QueryString__DateDefinition,
					dateTimeCreated__gte: QueryString__DateDefinition,
					dateTimeCreated__lt: QueryString__DateDefinition,
					dateTimeCreated__lte: QueryString__DateDefinition,
					dateTimeUpdated__gt: QueryString__DateDefinition,
					dateTimeUpdated__gte: QueryString__DateDefinition,
					dateTimeUpdated__lt: QueryString__DateDefinition,
					dateTimeUpdated__lte: QueryString__DateDefinition,
					sortBy: BookCopySortByInputDefinition.optional().nullable(),
					sortOrder: SortOrderDefinition.optional().nullable(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(PaginatedDefinition(BookCopyDefinition)),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const where: Prisma.BookCopyWhereInput = {};

			if (
				req.query.id__eq != null ||
				req.query.id__neq != null ||
				req.query.id__in != null ||
				req.query.id__nin != null
			) {
				where.id = {
					...(req.query.id__eq != null && {equals: req.query.id__eq}),
					...(req.query.id__neq != null && {not: req.query.id__neq}),
					...(req.query.id__in != null && {in: req.query.id__in}),
					...(req.query.id__nin != null && {notIn: req.query.id__nin}),
				};
			}

			if (
				req.query.isbn__eq != null ||
				req.query.isbn__neq != null ||
				req.query.isbn__in != null ||
				req.query.isbn__nin != null ||
				req.query.isbn__contains
			) {
				where.isbn = {
					...(req.query.isbn__eq != null && {equals: req.query.isbn__eq}),
					...(req.query.isbn__neq != null && {not: req.query.isbn__neq}),
					...(req.query.isbn__in != null && {in: req.query.isbn__in}),
					...(req.query.isbn__nin != null && {notIn: req.query.isbn__nin}),
					...(req.query.isbn__contains != null && {
						contains: req.query.isbn__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				req.query.status__eq != null ||
				req.query.status__neq != null ||
				req.query.status__in != null ||
				req.query.status__nin != null
			) {
				where.status = {
					...(req.query.status__eq != null && {equals: req.query.status__eq}),
					...(req.query.status__neq != null && {not: req.query.status__neq}),
					...(req.query.status__in != null && {in: req.query.status__in}),
					...(req.query.status__nin != null && {notIn: req.query.status__nin}),
				};
			}

			if (
				req.query.bookId__eq != null ||
				req.query.bookId__neq != null ||
				req.query.bookId__in != null ||
				req.query.bookId__nin != null
			) {
				where.bookId = {
					...(req.query.bookId__eq != null && {equals: req.query.bookId__eq}),
					...(req.query.bookId__neq != null && {not: req.query.bookId__neq}),
					...(req.query.bookId__in != null && {in: req.query.bookId__in}),
					...(req.query.bookId__nin != null && {notIn: req.query.bookId__nin}),
				};
			}

			if (
				req.query.dateTimeCreated__gt != null ||
				req.query.dateTimeCreated__gte != null ||
				req.query.dateTimeCreated__lt != null ||
				req.query.dateTimeCreated__lte != null
			) {
				where.dateTimeCreated = {
					...(req.query.dateTimeCreated__gt != null && {gt: req.query.dateTimeCreated__gt}),
					...(req.query.dateTimeCreated__gte != null && {gte: req.query.dateTimeCreated__gte}),
					...(req.query.dateTimeCreated__lt != null && {lt: req.query.dateTimeCreated__lt}),
					...(req.query.dateTimeCreated__lte != null && {lte: req.query.dateTimeCreated__lte}),
				};
			}

			if (
				req.query.dateTimeUpdated__gt != null ||
				req.query.dateTimeUpdated__gte != null ||
				req.query.dateTimeUpdated__lt != null ||
				req.query.dateTimeUpdated__lte != null
			) {
				where.dateTimeUpdated = {
					...(req.query.dateTimeUpdated__gt != null && {gt: req.query.dateTimeUpdated__gt}),
					...(req.query.dateTimeUpdated__gte != null && {gte: req.query.dateTimeUpdated__gte}),
					...(req.query.dateTimeUpdated__lt != null && {lt: req.query.dateTimeUpdated__lt}),
					...(req.query.dateTimeUpdated__lte != null && {lte: req.query.dateTimeUpdated__lte}),
				};
			}

			const page = req.query.page ?? 1;
			const take = clamp(req.query.pageSize ?? 10, 10, 100);
			const skip = take * (page - 1);

			const [total, rows] = await app.prisma.$transaction([
				app.prisma.bookCopy.count({where}),
				app.prisma.bookCopy.findMany({
					skip,
					take,
					where,
					select: {
						id: true,
						isbn: true,
						status: true,
						dateTimeCreated: true,
						dateTimeUpdated: true,
						book: {
							select: {
								id: true,
								title: true,
								genre: true,
								author: true,
								yearPublished: true,
							},
						},
					},
					orderBy: {
						dateTimeCreated: 'desc',
					},
					...(req.query.sortBy != null && {
						orderBy: {
							...(req.query.sortBy === 'dateTimeCreated' && {
								dateTimeCreated: req.query.sortOrder === 'ASC' ? 'asc' : 'desc',
							}),
							...(req.query.sortBy === 'dateTimeUpdated' && {
								dateTimeUpdated: req.query.sortOrder === 'ASC' ? 'asc' : 'desc',
							}),
						},
					}),
				}),
			]);

			const hasNext = page < Math.ceil(total / take);
			const hasPrevious = page > 1;
			const next = hasNext ? page + 1 : null;
			const previous = page > 1 ? page - 1 : null;

			return reply.send({
				ok: true,
				data: {
					rows: rows.map((bookCopy) => ({
						id: bookCopy.id,
						isbn: bookCopy.isbn,
						book: {
							id: bookCopy.book.id,
							title: bookCopy.book.title,
							genre: bookCopy.book.genre,
							author: bookCopy.book.author,
							yearPublished: bookCopy.book.yearPublished,
						},
						status: bookCopy.status,
						dateTimeCreated: bookCopy.dateTimeCreated,
						dateTimeUpdated: bookCopy.dateTimeUpdated,
					})),
					next,
					hasNext,
					previous,
					hasPrevious,
					total,
				},
			});
		},
	);

	app.get(
		'/:id',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Book Copies'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(BookCopyDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const bookCopy = await app.prisma.bookCopy.findUnique({
				where: {id: req.params.id},
				select: {
					id: true,
					isbn: true,
					status: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
					book: {
						select: {
							id: true,
							title: true,
							genre: true,
							author: true,
							yearPublished: true,
						},
					},
				},
			});

			if (!bookCopy) return reply.notFound();

			return reply.send({
				ok: true,
				data: {
					id: bookCopy.id,
					isbn: bookCopy.isbn,
					book: {
						id: bookCopy.book.id,
						title: bookCopy.book.title,
						genre: bookCopy.book.genre,
						author: bookCopy.book.author,
						yearPublished: bookCopy.book.yearPublished,
					},
					status: bookCopy.status,
					dateTimeCreated: bookCopy.dateTimeCreated,
					dateTimeUpdated: bookCopy.dateTimeUpdated,
				},
			});
		},
	);

	app.post(
		'/',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Book Copies'],
				body: CreateBookCopyInputDefinition,
				response: {
					201: SuccessfulHttpResponseDefinition(BookCopyDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					409: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			if (await app.prisma.bookCopy.exists({isbn: req.body.isbn})) {
				return reply.conflict('ISBN already exists');
			}

			if (!(await app.prisma.book.exists({id: req.body.bookId}))) {
				return reply.badRequest('Book not found');
			}

			const bookCopy = await app.prisma.bookCopy.create({
				data: {
					isbn: req.body.isbn,
					bookId: req.body.bookId,
				},
				select: {
					id: true,
					isbn: true,
					status: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
					book: {
						select: {
							id: true,
							title: true,
							genre: true,
							author: true,
							yearPublished: true,
						},
					},
				},
			});

			return reply.code(201).send({
				ok: true,
				data: {
					id: bookCopy.id,
					isbn: bookCopy.isbn,
					book: {
						id: bookCopy.book.id,
						title: bookCopy.book.title,
						genre: bookCopy.book.genre,
						author: bookCopy.book.author,
						yearPublished: bookCopy.book.yearPublished,
					},
					status: bookCopy.status,
					dateTimeCreated: bookCopy.dateTimeCreated,
					dateTimeUpdated: bookCopy.dateTimeUpdated,
				},
			});
		},
	);

	app.patch(
		'/:id',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Book Copies'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				body: UpdateBookCopyDataInputDefinition,
				response: {
					200: SuccessfulHttpResponseDefinition(BookCopyDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
					409: FailedHttpResponseDefinition,
					500: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			if (!(await app.prisma.bookCopy.exists({id: req.params.id}))) {
				return reply.notFound();
			}

			const data = clean(req.body);

			if (data.bookId != null && !(await app.prisma.book.exists({id: data.bookId}))) {
				return reply.badRequest('Book not found');
			}

			if (
				data.isbn != null &&
				(await app.prisma.bookCopy.exists({isbn: data.isbn, id: {not: req.params.id}}))
			) {
				return reply.conflict('ISBN already exists');
			}

			const bookCopy = await app.prisma.bookCopy.update({
				where: {id: req.params.id},
				data,
				select: {
					id: true,
					isbn: true,
					status: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
					book: {
						select: {
							id: true,
							title: true,
							genre: true,
							author: true,
							yearPublished: true,
						},
					},
				},
			});

			return reply.send({
				ok: true,
				data: {
					id: bookCopy.id,
					isbn: bookCopy.isbn,
					book: {
						id: bookCopy.book.id,
						title: bookCopy.book.title,
						genre: bookCopy.book.genre,
						author: bookCopy.book.author,
						yearPublished: bookCopy.book.yearPublished,
					},
					status: bookCopy.status,
					dateTimeCreated: bookCopy.dateTimeCreated,
					dateTimeUpdated: bookCopy.dateTimeUpdated,
				},
			});
		},
	);

	app.delete(
		'/:id',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Book Copies'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				response: {
					200: VoidSuccessfulHttpResponseDefinition,
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			await app.prisma.bookCopy.deleteMany({where: {id: req.params.id}});

			return reply.send({ok: true});
		},
	);

	app.post(
		'/:id/borrow',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Book Copies'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				body: BorrowBookCopyDataInputDefinition,
				response: {
					200: SuccessfulHttpResponseDefinition(
						z.object({
							bookCopy: BookCopyDefinition,
							transaction: TransactionDefinition,
						}),
					),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
					409: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			const [existing, memberCount] = await app.prisma.$transaction([
				app.prisma.bookCopy.findUnique({
					where: {id: req.params.id},
					select: {status: true},
				}),
				app.prisma.member.count({where: {id: req.body.memberId}}),
			]);

			if (!existing) {
				return reply.notFound();
			}

			if (existing.status !== 'AVAILABLE') {
				return reply.conflict('Book copy is not available');
			}

			if (memberCount <= 0) {
				return reply.badRequest('Member not found');
			}

			const [bookCopy, transaction] = await app.prisma.$transaction(async (tx) => {
				const {count} = await tx.bookCopy.updateMany({
					where: {id: req.params.id, status: 'AVAILABLE'},
					data: {status: 'BORROWED'},
				});

				if (count === 0) return [null, null] as const;

				const date = new Date();
				const ticketSegment0 = req.account.id.toString().padStart(4, '0');
				const ticketSegment1 = uid(4).toUpperCase();
				const ticketSegment2 =
					(date.getMonth() + 1).toString().padStart(2, '0') +
					date.getDate().toString().padStart(2, '0') +
					date.getFullYear();
				const ticket = `${ticketSegment0}-${ticketSegment1}-${ticketSegment2}`;

				const transaction = await tx.transaction.create({
					data: {
						type: 'BORROW',
						status: 'PENDING',
						ticket,
						remarks: req.body.remarks,
						bookCopyId: req.params.id,
						memberId: req.body.memberId,
						dateTimeCreated: date,
						dateTimeUpdated: date,
					},
					select: {
						id: true,
						type: true,
						status: true,
						ticket: true,
						remarks: true,
						member: {
							select: {
								id: true,
								externalId: true,
								name: true,
								course: true,
								yearAndSection: true,
							},
						},
						bookCopy: {
							select: {
								id: true,
								isbn: true,
								status: true,
								book: {
									select: {
										id: true,
										title: true,
										genre: true,
										author: true,
										yearPublished: true,
									},
								},
							},
						},
						dateTimeCreated: true,
						dateTimeUpdated: true,
					},
				});

				await tx.member.update({
					where: {id: req.body.memberId},
					data: {dateTimeLastBorrowedBook: date},
				});

				const bookCopy = await tx.bookCopy.findUnique({
					where: {id: req.params.id},
					select: {
						id: true,
						isbn: true,
						status: true,
						dateTimeCreated: true,
						dateTimeUpdated: true,
						book: {
							select: {
								id: true,
								title: true,
								genre: true,
								author: true,
								yearPublished: true,
							},
						},
					},
				});

				return [bookCopy, transaction] as const;
			});

			if (!bookCopy || !transaction) {
				return reply.conflict('Book copy is not available');
			}

			return reply.send({
				ok: true,
				data: {
					bookCopy: {
						id: bookCopy.id,
						isbn: bookCopy.isbn,
						book: {
							id: bookCopy.book.id,
							title: bookCopy.book.title,
							genre: bookCopy.book.genre,
							author: bookCopy.book.author,
							yearPublished: bookCopy.book.yearPublished,
						},
						status: bookCopy.status,
						dateTimeCreated: bookCopy.dateTimeCreated,
						dateTimeUpdated: bookCopy.dateTimeUpdated,
					},
					transaction: {
						id: transaction.id,
						type: transaction.type,
						status: transaction.status,
						ticket: transaction.ticket,
						remarks: transaction.remarks,
						member: {
							id: transaction.member.id,
							externalId: transaction.member.externalId,
							name: transaction.member.name,
							course: transaction.member.course,
							yearAndSection: transaction.member.yearAndSection,
						},
						bookCopy: {
							id: transaction.bookCopy.id,
							isbn: transaction.bookCopy.isbn,
							book: {
								id: transaction.bookCopy.book.id,
								title: transaction.bookCopy.book.title,
								genre: transaction.bookCopy.book.genre,
								author: transaction.bookCopy.book.author,
								yearPublished: transaction.bookCopy.book.yearPublished,
							},
							status: transaction.bookCopy.status,
						},
						dateTimeCreated: transaction.dateTimeCreated,
						dateTimeUpdated: transaction.dateTimeUpdated,
					},
				},
			});
		},
	);

	app.post(
		'/:id/return',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Book Copies'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				body: ReturnBookCopyDataInputDefinition,
				response: {
					200: SuccessfulHttpResponseDefinition(
						z.object({
							bookCopy: BookCopyDefinition,
							transaction: TransactionDefinition,
						}),
					),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
					409: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			const existing = await app.prisma.bookCopy.findUnique({
				where: {id: req.params.id},
				select: {
					status: true,
					transactions: {
						where: {type: 'BORROW', status: 'PENDING'},
						orderBy: {dateTimeCreated: 'desc'},
						take: 1,
						select: {
							id: true,
							ticket: true,
							memberId: true,
						},
					},
				},
			});

			if (!existing) {
				return reply.notFound();
			}

			if (existing.status !== 'BORROWED') {
				return reply.conflict('Book copy is not borrowed');
			}

			const borrow = existing.transactions.at(0);

			if (!borrow) {
				return reply.conflict('Book copy is not borrowed');
			}

			const [bookCopy, transaction] = await app.prisma.$transaction(async (tx) => {
				const {count} = await tx.bookCopy.updateMany({
					where: {id: req.params.id, status: 'BORROWED'},
					data: {status: 'AVAILABLE'},
				});

				if (count === 0) return [null, null] as const;

				const transaction = await tx.transaction.create({
					data: {
						type: 'RETURN',
						status: 'COMPLETED',
						ticket: borrow.ticket,
						remarks: req.body?.remarks,
						bookCopyId: req.params.id,
						memberId: borrow.memberId,
					},
					select: {
						id: true,
						type: true,
						status: true,
						ticket: true,
						remarks: true,
						member: {
							select: {
								id: true,
								externalId: true,
								name: true,
								course: true,
								yearAndSection: true,
							},
						},
						bookCopy: {
							select: {
								id: true,
								isbn: true,
								status: true,
								book: {
									select: {
										id: true,
										title: true,
										genre: true,
										author: true,
										yearPublished: true,
									},
								},
							},
						},
						dateTimeCreated: true,
						dateTimeUpdated: true,
					},
				});

				await tx.transaction.update({
					where: {id: borrow.id},
					data: {status: 'COMPLETED'},
				});

				const bookCopy = await tx.bookCopy.findUnique({
					where: {id: req.params.id},
					select: {
						id: true,
						isbn: true,
						status: true,
						dateTimeCreated: true,
						dateTimeUpdated: true,
						book: {
							select: {
								id: true,
								title: true,
								genre: true,
								author: true,
								yearPublished: true,
							},
						},
					},
				});

				return [bookCopy, transaction] as const;
			});

			if (!bookCopy || !transaction) {
				return reply.conflict('Book copy is not borrowed');
			}

			return reply.send({
				ok: true,
				data: {
					bookCopy: {
						id: bookCopy.id,
						isbn: bookCopy.isbn,
						book: {
							id: bookCopy.book.id,
							title: bookCopy.book.title,
							genre: bookCopy.book.genre,
							author: bookCopy.book.author,
							yearPublished: bookCopy.book.yearPublished,
						},
						status: bookCopy.status,
						dateTimeCreated: bookCopy.dateTimeCreated,
						dateTimeUpdated: bookCopy.dateTimeUpdated,
					},
					transaction: {
						id: transaction.id,
						type: transaction.type,
						status: transaction.status,
						ticket: transaction.ticket,
						remarks: transaction.remarks,
						member: {
							id: transaction.member.id,
							externalId: transaction.member.externalId,
							name: transaction.member.name,
							course: transaction.member.course,
							yearAndSection: transaction.member.yearAndSection,
						},
						bookCopy: {
							id: transaction.bookCopy.id,
							isbn: transaction.bookCopy.isbn,
							book: {
								id: transaction.bookCopy.book.id,
								title: transaction.bookCopy.book.title,
								genre: transaction.bookCopy.book.genre,
								author: transaction.bookCopy.book.author,
								yearPublished: transaction.bookCopy.book.yearPublished,
							},
							status: transaction.bookCopy.status,
						},
						dateTimeCreated: transaction.dateTimeCreated,
						dateTimeUpdated: transaction.dateTimeUpdated,
					},
				},
			});
		},
	);

	app.post(
		'/export',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Book Copies'],
				querystring: z.object({
					id__eq: QueryString__NumberDefinition,
					id__neq: QueryString__NumberDefinition,
					id__in: QueryString__NumberArrayDefinition,
					id__nin: QueryString__NumberArrayDefinition,
					isbn__eq: QueryString__StringDefinition,
					isbn__neq: QueryString__StringDefinition,
					isbn__in: QueryString__StringArrayDefinition,
					isbn__nin: QueryString__StringArrayDefinition,
					isbn__contains: QueryString__StringDefinition,
					status__eq: QueryString__EnumDefinition(BookCopyStatusDefinition),
					status__neq: QueryString__EnumDefinition(BookCopyStatusDefinition),
					status__in: QueryString__EnumArrayDefinition(BookCopyStatusDefinition),
					status__nin: QueryString__EnumArrayDefinition(BookCopyStatusDefinition),
					bookId__eq: QueryString__NumberDefinition,
					bookId__neq: QueryString__NumberDefinition,
					bookId__in: QueryString__NumberArrayDefinition,
					bookId__nin: QueryString__NumberArrayDefinition,
					dateTimeCreated__gt: QueryString__DateDefinition,
					dateTimeCreated__gte: QueryString__DateDefinition,
					dateTimeCreated__lt: QueryString__DateDefinition,
					dateTimeCreated__lte: QueryString__DateDefinition,
					dateTimeUpdated__gt: QueryString__DateDefinition,
					dateTimeUpdated__gte: QueryString__DateDefinition,
					dateTimeUpdated__lt: QueryString__DateDefinition,
					dateTimeUpdated__lte: QueryString__DateDefinition,
					sortBy: BookCopySortByInputDefinition.optional().nullable(),
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
			const where: Prisma.BookCopyWhereInput = {};

			if (
				req.query.id__eq != null ||
				req.query.id__neq != null ||
				req.query.id__in != null ||
				req.query.id__nin != null
			) {
				where.id = {
					...(req.query.id__eq != null && {equals: req.query.id__eq}),
					...(req.query.id__neq != null && {not: req.query.id__neq}),
					...(req.query.id__in != null && {in: req.query.id__in}),
					...(req.query.id__nin != null && {notIn: req.query.id__nin}),
				};
			}

			if (
				req.query.isbn__eq != null ||
				req.query.isbn__neq != null ||
				req.query.isbn__in != null ||
				req.query.isbn__nin != null ||
				req.query.isbn__contains
			) {
				where.isbn = {
					...(req.query.isbn__eq != null && {equals: req.query.isbn__eq}),
					...(req.query.isbn__neq != null && {not: req.query.isbn__neq}),
					...(req.query.isbn__in != null && {in: req.query.isbn__in}),
					...(req.query.isbn__nin != null && {notIn: req.query.isbn__nin}),
					...(req.query.isbn__contains != null && {
						contains: req.query.isbn__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				req.query.status__eq != null ||
				req.query.status__neq != null ||
				req.query.status__in != null ||
				req.query.status__nin != null
			) {
				where.status = {
					...(req.query.status__eq != null && {equals: req.query.status__eq}),
					...(req.query.status__neq != null && {not: req.query.status__neq}),
					...(req.query.status__in != null && {in: req.query.status__in}),
					...(req.query.status__nin != null && {notIn: req.query.status__nin}),
				};
			}

			if (
				req.query.bookId__eq != null ||
				req.query.bookId__neq != null ||
				req.query.bookId__in != null ||
				req.query.bookId__nin != null
			) {
				where.bookId = {
					...(req.query.bookId__eq != null && {equals: req.query.bookId__eq}),
					...(req.query.bookId__neq != null && {not: req.query.bookId__neq}),
					...(req.query.bookId__in != null && {in: req.query.bookId__in}),
					...(req.query.bookId__nin != null && {notIn: req.query.bookId__nin}),
				};
			}

			if (
				req.query.dateTimeCreated__gt != null ||
				req.query.dateTimeCreated__gte != null ||
				req.query.dateTimeCreated__lt != null ||
				req.query.dateTimeCreated__lte != null
			) {
				where.dateTimeCreated = {
					...(req.query.dateTimeCreated__gt != null && {gt: req.query.dateTimeCreated__gt}),
					...(req.query.dateTimeCreated__gte != null && {gte: req.query.dateTimeCreated__gte}),
					...(req.query.dateTimeCreated__lt != null && {lt: req.query.dateTimeCreated__lt}),
					...(req.query.dateTimeCreated__lte != null && {lte: req.query.dateTimeCreated__lte}),
				};
			}

			if (
				req.query.dateTimeUpdated__gt != null ||
				req.query.dateTimeUpdated__gte != null ||
				req.query.dateTimeUpdated__lt != null ||
				req.query.dateTimeUpdated__lte != null
			) {
				where.dateTimeUpdated = {
					...(req.query.dateTimeUpdated__gt != null && {gt: req.query.dateTimeUpdated__gt}),
					...(req.query.dateTimeUpdated__gte != null && {gte: req.query.dateTimeUpdated__gte}),
					...(req.query.dateTimeUpdated__lt != null && {lt: req.query.dateTimeUpdated__lt}),
					...(req.query.dateTimeUpdated__lte != null && {lte: req.query.dateTimeUpdated__lte}),
				};
			}

			const rows = await app.prisma.bookCopy.findMany({
				where,
				select: {
					id: true,
					isbn: true,
					status: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
					book: {
						select: {
							id: true,
							title: true,
							genre: true,
							author: true,
							yearPublished: true,
						},
					},
				},
				orderBy: {
					dateTimeCreated: 'desc',
				},
				...(req.query.sortBy != null && {
					orderBy: {
						...(req.query.sortBy === 'dateTimeCreated' && {
							dateTimeCreated: req.query.sortOrder === 'ASC' ? 'asc' : 'desc',
						}),
						...(req.query.sortBy === 'dateTimeUpdated' && {
							dateTimeUpdated: req.query.sortOrder === 'ASC' ? 'asc' : 'desc',
						}),
					},
				}),
			});

			const worksheet = XLSX.utils.json_to_sheet(
				rows.map((bookCopy) => ({
					id: bookCopy.id,
					isbn: bookCopy.isbn,
					bookId: bookCopy.book.id,
					title: bookCopy.book.title,
					author: bookCopy.book.author,
					genre: bookCopy.book.genre,
					yearPublished: bookCopy.book.yearPublished,
					status: bookCopy.status,
					dateTimeCreated: bookCopy.dateTimeCreated.toISOString(),
					dateTimeUpdated: bookCopy.dateTimeUpdated.toISOString(),
				})),
			);

			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Book Copies');

			const buffer = XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'}) as Buffer;

			return reply
				.header('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
				.header('content-disposition', `attachment; filename="book-copies-${Date.now()}.xlsx"`)
				.send(buffer);
		},
	);
};

export const autoPrefix = '/book-copies';
export default plugin;
