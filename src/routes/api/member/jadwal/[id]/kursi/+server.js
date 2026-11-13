import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/guard';
import { findBookedSeatsByJadwal } from '$lib/server/repositories/pesan';
import { findJadwalById } from '$lib/server/repositories/jadwal';

export async function GET(event) {
	requireRole(event, 'member');
	const id = Number(event.params.id);

	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID jadwal tidak valid' } }, { status: 400 });
	}

	const jadwal = await findJadwalById(id);
	if (!jadwal) {
		return json({ error: { code: 'NOT_FOUND', message: 'Jadwal tidak ditemukan' } }, { status: 404 });
	}

	const bookedSeats = await findBookedSeatsByJadwal(id);
	return json({
		data: {
			id_jadwal: id,
			booked_seats: bookedSeats,
			total_seats: 5
		}
	});
}
