import { pool } from '$lib/server/db';

/**
 * Ambil semua kendaraan.
 * @returns {Promise<Array<{ id_mobil: number, jenis_mobil: string, nomor_polisi: string, warna_mobil: string }>>}
 */
export async function findAllKendaraan() {
	const [rows] = await pool.query('SELECT * FROM kendaraan ORDER BY id_mobil DESC');
	return rows;
}

/**
 * Ambil kendaraan berdasarkan ID.
 * @param {number} id
 * @returns {Promise<{ id_mobil: number, jenis_mobil: string, nomor_polisi: string, warna_mobil: string } | null>}
 */
export async function findKendaraanById(id) {
	const [rows] = await pool.query('SELECT * FROM kendaraan WHERE id_mobil = ?', [id]);
	return rows[0] ?? null;
}

/**
 * Tambah kendaraan baru.
 * @param {{ jenis_mobil: string, nomor_polisi: string, warna_mobil: string }} data
 * @returns {Promise<number>}
 */
export async function createKendaraan(data) {
	const [result] = await pool.query(
		'INSERT INTO kendaraan (jenis_mobil, nomor_polisi, warna_mobil) VALUES (?, ?, ?)',
		[data.jenis_mobil, data.nomor_polisi, data.warna_mobil]
	);
	return result.insertId;
}

/**
 * Update kendaraan.
 * @param {number} id
 * @param {{ jenis_mobil: string, nomor_polisi: string, warna_mobil: string }} data
 * @returns {Promise<boolean>}
 */
export async function updateKendaraan(id, data) {
	const [result] = await pool.query(
		'UPDATE kendaraan SET jenis_mobil = ?, nomor_polisi = ?, warna_mobil = ? WHERE id_mobil = ?',
		[data.jenis_mobil, data.nomor_polisi, data.warna_mobil, id]
	);
	return result.affectedRows > 0;
}

/**
 * Hapus kendaraan.
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function removeKendaraan(id) {
	const [result] = await pool.query('DELETE FROM kendaraan WHERE id_mobil = ?', [id]);
	return result.affectedRows > 0;
}
