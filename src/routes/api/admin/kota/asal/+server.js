import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import {
	findAllKotaAsalWithStats,
	findKotaAsalByName,
	createKotaAsal
} from '$lib/server/repositories/kota';

const createSchema = z.object({
	nm_kota_asal: z.string().trim().min(2, 'Nama kota minimal 2 karakter').max(27, 'Nama kota maksimal 27 karakter')
});

export async function GET(event) {
	requireRole(event, 'admin');
	const items = await findAllKotaAsalWithStats();
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

	const existing = await findKotaAsalByName(parsed.data.nm_kota_asal);
	if (existing) {
		return json(
			{ error: { code: 'CONFLICT', message: `Kota asal "${parsed.data.nm_kota_asal}" sudah ada` } },
			{ status: 409 }
		);
	}

	const id = await createKotaAsal({ nm_kota_asal: parsed.data.nm_kota_asal });
	return json(
		{ data: { id_kota_asal: id, nm_kota_asal: parsed.data.nm_kota_asal, total_jadwal: 0 } },
		{ status: 201 }
	);
}
