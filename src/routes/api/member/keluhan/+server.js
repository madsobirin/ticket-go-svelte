import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import { createKeluhan } from '$lib/server/repositories/keluhan';

const schema = z.object({
	j_keluhan: z
		.string()
		.trim()
		.min(1, 'Jenis keluhan wajib diisi')
		.max(20, 'Jenis keluhan maksimal 20 karakter'),
	d_keluhan: z
		.string()
		.trim()
		.min(1, 'Deskripsi keluhan wajib diisi')
		.max(200, 'Deskripsi keluhan maksimal 200 karakter')
});

export async function POST(event) {
	const user = requireRole(event, 'member');

	let body;
	try {
		body = await event.request.json();
	} catch {
		return json({ error: { code: 'INVALID_JSON', message: 'Request tidak valid' } }, { status: 400 });
	}

	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.errors[0]?.message ?? 'Data tidak valid';
		return json({ error: { code: 'VALIDATION', message } }, { status: 400 });
	}

	try {
		const result = await createKeluhan({
			id_member: user.id,
			j_keluhan: parsed.data.j_keluhan,
			d_keluhan: parsed.data.d_keluhan
		});
		return json({ data: result }, { status: 201 });
	} catch (err) {
		return json({ error: { code: 'SERVER_ERROR', message: err.message } }, { status: 500 });
	}
}
