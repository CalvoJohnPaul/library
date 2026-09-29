import * as z from 'zod';

export const QueryString__StringDefinition = z
	.string()
	.nullable()
	.optional()
	.transform((v) => {
		return v == null || v === '' ? null : v;
	});

export const QueryString__StringArrayDefinition = z
	.union([z.string(), z.array(z.string())])
	.optional()
	.nullable()
	.transform((v) => {
		if (v == null) return null;
		const l = Array.isArray(v) ? v.filter(Boolean) : [v];
		return l.length > 0 ? l : null;
	});

export const QueryString__NumberDefinition = z
	.string()
	.nullable()
	.optional()
	.transform((v) => {
		if (v == null) return null;
		const n = parseFloat(v);
		if (Number.isNaN(n)) return null;
		return n;
	});

export const QueryString__NumberArrayDefinition = z
	.union([z.string(), z.array(z.string())])
	.optional()
	.nullable()
	.transform((v) => {
		if (v == null) return null;

		const l: number[] = [];

		if (Array.isArray(v)) {
			v.forEach((s) => {
				const n = parseFloat(s);
				if (!Number.isNaN(n)) l.push(n);
			});
		} else {
			const n = parseFloat(v);
			if (!Number.isNaN(n)) l.push(n);
		}

		return l.length > 0 ? l : null;
	});

export const QueryString__DateDefinition = z
	.string()
	.nullable()
	.optional()
	.transform((v) => {
		if (v == null) return null;
		const d = new Date(v);
		if (Number.isNaN(d.getTime())) return null;
		return d;
	});

export const QueryString__EnumDefinition = <T extends z.ZodType>(t: T) =>
	t
		.optional()
		.nullable()
		.transform((v) => v ?? null);

export const QueryString__EnumArrayDefinition = <T extends z.ZodType>(t: T) =>
	z.union([t, z.array(t).optional().nullable()]).transform((v) => {
		const l = Array.isArray(v) ? v.filter(Boolean) : [v].filter(Boolean);
		return l.length >= 1 ? l : null;
	});

export const QueryString__BooleanDefinition = z
	.string()
	.nullable()
	.optional()
	.transform((v_) => {
		const v = v_?.toLowerCase();
		if (v == null) return null;
		if (v === 'true' || v === 'yes') return true;
		if (v === 'false' || v === 'no') return false;
	});
