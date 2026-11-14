import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import {
	findKotaAsalById,
	findKotaAsalByName,
	findKotaAsalUsage,
	updateKotaAsal,
	deleteKotaAsal
} from '$lib/server/repositories/kota';

const updateSchema = z.object({
	nm_kota_asal: z.string().trim().min(2, 'Nama kota minimal 2 karakter').max(27, 'Nama kota maksimal 27 karakter')
});

export async function PUT(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);
	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID kota tidak valid' } }, { status: 400 });
	}

	const existing = await findKotaAsalById(id);
	if (!existing) {
		return json({ error: { code: 'NOT_FOUND', message: 'Kota asal tidak ditemukan' } }, { status: 404 });
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

	const duplicate = await findKotaAsalByName(parsed.data.nm_kota_asal, id);
	if (duplicate) {
		return json(
			{ error: { code: 'CONFLICT', message: `Kota asal "${parsed.data.nm_kota_asal}" sudah ada` } },
			{ status: 409 }
		);
	}

	await updateKotaAsal(id, { nm_kota_asal: parsed.data.nm_kota_asal });
	return json({ data: { id_kota_asal: id, nm_kota_asal: parsed.data.nm_kota_asal } });
}

export async function DELETE(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);
	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID kota tidak valid' } }, { status: 400 });
	}

	const existing = await findKotaAsalById(id);
	if (!existing) {
		return json({ error: { code: 'NOT_FOUND', message: 'Kota asal tidak ditemukan' } }, { status: 404 });
	}

	const usageCount = await findKotaAsalUsage(id);
	if (usageCount > 0) {
		return json(
			{
				error: {
					code: 'CONFLICT',
					message: `Kota asal tidak dapat dihapus karena masih digunakan dalam ${usageCount} jadwal rute aktif`
				}
			},
			{ status: 409 }
		);
	}

	await deleteKotaAsal(id);
	return json({ data: { message: 'Kota asal berhasil dihapus' } });
}
