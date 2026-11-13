import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/guard';
import { findAllPesanan } from '$lib/server/repositories/pesan';

export async function GET(event) {
	requireRole(event, 'operator');

	const statusFilter = event.url.searchParams.get('status');
	const validStatuses = ['Belum Bayar', 'Dalam Proses', 'Lunas'];

	const filter = validStatuses.includes(statusFilter) ? statusFilter : null;
	const items = await findAllPesanan(filter);

	// Verifikasi konsistensi resi
	for (const item of items) {
		if (item.konfirmasi_no_resi && item.no_resi !== item.konfirmasi_no_resi) {
			console.error(`[BUG] Resi mismatch on order ${item.id_pesan}: calculated ${item.no_resi} vs stored ${item.konfirmasi_no_resi}`);
		}
	}

	return json({ data: items });
}
