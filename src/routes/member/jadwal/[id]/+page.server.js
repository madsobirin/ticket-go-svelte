import { error, redirect } from '@sveltejs/kit';
import { findJadwalById } from '$lib/server/repositories/jadwal';
import { findBookedSeatsByJadwal } from '$lib/server/repositories/pesan';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals, url }) {
	const id = Number(params.id);
	if (!id || isNaN(id)) {
		throw error(400, 'ID jadwal tidak valid');
	}

	if (!locals.user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(url.pathname)}&login_required=1`);
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
