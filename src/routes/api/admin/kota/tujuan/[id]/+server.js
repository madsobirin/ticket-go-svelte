import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import {
	findKotaTujuanById,
	findKotaTujuanByName,
	findKotaTujuanUsage,
	updateKotaTujuan,
	deleteKotaTujuan
} from '$lib/server/repositories/kota';

const updateSchema = z.object({
	nm_kota_tujuan: z.string().trim().min(2, 'Nama kota minimal 2 karakter').max(26, 'Nama kota maksimal 26 karakter')
});

export async function PUT(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);
	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID kota tidak valid' } }, { status: 400 });
	}

	const existing = await findKotaTujuanById(id);
	if (!existing) {
		return json({ error: { code: 'NOT_FOUND', message: 'Kota tujuan tidak ditemukan' } }, { status: 404 });
	}

	let body;
	try {
		body = await event.request.json();
	} catch {
		return json({ error: { code: 'INVALID_JSON', message: 'Request tidak valid' } }, { status: 400 });
	}

	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.errors[0]?.message ?? 'Data tidak valid';
		return json({ error: { code: 'VALIDATION', message } }, { status: 400 });
	}

	const duplicate = await findKotaTujuanByName(parsed.data.nm_kota_tujuan, id);
	if (duplicate) {
		return json(
			{ error: { code: 'CONFLICT', message: `Kota tujuan "${parsed.data.nm_kota_tujuan}" sudah ada` } },
			{ status: 409 }
		);
	}

	await updateKotaTujuan(id, { nm_kota_tujuan: parsed.data.nm_kota_tujuan });
	return json({ data: { id_kota_tujuan: id, nm_kota_tujuan: parsed.data.nm_kota_tujuan } });
}

export async function DELETE(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);
	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID kota tidak valid' } }, { status: 400 });
	}

	const existing = await findKotaTujuanById(id);
	if (!existing) {
		return json({ error: { code: 'NOT_FOUND', message: 'Kota tujuan tidak ditemukan' } }, { status: 404 });
	}

	const usageCount = await findKotaTujuanUsage(id);
	if (usageCount > 0) {
		return json(
			{
				error: {
					code: 'CONFLICT',
					message: `Kota tujuan tidak dapat dihapus karena masih digunakan dalam ${usageCount} jadwal rute aktif`
				}
			},
			{ status: 409 }
		);
	}

	await deleteKotaTujuan(id);
	return json({ data: { message: 'Kota tujuan berhasil dihapus' } });
}
