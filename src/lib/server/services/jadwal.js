import { findKotaAsalById, findKotaTujuanById } from '$lib/server/repositories/kota';
import { findKendaraanById } from '$lib/server/repositories/kendaraan';
import { createJadwal, updateJadwal, findJadwalById } from '$lib/server/repositories/jadwal';

/**
 * Validasi aturan bisnis jadwal:
 * 1. Kota asal dan tujuan valid & tidak boleh sama kotanya
 * 2. Kendaraan harus ada
 * 3. Harga bilangan bulat positif
 * 4. Tanggal dan jam tidak boleh lewat
 *
 * @param {{ id_kota_asal: number, id_kota_tujuan: number, harga: number, tgl_berangkat: string, jam_berangkat: string, id_mobil: number }} data
 */
export async function validateJadwalData(data) {
	if (!data.harga || typeof data.harga !== 'number' || data.harga <= 0 || !Number.isInteger(data.harga)) {
		throw new Error('Harga harus bilangan bulat positif');
	}

	const [kotaAsal, kotaTujuan, mobil] = await Promise.all([
		findKotaAsalById(data.id_kota_asal),
		findKotaTujuanById(data.id_kota_tujuan),
		findKendaraanById(data.id_mobil)
	]);

	if (!kotaAsal) {
		throw new Error('Kota asal tidak ditemukan');
	}
	if (!kotaTujuan) {
		throw new Error('Kota tujuan tidak ditemukan');
	}
	if (!mobil) {
		throw new Error('Kendaraan tidak ditemukan');
	}

	if (kotaAsal.nm_kota_asal.trim().toLowerCase() === kotaTujuan.nm_kota_tujuan.trim().toLowerCase()) {
		throw new Error('Kota asal dan kota tujuan tidak boleh sama');
	}

	// Normalisasi jam: pastikan format HH:MM atau HH:MM:SS
	let jam = data.jam_berangkat.trim();
	if (jam.length === 5) {
		jam += ':00';
	}

	const departureDateTime = new Date(`${data.tgl_berangkat}T${jam}`);
	if (isNaN(departureDateTime.getTime())) {
		throw new Error('Format tanggal atau jam keberangkatan tidak valid');
	}

	// Bandingkan dengan waktu sekarang
	if (departureDateTime < new Date()) {
		throw new Error('Tanggal dan jam keberangkatan tidak boleh sudah lewat');
	}

	return {
		...data,
		jam_berangkat: jam
	};
}

export async function createNewJadwal(data) {
	const validData = await validateJadwalData(data);
	const id = await createJadwal(validData);
	return findJadwalById(id);
}

export async function updateExistingJadwal(id, data) {
	const existing = await findJadwalById(id);
	if (!existing) {
		return null;
	}
	const validData = await validateJadwalData(data);
	await updateJadwal(id, validData);
	return findJadwalById(id);
}
