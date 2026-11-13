import { pool } from '$lib/server/db';

/**
 * Ambil semua kota asal.
 * @returns {Promise<Array<{ id_kota_asal: number, nm_kota_asal: string }>>}
 */
export async function findAllKotaAsal() {
	const [rows] = await pool.query('SELECT id_kota_asal, nm_kota_asal FROM kota_asal ORDER BY id_kota_asal ASC');
	return rows;
}

/**
 * Ambil semua kota tujuan.
 * @returns {Promise<Array<{ id_kota_tujuan: number, nm_kota_tujuan: string }>>}
 */
export async function findAllKotaTujuan() {
	const [rows] = await pool.query('SELECT id_kota_tujuan, nm_kota_tujuan FROM kota_tujuan ORDER BY id_kota_tujuan ASC');
	return rows;
}

/**
 * Ambil satu kota asal berdasarkan id.
 * @param {number} id
 */
export async function findKotaAsalById(id) {
	const [rows] = await pool.query('SELECT * FROM kota_asal WHERE id_kota_asal = ?', [id]);
	return rows[0] ?? null;
}

/**
 * Ambil satu kota tujuan berdasarkan id.
 * @param {number} id
 */
export async function findKotaTujuanById(id) {
	const [rows] = await pool.query('SELECT * FROM kota_tujuan WHERE id_kota_tujuan = ?', [id]);
	return rows[0] ?? null;
}
