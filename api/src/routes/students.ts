import {
	CreateStudentInputDefinition,
	FailedHttpResponseDefinition,
	PaginatedDefinition,
	SortOrderDefinition,
	StudentDefinition,
	StudentSortByInputDefinition,
	SuccessfulHttpResponseDefinition,
	UpdateStudentDataInputDefinition,
} from '@library/types';
import {clamp} from 'es-toolkit';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import * as z from 'zod';
import type {Prisma} from '../../prisma/.generated/client';
import {clean} from '../helpers/clean';
import {
	QueryString__DateDefinition,
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
				tags: ['Students'],
				querystring: z.object({
					page: QueryString__NumberDefinition,
					pageSize: QueryString__NumberDefinition,
					id__eq: QueryString__NumberDefinition,
					id__neq: QueryString__NumberDefinition,
					id__in: QueryString__NumberArrayDefinition,
					id__nin: QueryString__NumberArrayDefinition,
					externalId__eq: QueryString__StringDefinition,
					externalId__neq: QueryString__StringDefinition,
					externalId__in: QueryString__StringArrayDefinition,
					externalId__nin: QueryString__StringArrayDefinition,
					externalId__contains: QueryString__StringDefinition,
					name__eq: QueryString__StringDefinition,
					name__neq: QueryString__StringDefinition,
					name__in: QueryString__StringArrayDefinition,
					name__nin: QueryString__StringArrayDefinition,
					name__contains: QueryString__StringDefinition,
					course__eq: QueryString__StringDefinition,
					course__neq: QueryString__StringDefinition,
					course__in: QueryString__StringArrayDefinition,
					course__nin: QueryString__StringArrayDefinition,
					course__contains: QueryString__StringDefinition,
					yearAndSection__eq: QueryString__StringDefinition,
					yearAndSection__neq: QueryString__StringDefinition,
					yearAndSection__in: QueryString__StringArrayDefinition,
					yearAndSection__nin: QueryString__StringArrayDefinition,
					yearAndSection__contains: QueryString__StringDefinition,
					dateTimeCreated__gt: QueryString__DateDefinition,
					dateTimeCreated__gte: QueryString__DateDefinition,
					dateTimeCreated__lt: QueryString__DateDefinition,
					dateTimeCreated__lte: QueryString__DateDefinition,
					dateTimeUpdated__gt: QueryString__DateDefinition,
					dateTimeUpdated__gte: QueryString__DateDefinition,
					dateTimeUpdated__lt: QueryString__DateDefinition,
					dateTimeUpdated__lte: QueryString__DateDefinition,
					sortBy: StudentSortByInputDefinition.optional().nullable(),
					sortOrder: SortOrderDefinition.optional().nullable(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(PaginatedDefinition(StudentDefinition)),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const where: Prisma.StudentWhereInput = {};

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
				req.query.externalId__eq != null ||
				req.query.externalId__neq != null ||
				req.query.externalId__in != null ||
				req.query.externalId__nin != null ||
				req.query.externalId__contains
			) {
				where.externalId = {
					...(req.query.externalId__eq != null && {equals: req.query.externalId__eq}),
					...(req.query.externalId__neq != null && {not: req.query.externalId__neq}),
					...(req.query.externalId__in != null && {in: req.query.externalId__in}),
					...(req.query.externalId__nin != null && {notIn: req.query.externalId__nin}),
					...(req.query.externalId__contains != null && {
						contains: req.query.externalId__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				req.query.name__eq != null ||
				req.query.name__neq != null ||
				req.query.name__in != null ||
				req.query.name__nin != null ||
				req.query.name__contains != null
			) {
				where.name = {
					...(req.query.name__eq != null && {equals: req.query.name__eq}),
					...(req.query.name__neq != null && {not: req.query.name__neq}),
					...(req.query.name__in != null && {in: req.query.name__in}),
					...(req.query.name__nin != null && {notIn: req.query.name__nin}),
					...(req.query.name__contains != null && {
						contains: req.query.name__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				req.query.course__eq != null ||
				req.query.course__neq != null ||
				req.query.course__in != null ||
				req.query.course__nin != null ||
				req.query.course__contains
			) {
				where.course = {
					...(req.query.course__eq != null && {equals: req.query.course__eq}),
					...(req.query.course__neq != null && {not: req.query.course__neq}),
					...(req.query.course__in != null && {in: req.query.course__in}),
					...(req.query.course__nin != null && {notIn: req.query.course__nin}),
					...(req.query.course__contains != null && {
						contains: req.query.course__contains,
						mode: 'insensitive',
					}),
				};
			}

			if (
				req.query.yearAndSection__eq != null ||
				req.query.yearAndSection__neq != null ||
				req.query.yearAndSection__in != null ||
				req.query.yearAndSection__nin != null ||
				req.query.yearAndSection__contains
			) {
				where.yearAndSection = {
					...(req.query.yearAndSection__eq != null && {equals: req.query.yearAndSection__eq}),
					...(req.query.yearAndSection__neq != null && {not: req.query.yearAndSection__neq}),
					...(req.query.yearAndSection__in != null && {in: req.query.yearAndSection__in}),
					...(req.query.yearAndSection__nin != null && {notIn: req.query.yearAndSection__nin}),
					...(req.query.yearAndSection__contains != null && {
						contains: req.query.yearAndSection__contains,
						mode: 'insensitive',
					}),
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
			const sortOrder = req.query.sortOrder === 'ASC' ? 'asc' : 'desc';

			const [total, rows] = await app.prisma.$transaction([
				app.prisma.student.count({where}),
				app.prisma.student.findMany({
					skip,
					take,
					where,
					select: {
						id: true,
						externalId: true,
						name: true,
						course: true,
						yearAndSection: true,
						dateTimeLastBorrowedBook: true,
						dateTimeCreated: true,
						dateTimeUpdated: true,
					},
					orderBy: {
						dateTimeCreated: 'desc',
					},
					...(req.query.sortBy != null && {
						orderBy: {
							...(req.query.sortBy === 'dateTimeCreated' && {
								dateTimeCreated: sortOrder,
							}),
							...(req.query.sortBy === 'dateTimeUpdated' && {
								dateTimeUpdated: sortOrder,
							}),
							...(req.query.sortBy === 'dateTimeLastBorrowedBook' && {
								// Students who never borrowed a book sort last.
								dateTimeLastBorrowedBook: {sort: sortOrder, nulls: 'last'},
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
					rows: rows.map((student) => ({
						id: student.id,
						externalId: student.externalId,
						name: student.name,
						course: student.course,
						yearAndSection: student.yearAndSection,
						dateTimeCreated: student.dateTimeCreated,
						dateTimeUpdated: student.dateTimeUpdated,
						dateTimeLastBorrowedBook: student.dateTimeLastBorrowedBook,
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
				tags: ['Students'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				response: {
					200: SuccessfulHttpResponseDefinition(StudentDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					404: FailedHttpResponseDefinition,
				},
			},
		},
		async (req, reply) => {
			const student = await app.prisma.student.findUnique({
				where: {id: req.params.id},
				select: {
					id: true,
					externalId: true,
					name: true,
					course: true,
					yearAndSection: true,
					dateTimeLastBorrowedBook: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
				},
			});

			if (!student) return reply.notFound();

			return reply.send({
				ok: true,
				data: {
					id: student.id,
					externalId: student.externalId,
					name: student.name,
					course: student.course,
					yearAndSection: student.yearAndSection,
					dateTimeCreated: student.dateTimeCreated,
					dateTimeUpdated: student.dateTimeUpdated,
					dateTimeLastBorrowedBook: student.dateTimeLastBorrowedBook,
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
				tags: ['Students'],
				body: CreateStudentInputDefinition,
				response: {
					201: SuccessfulHttpResponseDefinition(StudentDefinition),
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
			if (await app.prisma.student.exists({externalId: req.body.externalId})) {
				return reply.conflict('Student ID already exists');
			}

			const student = await app.prisma.student.create({
				data: {
					externalId: req.body.externalId,
					name: req.body.name,
					course: req.body.course,
					yearAndSection: req.body.yearAndSection,
				},
				select: {
					id: true,
					externalId: true,
					name: true,
					course: true,
					yearAndSection: true,
					dateTimeLastBorrowedBook: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
				},
			});

			return reply.code(201).send({
				ok: true,
				data: {
					id: student.id,
					externalId: student.externalId,
					name: student.name,
					course: student.course,
					yearAndSection: student.yearAndSection,
					dateTimeCreated: student.dateTimeCreated,
					dateTimeUpdated: student.dateTimeUpdated,
					dateTimeLastBorrowedBook: student.dateTimeLastBorrowedBook,
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
				tags: ['Students'],
				params: z.object({
					id: z.coerce.number().positive(),
				}),
				body: UpdateStudentDataInputDefinition,
				response: {
					200: SuccessfulHttpResponseDefinition(StudentDefinition),
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
			if (!(await app.prisma.student.exists({id: req.params.id}))) {
				return reply.notFound();
			}

			const data = clean(req.body);
			const student = await app.prisma.student.update({
				where: {id: req.params.id},
				data,
				select: {
					id: true,
					externalId: true,
					name: true,
					course: true,
					yearAndSection: true,
					dateTimeLastBorrowedBook: true,
					dateTimeCreated: true,
					dateTimeUpdated: true,
				},
			});

			return reply.send({
				ok: true,
				data: {
					id: student.id,
					externalId: student.externalId,
					name: student.name,
					course: student.course,
					yearAndSection: student.yearAndSection,
					dateTimeCreated: student.dateTimeCreated,
					dateTimeUpdated: student.dateTimeUpdated,
					dateTimeLastBorrowedBook: student.dateTimeLastBorrowedBook,
				},
			});
		},
	);
};

export const autoPrefix = '/students';
export default plugin;
