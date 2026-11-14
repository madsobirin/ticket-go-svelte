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
 * Ambil semua kota asal dengan statistik jumlah jadwal.
 */
export async function findAllKotaAsalWithStats() {
	const [rows] = await pool.query(`
		SELECT 
			k.id_kota_asal, 
			k.nm_kota_asal,
			(SELECT COUNT(*) FROM jadwal j WHERE j.id_kota_asal = k.id_kota_asal) as total_jadwal
		FROM kota_asal k 
		ORDER BY k.id_kota_asal DESC
	`);
	return rows;
}

/**
 * Ambil semua kota tujuan dengan statistik jumlah jadwal.
 */
export async function findAllKotaTujuanWithStats() {
	const [rows] = await pool.query(`
		SELECT 
			k.id_kota_tujuan, 
			k.nm_kota_tujuan,
			(SELECT COUNT(*) FROM jadwal j WHERE j.id_kota_tujuan = k.id_kota_tujuan) as total_jadwal
		FROM kota_tujuan k 
		ORDER BY k.id_kota_tujuan DESC
	`);
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
 * Cek duplikat nama kota asal.
 */
export async function findKotaAsalByName(name, excludeId = null) {
	let query = 'SELECT * FROM kota_asal WHERE LOWER(TRIM(nm_kota_asal)) = LOWER(TRIM(?))';
	const params = [name];
	if (excludeId) {
		query += ' AND id_kota_asal != ?';
		params.push(excludeId);
	}
	const [rows] = await pool.query(query, params);
	return rows[0] ?? null;
}

/**
 * Tambah kota asal baru.
 */
export async function createKotaAsal({ nm_kota_asal }) {
	const [res] = await pool.query('INSERT INTO kota_asal (nm_kota_asal) VALUES (?)', [nm_kota_asal]);
	return res.insertId;
}

/**
 * Update nama kota asal.
 */
export async function updateKotaAsal(id, { nm_kota_asal }) {
	await pool.query('UPDATE kota_asal SET nm_kota_asal = ? WHERE id_kota_asal = ?', [nm_kota_asal, id]);
}

/**
 * Cek jumlah jadwal yang menggunakan kota asal ini.
 */
export async function findKotaAsalUsage(id) {
	const [rows] = await pool.query('SELECT COUNT(*) as count FROM jadwal WHERE id_kota_asal = ?', [id]);
	return Number(rows[0]?.count ?? 0);
}

/**
 * Hapus kota asal.
 */
export async function deleteKotaAsal(id) {
	await pool.query('DELETE FROM kota_asal WHERE id_kota_asal = ?', [id]);
}

/**
 * Ambil satu kota tujuan berdasarkan id.
 * @param {number} id
 */
export async function findKotaTujuanById(id) {
	const [rows] = await pool.query('SELECT * FROM kota_tujuan WHERE id_kota_tujuan = ?', [id]);
	return rows[0] ?? null;
}

/**
 * Cek duplikat nama kota tujuan.
 */
export async function findKotaTujuanByName(name, excludeId = null) {
	let query = 'SELECT * FROM kota_tujuan WHERE LOWER(TRIM(nm_kota_tujuan)) = LOWER(TRIM(?))';
	const params = [name];
	if (excludeId) {
		query += ' AND id_kota_tujuan != ?';
		params.push(excludeId);
	}
	const [rows] = await pool.query(query, params);
	return rows[0] ?? null;
}

/**
 * Tambah kota tujuan baru.
 */
export async function createKotaTujuan({ nm_kota_tujuan }) {
	const [res] = await pool.query('INSERT INTO kota_tujuan (nm_kota_tujuan) VALUES (?)', [nm_kota_tujuan]);
	return res.insertId;
}

/**
 * Update nama kota tujuan.
 */
export async function updateKotaTujuan(id, { nm_kota_tujuan }) {
	await pool.query('UPDATE kota_tujuan SET nm_kota_tujuan = ? WHERE id_kota_tujuan = ?', [nm_kota_tujuan, id]);
}

/**
 * Cek jumlah jadwal yang menggunakan kota tujuan ini.
 */
export async function findKotaTujuanUsage(id) {
	const [rows] = await pool.query('SELECT COUNT(*) as count FROM jadwal WHERE id_kota_tujuan = ?', [id]);
	return Number(rows[0]?.count ?? 0);
}

/**
 * Hapus kota tujuan.
 */
export async function deleteKotaTujuan(id) {
	await pool.query('DELETE FROM kota_tujuan WHERE id_kota_tujuan = ?', [id]);
}
