import { error } from '@sveltejs/kit';
import { findPesananById } from '$lib/server/repositories/pesan';
import { banks } from '$lib/server/config/bank';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals, url }) {
	const id = Number(params.id);
	if (!id || isNaN(id)) {
		throw error(400, 'ID pesanan tidak valid');
	}

	const order = await findPesananById(id);
	if (!order) {
		throw error(404, 'Pesanan tidak ditemukan');
	}

	if (order.id_member !== locals.user.id) {
		throw error(403, 'Akses ditolak: bukan pesanan Anda');
	}

	const bankParam = url.searchParams.get('bank');
	const matchedBank = banks.find((b) => b.name.toLowerCase() === bankParam?.toLowerCase()) || banks[0];

	return {
		order,
		bank: matchedBank
	};
}
