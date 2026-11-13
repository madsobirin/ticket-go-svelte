import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import { findAllKendaraan, createKendaraan } from '$lib/server/repositories/kendaraan';

const schema = z.object({
	jenis_mobil: z.string().min(1, 'Jenis mobil wajib diisi').max(20),
	nomor_polisi: z.string().min(1, 'Nomor polisi wajib diisi').max(20),
	warna_mobil: z.string().min(1, 'Warna mobil wajib diisi').max(20)
});

export async function GET(event) {
	requireRole(event, 'admin');
	const items = await findAllKendaraan();
	return json({ data: items });
}

export async function POST(event) {
	requireRole(event, 'admin');

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

	const id = await createKendaraan(parsed.data);
	return json({ data: { id_mobil: id, ...parsed.data } }, { status: 201 });
}
