import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import {
	findAllKotaTujuanWithStats,
	findKotaTujuanByName,
	createKotaTujuan
} from '$lib/server/repositories/kota';

const createSchema = z.object({
	nm_kota_tujuan: z.string().trim().min(2, 'Nama kota minimal 2 karakter').max(26, 'Nama kota maksimal 26 karakter')
});

export async function GET(event) {
	requireRole(event, 'admin');
	const items = await findAllKotaTujuanWithStats();
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

	const parsed = createSchema.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.errors[0]?.message ?? 'Data tidak valid';
		return json({ error: { code: 'VALIDATION', message } }, { status: 400 });
	}

	const existing = await findKotaTujuanByName(parsed.data.nm_kota_tujuan);
	if (existing) {
		return json(
			{ error: { code: 'CONFLICT', message: `Kota tujuan "${parsed.data.nm_kota_tujuan}" sudah ada` } },
			{ status: 409 }
		);
	}

	const id = await createKotaTujuan({ nm_kota_tujuan: parsed.data.nm_kota_tujuan });
	return json(
		{ data: { id_kota_tujuan: id, nm_kota_tujuan: parsed.data.nm_kota_tujuan, total_jadwal: 0 } },
		{ status: 201 }
	);
}
