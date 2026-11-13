import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import { konfirmasiPembayaran } from '$lib/server/services/pemesanan';

const schema = z.object({
	no_resi: z.string().min(1, 'Nomor resi wajib diisi').max(20, 'Nomor resi maksimal 20 karakter'),
	no_rek: z.string().min(1, 'Nomor rekening wajib diisi').max(20, 'Nomor rekening maksimal 20 karakter'),
	tgl_transfer: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal transfer YYYY-MM-DD'),
	jam_transfer: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam transfer HH:MM')
});

export async function POST(event) {
	const user = requireRole(event, 'member');
	const idPesan = Number(event.params.id);

	if (!idPesan || isNaN(idPesan)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID pesanan tidak valid' } }, { status: 400 });
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

	let jam = parsed.data.jam_transfer;
	if (jam.length === 5) {
		jam += ':00';
	}

	try {
		const result = await konfirmasiPembayaran({
			id_pesan: idPesan,
			id_member: user.id,
			no_resi: parsed.data.no_resi.trim(),
			no_rek: parsed.data.no_rek.trim(),
			tgl_transfer: parsed.data.tgl_transfer,
			jam_transfer: jam
		});
		return json({ data: result }, { status: 201 });
	} catch (err) {
		const status = err.status || 500;
		return json({ error: { code: err.code || 'PAYMENT_ERROR', message: err.message } }, { status });
	}
}
