import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import { findJadwalById, removeJadwal } from '$lib/server/repositories/jadwal';
import { updateExistingJadwal } from '$lib/server/services/jadwal';

const schema = z.object({
	id_kota_asal: z.number().int().positive('Pilih kota asal yang valid'),
	id_kota_tujuan: z.number().int().positive('Pilih kota tujuan yang valid'),
	id_mobil: z.number().int().positive('Pilih kendaraan yang valid'),
	harga: z.number().int().positive('Harga harus bilangan bulat positif'),
	tgl_berangkat: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
	jam_berangkat: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam HH:MM')
});

export async function PUT(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);
	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID jadwal tidak valid' } }, { status: 400 });
	}

	const existing = await findJadwalById(id);
	if (!existing) {
		return json({ error: { code: 'NOT_FOUND', message: 'Jadwal tidak ditemukan' } }, { status: 404 });
	}

	let body;
	try {
		body = await event.request.json();
	} catch {
		return json({ error: { code: 'INVALID_JSON', message: 'Request tidak valid' } }, { status: 400 });
	}

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
		const updated = await updateExistingJadwal(id, parsed.data);
		return json({ data: updated });
	} catch (err) {
		return json({ error: { code: 'BUSINESS_RULE', message: err.message } }, { status: 400 });
	}
}

export async function DELETE(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);
	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID jadwal tidak valid' } }, { status: 400 });
	}

	const existing = await findJadwalById(id);
	if (!existing) {
		return json({ error: { code: 'NOT_FOUND', message: 'Jadwal tidak ditemukan' } }, { status: 404 });
	}

	try {
		await removeJadwal(id);
		return new Response(null, { status: 204 });
	} catch (err) {
		return json({ error: { code: 'CONFLICT', message: 'Jadwal tidak bisa dihapus karena sudah ada pesanan' } }, { status: 409 });
	}
}
