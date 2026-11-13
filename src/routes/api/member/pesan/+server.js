import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import { pesanKursi } from '$lib/server/services/pemesanan';

const schema = z.object({
	id_jadwal: z.number().int().positive('ID jadwal harus valid'),
	nomor_kursi: z.union([
		z.number().int().min(1).max(5),
		z.array(z.number().int().min(1).max(5)).min(1).max(5)
	])
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

	const kursiList = Array.isArray(parsed.data.nomor_kursi)
		? parsed.data.nomor_kursi
		: [parsed.data.nomor_kursi];

	try {
		const result = await pesanKursi({
			id_jadwal: parsed.data.id_jadwal,
			id_member: user.id,
			kursiList
		});
		return json({
			data: {
				...result,
				redirect: `/member/pesanan/${result.first_id_pesan}/bayar`
			}
		}, { status: 201 });
	} catch (err) {
		const status = err.status || 500;
		return json({ error: { code: err.code || 'BOOKING_ERROR', message: err.message } }, { status });
	}
}
