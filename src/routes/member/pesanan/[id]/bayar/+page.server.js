import { error, redirect } from '@sveltejs/kit';
import { findPesananById } from '$lib/server/repositories/pesan';
import { banks } from '$lib/server/config/bank';

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

	if (order.id_member !== locals.user.id && locals.user.role !== 'admin' && locals.user.role !== 'operator') {
		throw error(403, 'Akses ditolak: bukan pesanan Anda');
	}

	// Jika pesanan sudah Lunas, langsung arahkan ke tiket resmi
	if (order.status === 'Lunas') {
		throw redirect(303, `/member/pesanan/${id}/tiket`);
	}

	return {
		order,
		banks
	};
}
