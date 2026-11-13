import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import { findAllJadwal } from '$lib/server/repositories/jadwal';
import { createNewJadwal } from '$lib/server/services/jadwal';

const schema = z.object({
	id_kota_asal: z.number().int().positive('Pilih kota asal yang valid'),
	id_kota_tujuan: z.number().int().positive('Pilih kota tujuan yang valid'),
	id_mobil: z.number().int().positive('Pilih kendaraan yang valid'),
	harga: z.number().int().positive('Harga harus bilangan bulat positif'),
	tgl_berangkat: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
	jam_berangkat: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam HH:MM')
});

export async function GET(event) {
	requireRole(event, 'admin');
	const items = await findAllJadwal();
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

	// Parsing numbers if coming as string from form
	const parsed = schema.safeParse({
		...body,
		id_kota_asal: Number(body.id_kota_asal),
		id_kota_tujuan: Number(body.id_kota_tujuan),
		id_mobil: Number(body.id_mobil),
		harga: Number(body.harga)
	});

	if (!parsed.success) {
		const message = parsed.error.errors[0]?.message ?? 'Data tidak valid';
		return json({ error: { code: 'VALIDATION', message } }, { status: 400 });
	}

	try {
		const created = await createNewJadwal(parsed.data);
		return json({ data: created }, { status: 201 });
	} catch (err) {
		return json({ error: { code: 'BUSINESS_RULE', message: err.message } }, { status: 400 });
	}
}
