import { error } from '@sveltejs/kit';
import { findPesananById } from '$lib/server/repositories/pesan';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const id = Number(params.id);
	if (!id || isNaN(id)) {
		throw error(400, 'ID pesanan tidak valid');
	}

	const order = await findPesananById(id);
	if (!order) {
		throw error(404, 'Pesanan tidak ditemukan');
	}

	return {
		order
	};
}
