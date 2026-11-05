import {
	BookDefinition,
	BookGenreDefinition,
	BookSortByInputDefinition,
	CreateBookInputDefinition,
	FailedHttpResponseDefinition,
	PaginatedDefinition,
	SortOrderDefinition,
	SuccessfulHttpResponseDefinition,
	UpdateBookDataInputDefinition,
	VoidSuccessfulHttpResponseDefinition,
} from '@library/types';
import {clamp} from 'es-toolkit';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import * as XLSX from 'xlsx';
import * as z from 'zod';
import type {Prisma} from '../../prisma/.generated/client';
import {clean} from '../helpers/clean';
import {loadExportRows, runExport} from '../helpers/export';
import {
	ExcelWorkbookDefinition,
	QueryString__BooleanDefinition,
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
				tags: ['Books'],
				querystring: z.object({
					page: QueryString__NumberDefinition,
					pageSize: QueryString__NumberDefinition,
					id__eq: QueryString__NumberDefinition,
					id__neq: QueryString__NumberDefinition,
					id__in: QueryString__NumberArrayDefinition,
					id__nin: QueryString__NumberArrayDefinition,
					title__eq: QueryString__StringDefinition,
					title__neq: QueryString__StringDefinition,
					title__in: QueryString__StringArrayDefinition,
					title__nin: QueryString__StringArrayDefinition,
					title__contains: QueryString__StringDefinition,
					author__eq: QueryString__StringDefinition,
					author__neq: QueryString__StringDefinition,
					author__in: QueryString__StringArrayDefinition,
					author__nin: QueryString__StringArrayDefinition,
					author__contains: QueryString__StringDefinition,
					genre__eq: QueryString__EnumDefinition(BookGenreDefinition),
					genre__neq: QueryString__EnumDefinition(BookGenreDefinition),
					genre__in: QueryString__EnumArrayDefinition(BookGenreDefinition),
					genre__nin: QueryString__EnumArrayDefinition(BookGenreDefinition),
					yearPublished__eq: QueryString__NumberDefinition,
					yearPublished__neq: QueryString__NumberDefinition,
					yearPublished__in: QueryString__NumberArrayDefinition,
					yearPublished__nin: QueryString__NumberArrayDefinition,
					dateTimeCreated__gt: QueryString__DateDefinition,
					dateTimeCreated__gte: QueryString__DateDefinition,
					dateTimeCreated__lt: QueryString__DateDefinition,
					dateTimeCreated__lte: QueryString__DateDefinition,
					dateTimeUpdated__gt: QueryString__DateDefinition,
					dateTimeUpdated__gte: QueryString__DateDefinition,
					dateTimeUpdated__lt: QueryString__DateDefinition,
					dateTimeUpdated__lte: QueryString__DateDefinition,
					available__eq: QueryString__BooleanDefinition,
					available__neq: QueryString__BooleanDefinition,
					sortBy: BookSortByInputDefinition.optional().nullable(),
					sortOrder: SortOrderDefinition.optional().nullable(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(PaginatedDefinition(BookDefinition)),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					500: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const where: Prisma.BookWhereInput = {};

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
				req.query.title__eq != null ||
				req.query.title__neq != null ||
				req.query.title__in != null ||
				req.query.title__nin != null ||
				req.query.title__contains
			) {
				where.title = {
					...(req.query.title__eq != null && {equals: req.query.title__eq}),
					...(req.query.title__neq != null && {not: req.query.title__neq}),
					...(req.query.title__in != null && {in: req.query.title__in}),
					...(req.query.title__nin != null && {notIn: req.query.title__nin}),
					...(req.query.title__contains != null && {
						contains: req.query.title__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				req.query.author__eq != null ||
				req.query.author__neq != null ||
				req.query.author__in != null ||
				req.query.author__nin != null ||
				req.query.author__contains
			) {
				where.author = {
					...(req.query.author__eq != null && {equals: req.query.author__eq}),
					...(req.query.author__neq != null && {not: req.query.author__neq}),
					...(req.query.author__in != null && {in: req.query.author__in}),
					...(req.query.author__nin != null && {notIn: req.query.author__nin}),
					...(req.query.author__contains != null && {
						contains: req.query.author__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				req.query.genre__eq != null ||
				req.query.genre__neq != null ||
				req.query.genre__in != null ||
				req.query.genre__nin != null
			) {
				where.genre = {
					...(req.query.genre__eq != null && {equals: req.query.genre__eq}),
					...(req.query.genre__neq != null && {not: req.query.genre__neq}),
					...(req.query.genre__in != null && {in: req.query.genre__in}),
					...(req.query.genre__nin != null && {notIn: req.query.genre__nin}),
				};
			}

			if (req.query.available__eq != null || req.query.available__neq != null) {
				where.copies = {
					...(req.query.available__eq === true && {some: {status: 'AVAILABLE'}}),
					...(req.query.available__eq === false && {none: {status: 'AVAILABLE'}}),
					...(req.query.available__neq === true && {none: {status: 'AVAILABLE'}}),
					...(req.query.available__neq === false && {some: {status: 'AVAILABLE'}}),
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

			if (
				req.query.yearPublished__eq != null ||
				req.query.yearPublished__neq != null ||
				req.query.yearPublished__in != null ||
				req.query.yearPublished__nin != null
			) {
				where.yearPublished = {
					...(req.query.yearPublished__eq != null && {equals: req.query.yearPublished__eq}),
					...(req.query.yearPublished__neq != null && {not: req.query.yearPublished__neq}),
					...(req.query.yearPublished__in != null && {in: req.query.yearPublished__in}),
					...(req.query.yearPublished__nin != null && {notIn: req.query.yearPublished__nin}),
				};
			}

			const page = req.query.page ?? 1;
			const take = clamp(req.query.pageSize ?? 10, 10, 100);
			const skip = take * (page - 1);

			const [total, rows] = await app.prisma.$transaction([
				app.prisma.book.count({where}),
				app.prisma.book.findMany({
					skip,
					take,
					where,
					select: {
						id: true,
						title: true,
						author: true,
						genre: true,
						yearPublished: true,
						dateTimeCreated: true,
						dateTimeUpdated: true,
						_count: {
							select: {
								copies: true,
							},
						},
						copies: {
							where: {status: 'AVAILABLE'},
							select: {id: true},
							take: 1,
						},
					},
					orderBy:
						req.query.sortBy == null
							? [{dateTimeCreated: 'desc'}, {id: 'desc'}]
							: {
									[req.query.sortBy]: req.query.sortOrder === 'ASC' ? 'asc' : 'desc',
								},
				}),
			]);

			const hasNext = page < Math.ceil(total / take);
			const hasPrevious = page > 1;
			const next = hasNext ? page + 1 : null;
			const previous = page > 1 ? page - 1 : null;

			return reply.send({
				ok: true,
				data: {
					rows: rows.map((row) => ({
						id: row.id,
						title: row.title,
						author: row.author,
						genre: row.genre,
						yearPublished: row.yearPublished,
						dateTimeCreated: row.dateTimeCreated,
						dateTimeUpdated: row.dateTimeUpdated,
						totalCopies: row._count.copies,
						available: row.copies.length > 0,
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
				tags: ['Books'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(BookDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
					500: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const book = await app.prisma.book.findUnique({
				where: {id: req.params.id},
				select: {
					id: true,
					title: true,
					author: true,
					genre: true,
					yearPublished: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
					_count: {
						select: {
							copies: true,
						},
					},
					copies: {
						where: {status: 'AVAILABLE'},
						select: {id: true},
						take: 1,
					},
				},
			});

			if (!book) return reply.notFound();

			return reply.send({
				ok: true,
				data: {
					id: book.id,
					title: book.title,
					author: book.author,
					genre: book.genre,
					yearPublished: book.yearPublished,
					dateTimeCreated: book.dateTimeCreated,
					dateTimeUpdated: book.dateTimeUpdated,
					totalCopies: book._count.copies,
					available: book.copies.length > 0,
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
				tags: ['Books'],
				body: CreateBookInputDefinition,
				response: {
					201: SuccessfulHttpResponseDefinition(BookDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					500: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			const book = await app.prisma.book.create({
				data: {
					title: req.body.title,
					author: req.body.author,
					genre: req.body.genre,
					yearPublished: req.body.yearPublished,
				},
			});

			return reply.code(201).send({
				ok: true,
				data: {
					id: book.id,
					title: book.title,
					author: book.author,
					genre: book.genre,
					yearPublished: book.yearPublished,
					dateTimeCreated: book.dateTimeCreated,
					dateTimeUpdated: book.dateTimeUpdated,
					totalCopies: 0,
					available: false,
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
				tags: ['Books'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				body: UpdateBookDataInputDefinition,
				response: {
					200: SuccessfulHttpResponseDefinition(BookDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
					500: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			if (!(await app.prisma.book.exists({id: req.params.id}))) {
				return reply.notFound();
			}

			const data = clean(req.body);
			const book = await app.prisma.book.update({
				where: {id: req.params.id},
				data,
				select: {
					id: true,
					title: true,
					author: true,
					genre: true,
					yearPublished: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
					_count: {
						select: {
							copies: true,
						},
					},
					copies: {
						where: {status: 'AVAILABLE'},
						select: {id: true},
						take: 1,
					},
				},
			});

			return reply.send({
				ok: true,
				data: {
					id: book.id,
					title: book.title,
					author: book.author,
					genre: book.genre,
					yearPublished: book.yearPublished,
					dateTimeCreated: book.dateTimeCreated,
					dateTimeUpdated: book.dateTimeUpdated,
					totalCopies: book._count.copies,
					available: book.copies.length > 0,
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
				tags: ['Books'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				response: {
					200: VoidSuccessfulHttpResponseDefinition,
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					500: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			await app.prisma.book.deleteMany({where: {id: req.params.id}});

			return reply.send({ok: true});
		},
	);

	app.post(
		'/export',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth, app.verifyExport],
			schema: {
				tags: ['Books'],
				querystring: z.object({
					id__eq: QueryString__NumberDefinition,
					id__neq: QueryString__NumberDefinition,
					id__in: QueryString__NumberArrayDefinition,
					id__nin: QueryString__NumberArrayDefinition,
					title__eq: QueryString__StringDefinition,
					title__neq: QueryString__StringDefinition,
					title__in: QueryString__StringArrayDefinition,
					title__nin: QueryString__StringArrayDefinition,
					title__contains: QueryString__StringDefinition,
					author__eq: QueryString__StringDefinition,
					author__neq: QueryString__StringDefinition,
					author__in: QueryString__StringArrayDefinition,
					author__nin: QueryString__StringArrayDefinition,
					author__contains: QueryString__StringDefinition,
					genre__eq: QueryString__EnumDefinition(BookGenreDefinition),
					genre__neq: QueryString__EnumDefinition(BookGenreDefinition),
					genre__in: QueryString__EnumArrayDefinition(BookGenreDefinition),
					genre__nin: QueryString__EnumArrayDefinition(BookGenreDefinition),
					yearPublished__eq: QueryString__NumberDefinition,
					yearPublished__neq: QueryString__NumberDefinition,
					yearPublished__in: QueryString__NumberArrayDefinition,
					yearPublished__nin: QueryString__NumberArrayDefinition,
					dateTimeCreated__gt: QueryString__DateDefinition,
					dateTimeCreated__gte: QueryString__DateDefinition,
					dateTimeCreated__lt: QueryString__DateDefinition,
					dateTimeCreated__lte: QueryString__DateDefinition,
					dateTimeUpdated__gt: QueryString__DateDefinition,
					dateTimeUpdated__gte: QueryString__DateDefinition,
					dateTimeUpdated__lt: QueryString__DateDefinition,
					dateTimeUpdated__lte: QueryString__DateDefinition,
					available__eq: QueryString__BooleanDefinition,
					available__neq: QueryString__BooleanDefinition,
					sortBy: BookSortByInputDefinition.optional().nullable(),
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
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					500: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) =>
			runExport(app, async () => {
				const where: Prisma.BookWhereInput = {};

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
					req.query.title__eq != null ||
					req.query.title__neq != null ||
					req.query.title__in != null ||
					req.query.title__nin != null ||
					req.query.title__contains
				) {
					where.title = {
						...(req.query.title__eq != null && {equals: req.query.title__eq}),
						...(req.query.title__neq != null && {not: req.query.title__neq}),
						...(req.query.title__in != null && {in: req.query.title__in}),
						...(req.query.title__nin != null && {notIn: req.query.title__nin}),
						...(req.query.title__contains != null && {
							contains: req.query.title__contains,
							mode: 'insensitive',
						}),
					};
				}

				if (
					req.query.author__eq != null ||
					req.query.author__neq != null ||
					req.query.author__in != null ||
					req.query.author__nin != null ||
					req.query.author__contains
				) {
					where.author = {
						...(req.query.author__eq != null && {equals: req.query.author__eq}),
						...(req.query.author__neq != null && {not: req.query.author__neq}),
						...(req.query.author__in != null && {in: req.query.author__in}),
						...(req.query.author__nin != null && {notIn: req.query.author__nin}),
						...(req.query.author__contains != null && {
							contains: req.query.author__contains,
							mode: 'insensitive',
						}),
					};
				}

				if (
					req.query.genre__eq != null ||
					req.query.genre__neq != null ||
					req.query.genre__in != null ||
					req.query.genre__nin != null
				) {
					where.genre = {
						...(req.query.genre__eq != null && {equals: req.query.genre__eq}),
						...(req.query.genre__neq != null && {not: req.query.genre__neq}),
						...(req.query.genre__in != null && {in: req.query.genre__in}),
						...(req.query.genre__nin != null && {notIn: req.query.genre__nin}),
					};
				}

				if (req.query.available__eq != null || req.query.available__neq != null) {
					where.copies = {
						...(req.query.available__eq === true && {some: {status: 'AVAILABLE'}}),
						...(req.query.available__eq === false && {none: {status: 'AVAILABLE'}}),
						...(req.query.available__neq === true && {none: {status: 'AVAILABLE'}}),
						...(req.query.available__neq === false && {some: {status: 'AVAILABLE'}}),
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

				if (
					req.query.yearPublished__eq != null ||
					req.query.yearPublished__neq != null ||
					req.query.yearPublished__in != null ||
					req.query.yearPublished__nin != null
				) {
					where.yearPublished = {
						...(req.query.yearPublished__eq != null && {equals: req.query.yearPublished__eq}),
						...(req.query.yearPublished__neq != null && {not: req.query.yearPublished__neq}),
						...(req.query.yearPublished__in != null && {in: req.query.yearPublished__in}),
						...(req.query.yearPublished__nin != null && {notIn: req.query.yearPublished__nin}),
					};
				}

				const rows = await loadExportRows(app, (take, skip) =>
					app.prisma.book.findMany({
						take,
						skip,
						where,
						select: {
							id: true,
							title: true,
							author: true,
							genre: true,
							yearPublished: true,
							dateTimeCreated: true,
							dateTimeUpdated: true,
							_count: {
								select: {
									copies: true,
								},
							},
							copies: {
								where: {status: 'AVAILABLE'},
								select: {id: true},
								take: 1,
							},
						},
						orderBy:
							req.query.sortBy == null
								? [{dateTimeCreated: 'desc'}, {id: 'desc'}]
								: [
										{[req.query.sortBy]: req.query.sortOrder === 'ASC' ? 'asc' : 'desc'},
										{id: 'desc'},
									],
					}),
				);

				const worksheet = XLSX.utils.json_to_sheet(
					rows.map((row) => ({
						id: row.id,
						title: row.title,
						author: row.author,
						genre: row.genre,
						yearPublished: row.yearPublished,
						totalCopies: row._count.copies,
						available: row.copies.length > 0,
						dateTimeCreated: row.dateTimeCreated.toISOString(),
						dateTimeUpdated: row.dateTimeUpdated.toISOString(),
					})),
				);

				const workbook = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');

				const buffer = XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'}) as Buffer;

				return reply
					.header(
						'content-type',
						'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
					)
					.header('content-disposition', `attachment; filename="books-${Date.now()}.xlsx"`)
					.send(buffer);
			}),
	);
};

export const autoPrefix = '/books';
export default plugin;
