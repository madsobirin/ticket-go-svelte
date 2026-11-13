import { error } from '@sveltejs/kit';
import { findPesananById } from '$lib/server/repositories/pesan';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const id = Number(params.id);
	if (!id || isNaN(id)) {
		throw error(400, 'ID pesanan tidak valid');
	}

	const order = await findPesananById(id);
	if (!order) {
		throw error(404, 'Pesanan tidak ditemukan');
	}

	if (order.id_member !== locals.user.id) {
		throw error(403, 'Akses ditolak: pesanan ini bukan milik Anda');
	}

	if (order.status !== 'Belum Bayar') {
		throw error(400, 'Pesanan ini tidak membutuhkan pembayaran lagi');
	}

	return {
		order
	};
}
