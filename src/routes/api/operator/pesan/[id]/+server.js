import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/guard';
import { findPesananById } from '$lib/server/repositories/pesan';

export async function GET(event) {
	requireRole(event, 'operator');
	const id = Number(event.params.id);

	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID pesanan tidak valid' } }, { status: 400 });
	}

	const order = await findPesananById(id);
	if (!order) {
		return json({ error: { code: 'NOT_FOUND', message: 'Pesanan tidak ditemukan' } }, { status: 404 });
	}

	return json({ data: order });
}
