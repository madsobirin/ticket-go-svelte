import { error } from '@sveltejs/kit';
import { findJadwalById } from '$lib/server/repositories/jadwal';
import { findBookedSeatsByJadwal } from '$lib/server/repositories/pesan';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const id = Number(params.id);
	if (!id || isNaN(id)) {
		throw error(400, 'ID jadwal tidak valid');
	}

	const jadwal = await findJadwalById(id);
	if (!jadwal) {
		throw error(404, 'Jadwal tidak ditemukan');
	}

	const bookedSeats = await findBookedSeatsByJadwal(id);

	return {
		jadwal,
		bookedSeats
	};
}
