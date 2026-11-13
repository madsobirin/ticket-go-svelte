import { pool } from '$lib/server/db';

/**
 * Ambil semua jadwal lengkap dengan nama kota dan kendaraan.
 */
export async function findAllJadwal() {
	const [rows] = await pool.query(`
		SELECT 
			j.id_jadwal,
			j.id_kota_asal,
			ka.nm_kota_asal,
			j.id_kota_tujuan,
			kt.nm_kota_tujuan,
			j.harga,
			DATE_FORMAT(j.tgl_berangkat, '%Y-%m-%d') as tgl_berangkat,
			TIME_FORMAT(j.jam_berangkat, '%H:%i') as jam_berangkat,
			j.id_mobil,
			k.jenis_mobil,
			k.nomor_polisi
		FROM jadwal j
		LEFT JOIN kota_asal ka ON j.id_kota_asal = ka.id_kota_asal
		LEFT JOIN kota_tujuan kt ON j.id_kota_tujuan = kt.id_kota_tujuan
		LEFT JOIN kendaraan k ON j.id_mobil = k.id_mobil
		ORDER BY j.tgl_berangkat DESC, j.jam_berangkat DESC
	`);
	return rows;
}

/**
 * Ambil jadwal berdasarkan id.
 * @param {number} id
 */
export async function findJadwalById(id) {
	const [rows] = await pool.query(`
		SELECT 
			j.id_jadwal,
			j.id_kota_asal,
			ka.nm_kota_asal,
			j.id_kota_tujuan,
			kt.nm_kota_tujuan,
			j.harga,
			DATE_FORMAT(j.tgl_berangkat, '%Y-%m-%d') as tgl_berangkat,
			TIME_FORMAT(j.jam_berangkat, '%H:%i') as jam_berangkat,
			j.id_mobil,
			k.jenis_mobil,
			k.nomor_polisi
		FROM jadwal j
		LEFT JOIN kota_asal ka ON j.id_kota_asal = ka.id_kota_asal
		LEFT JOIN kota_tujuan kt ON j.id_kota_tujuan = kt.id_kota_tujuan
		LEFT JOIN kendaraan k ON j.id_mobil = k.id_mobil
		WHERE j.id_jadwal = ?
	`, [id]);
	return rows[0] ?? null;
}

/**
 * Tambah jadwal baru.
 * @param {{ id_kota_asal: number, id_kota_tujuan: number, harga: number, tgl_berangkat: string, jam_berangkat: string, id_mobil: number }} data
 */
export async function createJadwal(data) {
	const [result] = await pool.query(`
		INSERT INTO jadwal (id_kota_asal, id_kota_tujuan, harga, tgl_berangkat, jam_berangkat, id_mobil)
		VALUES (?, ?, ?, ?, ?, ?)
	`, [data.id_kota_asal, data.id_kota_tujuan, data.harga, data.tgl_berangkat, data.jam_berangkat, data.id_mobil]);
	return result.insertId;
}

/**
 * Update jadwal.
 * @param {number} id
 * @param {{ id_kota_asal: number, id_kota_tujuan: number, harga: number, tgl_berangkat: string, jam_berangkat: string, id_mobil: number }} data
 */
export async function updateJadwal(id, data) {
	const [result] = await pool.query(`
		UPDATE jadwal 
		SET id_kota_asal = ?, id_kota_tujuan = ?, harga = ?, tgl_berangkat = ?, jam_berangkat = ?, id_mobil = ?
		WHERE id_jadwal = ?
	`, [data.id_kota_asal, data.id_kota_tujuan, data.harga, data.tgl_berangkat, data.jam_berangkat, data.id_mobil, id]);
	return result.affectedRows > 0;
}

/**
 * Hapus jadwal.
 * @param {number} id
 */
export async function removeJadwal(id) {
	const [result] = await pool.query('DELETE FROM jadwal WHERE id_jadwal = ?', [id]);
	return result.affectedRows > 0;
}
