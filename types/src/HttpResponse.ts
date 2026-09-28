import * as z from 'zod';

export type FailedHttpResponse = z.infer<typeof FailedHttpResponseDefinition>;
export const FailedHttpResponseDefinition = z.union([
	z.object({
		ok: z.literal(false),
		error: z.object({
			name: z.string(),
			message: z.string(),
		}),
	}),
	z
		.object({
			code: z.string().optional().nullable(),
			message: z.string().optional().nullable(),
			statusCode: z.number(),
		})
		.transform(({statusCode, message}) => {
			const nameMap: Record<number, string> = {
				400: 'BadRequestError',
				401: 'UnauthorizedError',
				403: 'ForbiddenError',
				404: 'NotFoundError',
				405: 'MethodNotAllowedError',
				408: 'RequestTimeoutError',
				413: 'PayloadTooLargeError',
				414: 'UriTooLongError',
				429: 'TooManyRequestsError',
				500: 'InternalServerErrorError',
				503: 'ServiceUnavailableError',
			};

			const messageMap: Record<number, string> = {
				400: 'Invalid request.',
				401: 'You are not authorized to access this resource.',
				403: 'You do not have permission to access this resource.',
				404: 'Resource not found.',
				405: 'Request method is not allowed.',
				408: 'The server timed out waiting for the request.',
				413: 'The request payload is too large.',
				414: 'The request URI is too long.',
				429: 'Too many requests.',
				500: 'An unexpected error occurred.',
				503: 'Server is currently unavailable.',
			};

			return {
				ok: false as const,
				error: {
					name: nameMap[statusCode] ?? nameMap[500],
					message: message ?? messageMap[statusCode] ?? messageMap[500],
				},
			};
		}),
]);

export type VoidSuccessfulHttpResponse = z.infer<typeof VoidHttpResponseDefinition>;
export const VoidSuccessfulHttpResponseDefinition = z.object({
	ok: z.literal(true),
});

export type SuccessfulHttpResponse = z.infer<typeof SuccessfulHttpResponseDefinition>;
export const SuccessfulHttpResponseDefinition = <T extends z.ZodType>(def: T) =>
	z.object({
		ok: z.literal(true),
		data: def,
	});

export type VoidHttpResponse = z.infer<typeof VoidHttpResponseDefinition>;
export const VoidHttpResponseDefinition = z.union([
	VoidSuccessfulHttpResponseDefinition,
	FailedHttpResponseDefinition,
]);

export type HttpResponse<T> = z.infer<ReturnType<typeof HttpResponseDefinition<z.ZodType<T>>>>;
export const HttpResponseDefinition = <T extends z.ZodType>(def: T) =>
	z.union([SuccessfulHttpResponseDefinition(def), FailedHttpResponseDefinition]);
