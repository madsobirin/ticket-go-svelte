import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import { findKendaraanById, updateKendaraan, removeKendaraan } from '$lib/server/repositories/kendaraan';

const schema = z.object({
	jenis_mobil: z.string().min(1, 'Jenis mobil wajib diisi').max(20),
	nomor_polisi: z.string().min(1, 'Nomor polisi wajib diisi').max(20),
	warna_mobil: z.string().min(1, 'Warna mobil wajib diisi').max(20)
});

export async function PUT(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);
	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID kendaraan tidak valid' } }, { status: 400 });
	}

	const existing = await findKendaraanById(id);
	if (!existing) {
		return json({ error: { code: 'NOT_FOUND', message: 'Kendaraan tidak ditemukan' } }, { status: 404 });
	}

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

	await updateKendaraan(id, parsed.data);
	return json({ data: { id_mobil: id, ...parsed.data } });
}

export async function DELETE(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);
	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID kendaraan tidak valid' } }, { status: 400 });
	}

	const existing = await findKendaraanById(id);
	if (!existing) {
		return json({ error: { code: 'NOT_FOUND', message: 'Kendaraan tidak ditemukan' } }, { status: 404 });
	}

	try {
		await removeKendaraan(id);
		return new Response(null, { status: 204 });
	} catch (err) {
		// Jika ada relasi ke jadwal
		return json({ error: { code: 'CONFLICT', message: 'Kendaraan masih digunakan dalam jadwal' } }, { status: 409 });
	}
}
