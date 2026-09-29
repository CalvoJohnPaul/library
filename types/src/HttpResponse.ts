import * as z from 'zod';

export const FailedHttpResponseDefinition = z.object({
	ok: z.literal(false),
	error: z.object({
		name: z.string(),
		message: z.string(),
	}),
});

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
