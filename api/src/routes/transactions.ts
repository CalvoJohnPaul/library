import {
	FailedHttpResponseDefinition,
	PaginatedDefinition,
	SortOrderDefinition,
	SuccessfulHttpResponseDefinition,
	TransactionDefinition,
	TransactionSortByInputDefinition,
	TransactionStatusDefinition,
	TransactionTypeDefinition,
} from '@library/types';
import {clamp} from 'es-toolkit';
import {assign} from 'es-toolkit/compat';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
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

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Transactions'],
				querystring: z.object({
					page: QueryString__NumberDefinition,
					pageSize: QueryString__NumberDefinition,
					id__eq: QueryString__NumberDefinition,
					id__neq: QueryString__NumberDefinition,
					id__in: QueryString__NumberArrayDefinition,
					id__nin: QueryString__NumberArrayDefinition,
					type__eq: QueryString__EnumDefinition(TransactionTypeDefinition),
					type__neq: QueryString__EnumDefinition(TransactionTypeDefinition),
					type__in: QueryString__EnumArrayDefinition(TransactionTypeDefinition),
					type__nin: QueryString__EnumArrayDefinition(TransactionTypeDefinition),
					status__eq: QueryString__EnumDefinition(TransactionStatusDefinition),
					status__neq: QueryString__EnumDefinition(TransactionStatusDefinition),
					status__in: QueryString__EnumArrayDefinition(TransactionStatusDefinition),
					status__nin: QueryString__EnumArrayDefinition(TransactionStatusDefinition),
					ticket__eq: QueryString__StringDefinition,
					ticket__neq: QueryString__StringDefinition,
					ticket__in: QueryString__StringArrayDefinition,
					ticket__nin: QueryString__StringArrayDefinition,
					ticket__contains: QueryString__StringDefinition,
					studentId__eq: QueryString__NumberDefinition,
					studentId__neq: QueryString__NumberDefinition,
					studentId__in: QueryString__NumberArrayDefinition,
					studentId__nin: QueryString__NumberArrayDefinition,
					bookCopyId__eq: QueryString__NumberDefinition,
					bookCopyId__neq: QueryString__NumberDefinition,
					bookCopyId__in: QueryString__NumberArrayDefinition,
					bookCopyId__nin: QueryString__NumberArrayDefinition,
					bookId__eq: QueryString__NumberDefinition,
					bookId__neq: QueryString__NumberDefinition,
					bookId__in: QueryString__NumberArrayDefinition,
					bookId__nin: QueryString__NumberArrayDefinition,
					isbn__eq: QueryString__StringDefinition,
					isbn__neq: QueryString__StringDefinition,
					isbn__in: QueryString__StringArrayDefinition,
					isbn__nin: QueryString__StringArrayDefinition,
					isbn__contains: QueryString__StringDefinition,
					dateTimeCreated__gt: QueryString__DateDefinition,
					dateTimeCreated__gte: QueryString__DateDefinition,
					dateTimeCreated__lt: QueryString__DateDefinition,
					dateTimeCreated__lte: QueryString__DateDefinition,
					dateTimeUpdated__gt: QueryString__DateDefinition,
					dateTimeUpdated__gte: QueryString__DateDefinition,
					dateTimeUpdated__lt: QueryString__DateDefinition,
					dateTimeUpdated__lte: QueryString__DateDefinition,
					sortBy: TransactionSortByInputDefinition.optional().nullable(),
					sortOrder: SortOrderDefinition.optional().nullable(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(PaginatedDefinition(TransactionDefinition)),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const where: Prisma.TransactionWhereInput = {};

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
				req.query.type__eq != null ||
				req.query.type__neq != null ||
				req.query.type__in != null ||
				req.query.type__nin != null
			) {
				where.type = {
					...(req.query.type__eq != null && {equals: req.query.type__eq}),
					...(req.query.type__neq != null && {not: req.query.type__neq}),
					...(req.query.type__in != null && {in: req.query.type__in}),
					...(req.query.type__nin != null && {notIn: req.query.type__nin}),
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
				req.query.ticket__eq != null ||
				req.query.ticket__neq != null ||
				req.query.ticket__in != null ||
				req.query.ticket__nin != null ||
				req.query.ticket__contains != null
			) {
				where.ticket = {
					...(req.query.ticket__eq != null && {equals: req.query.ticket__eq}),
					...(req.query.ticket__neq != null && {not: req.query.ticket__neq}),
					...(req.query.ticket__in != null && {in: req.query.ticket__in}),
					...(req.query.ticket__nin != null && {notIn: req.query.ticket__nin}),
					...(req.query.ticket__contains != null && {
						contains: req.query.ticket__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				req.query.studentId__eq != null ||
				req.query.studentId__neq != null ||
				req.query.studentId__in != null ||
				req.query.studentId__nin != null
			) {
				where.studentId = {
					...(req.query.studentId__eq != null && {equals: req.query.studentId__eq}),
					...(req.query.studentId__neq != null && {not: req.query.studentId__neq}),
					...(req.query.studentId__in != null && {in: req.query.studentId__in}),
					...(req.query.studentId__nin != null && {notIn: req.query.studentId__nin}),
				};
			}

			if (
				req.query.bookCopyId__eq != null ||
				req.query.bookCopyId__neq != null ||
				req.query.bookCopyId__in != null ||
				req.query.bookCopyId__nin != null
			) {
				where.bookCopyId = {
					...(req.query.bookCopyId__eq != null && {equals: req.query.bookCopyId__eq}),
					...(req.query.bookCopyId__neq != null && {not: req.query.bookCopyId__neq}),
					...(req.query.bookCopyId__in != null && {in: req.query.bookCopyId__in}),
					...(req.query.bookCopyId__nin != null && {notIn: req.query.bookCopyId__nin}),
				};
			}

			if (
				req.query.isbn__eq != null ||
				req.query.isbn__neq != null ||
				req.query.isbn__in != null ||
				req.query.isbn__nin != null ||
				req.query.isbn__contains != null
			) {
				where.bookCopy = assign(where.bookCopy || {}, {
					isbn: {
						...(req.query.isbn__eq != null && {equals: req.query.isbn__eq}),
						...(req.query.isbn__neq != null && {not: req.query.isbn__neq}),
						...(req.query.isbn__in != null && {in: req.query.isbn__in}),
						...(req.query.isbn__nin != null && {notIn: req.query.isbn__nin}),
						...(req.query.isbn__contains != null && {
							contains: req.query.isbn__contains,
							mode: 'insensitive',
						}),
					},
				});
			}

			if (
				req.query.bookId__eq != null ||
				req.query.bookId__neq != null ||
				req.query.bookId__in != null ||
				req.query.bookId__nin != null
			) {
				where.bookCopy = {
					bookId: {
						...(req.query.bookId__eq != null && {equals: req.query.bookId__eq}),
						...(req.query.bookId__neq != null && {not: req.query.bookId__neq}),
						...(req.query.bookId__in != null && {in: req.query.bookId__in}),
						...(req.query.bookId__nin != null && {notIn: req.query.bookId__nin}),
					},
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
				app.prisma.transaction.count({where}),
				app.prisma.transaction.findMany({
					skip,
					take,
					where,
					select: {
						id: true,
						type: true,
						status: true,
						ticket: true,
						remarks: true,
						dateTimeCreated: true,
						dateTimeUpdated: true,
						student: {
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
					rows: rows.map((transaction) => ({
						id: transaction.id,
						type: transaction.type,
						status: transaction.status,
						ticket: transaction.ticket,
						remarks: transaction.remarks,
						student: {
							id: transaction.student.id,
							externalId: transaction.student.externalId,
							name: transaction.student.name,
							course: transaction.student.course,
							yearAndSection: transaction.student.yearAndSection,
						},
						bookCopy: {
							id: transaction.bookCopy.id,
							book: {
								id: transaction.bookCopy.book.id,
								title: transaction.bookCopy.book.title,
								genre: transaction.bookCopy.book.genre,
								author: transaction.bookCopy.book.author,
								yearPublished: transaction.bookCopy.book.yearPublished,
							},
							isbn: transaction.bookCopy.isbn,
							status: transaction.bookCopy.status,
						},
						dateTimeCreated: transaction.dateTimeCreated,
						dateTimeUpdated: transaction.dateTimeUpdated,
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
				tags: ['Transactions'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(TransactionDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const transaction = await app.prisma.transaction.findUnique({
				where: {id: req.params.id},
				select: {
					id: true,
					type: true,
					status: true,
					ticket: true,
					remarks: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
					student: {
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
				},
			});

			if (!transaction) return reply.notFound();

			return reply.send({
				ok: true,
				data: {
					id: transaction.id,
					type: transaction.type,
					status: transaction.status,
					ticket: transaction.ticket,
					remarks: transaction.remarks,
					student: {
						id: transaction.student.id,
						externalId: transaction.student.externalId,
						name: transaction.student.name,
						course: transaction.student.course,
						yearAndSection: transaction.student.yearAndSection,
					},
					bookCopy: {
						id: transaction.bookCopy.id,
						book: {
							id: transaction.bookCopy.book.id,
							title: transaction.bookCopy.book.title,
							genre: transaction.bookCopy.book.genre,
							author: transaction.bookCopy.book.author,
							yearPublished: transaction.bookCopy.book.yearPublished,
						},
						isbn: transaction.bookCopy.isbn,
						status: transaction.bookCopy.status,
					},
					dateTimeCreated: transaction.dateTimeCreated,
					dateTimeUpdated: transaction.dateTimeUpdated,
				},
			});
		},
	);

	app.post(
		'/export',
		{
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Transactions'],
				querystring: z.object({
					id__eq: QueryString__NumberDefinition,
					id__neq: QueryString__NumberDefinition,
					id__in: QueryString__NumberArrayDefinition,
					id__nin: QueryString__NumberArrayDefinition,
					type__eq: QueryString__EnumDefinition(TransactionTypeDefinition),
					type__neq: QueryString__EnumDefinition(TransactionTypeDefinition),
					type__in: QueryString__EnumArrayDefinition(TransactionTypeDefinition),
					type__nin: QueryString__EnumArrayDefinition(TransactionTypeDefinition),
					status__eq: QueryString__EnumDefinition(TransactionStatusDefinition),
					status__neq: QueryString__EnumDefinition(TransactionStatusDefinition),
					status__in: QueryString__EnumArrayDefinition(TransactionStatusDefinition),
					status__nin: QueryString__EnumArrayDefinition(TransactionStatusDefinition),
					ticket__eq: QueryString__StringDefinition,
					ticket__neq: QueryString__StringDefinition,
					ticket__in: QueryString__StringArrayDefinition,
					ticket__nin: QueryString__StringArrayDefinition,
					ticket__contains: QueryString__StringDefinition,
					studentId__eq: QueryString__NumberDefinition,
					studentId__neq: QueryString__NumberDefinition,
					studentId__in: QueryString__NumberArrayDefinition,
					studentId__nin: QueryString__NumberArrayDefinition,
					bookCopyId__eq: QueryString__NumberDefinition,
					bookCopyId__neq: QueryString__NumberDefinition,
					bookCopyId__in: QueryString__NumberArrayDefinition,
					bookCopyId__nin: QueryString__NumberArrayDefinition,
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
					sortBy: TransactionSortByInputDefinition.optional().nullable(),
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
			const where: Prisma.TransactionWhereInput = {};

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
				req.query.type__eq != null ||
				req.query.type__neq != null ||
				req.query.type__in != null ||
				req.query.type__nin != null
			) {
				where.type = {
					...(req.query.type__eq != null && {equals: req.query.type__eq}),
					...(req.query.type__neq != null && {not: req.query.type__neq}),
					...(req.query.type__in != null && {in: req.query.type__in}),
					...(req.query.type__nin != null && {notIn: req.query.type__nin}),
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
				req.query.ticket__eq != null ||
				req.query.ticket__neq != null ||
				req.query.ticket__in != null ||
				req.query.ticket__nin != null ||
				req.query.ticket__contains != null
			) {
				where.ticket = {
					...(req.query.ticket__eq != null && {equals: req.query.ticket__eq}),
					...(req.query.ticket__neq != null && {not: req.query.ticket__neq}),
					...(req.query.ticket__in != null && {in: req.query.ticket__in}),
					...(req.query.ticket__nin != null && {notIn: req.query.ticket__nin}),
					...(req.query.ticket__contains != null && {
						contains: req.query.ticket__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				req.query.studentId__eq != null ||
				req.query.studentId__neq != null ||
				req.query.studentId__in != null ||
				req.query.studentId__nin != null
			) {
				where.studentId = {
					...(req.query.studentId__eq != null && {equals: req.query.studentId__eq}),
					...(req.query.studentId__neq != null && {not: req.query.studentId__neq}),
					...(req.query.studentId__in != null && {in: req.query.studentId__in}),
					...(req.query.studentId__nin != null && {notIn: req.query.studentId__nin}),
				};
			}

			if (
				req.query.bookCopyId__eq != null ||
				req.query.bookCopyId__neq != null ||
				req.query.bookCopyId__in != null ||
				req.query.bookCopyId__nin != null
			) {
				where.bookCopyId = {
					...(req.query.bookCopyId__eq != null && {equals: req.query.bookCopyId__eq}),
					...(req.query.bookCopyId__neq != null && {not: req.query.bookCopyId__neq}),
					...(req.query.bookCopyId__in != null && {in: req.query.bookCopyId__in}),
					...(req.query.bookCopyId__nin != null && {notIn: req.query.bookCopyId__nin}),
				};
			}

			if (
				req.query.bookId__eq != null ||
				req.query.bookId__neq != null ||
				req.query.bookId__in != null ||
				req.query.bookId__nin != null
			) {
				where.bookCopy = {
					bookId: {
						...(req.query.bookId__eq != null && {equals: req.query.bookId__eq}),
						...(req.query.bookId__neq != null && {not: req.query.bookId__neq}),
						...(req.query.bookId__in != null && {in: req.query.bookId__in}),
						...(req.query.bookId__nin != null && {notIn: req.query.bookId__nin}),
					},
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

			const rows = await app.prisma.transaction.findMany({
				where,
				select: {
					id: true,
					type: true,
					status: true,
					ticket: true,
					remarks: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
					student: {
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
				rows.map((transaction) => ({
					id: transaction.id,
					type: transaction.type,
					status: transaction.status,
					ticket: transaction.ticket,
					remarks: transaction.remarks,
					studentId: transaction.student.id,
					externalId: transaction.student.externalId,
					name: transaction.student.name,
					course: transaction.student.course,
					yearAndSection: transaction.student.yearAndSection,
					bookCopyId: transaction.bookCopy.id,
					isbn: transaction.bookCopy.isbn,
					title: transaction.bookCopy.book.title,
					author: transaction.bookCopy.book.author,
					genre: transaction.bookCopy.book.genre,
					yearPublished: transaction.bookCopy.book.yearPublished,
					bookStatus: transaction.bookCopy.status,
					dateTimeCreated: transaction.dateTimeCreated.toISOString(),
					dateTimeUpdated: transaction.dateTimeUpdated.toISOString(),
				})),
			);

			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

			const buffer = XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'}) as Buffer;

			return reply
				.header('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
				.header('content-disposition', `attachment; filename="transactions-${Date.now()}.xlsx"`)
				.send(buffer);
		},
	);
};

export const autoPrefix = '/transactions';
export default plugin;
