import { pool } from '$lib/server/db';

/**
 * Cari member berdasarkan username.
 * @param {string} username
 * @returns {Promise<{ id_member: number, username: string, password: string } | null>}
 */
export async function findMemberByUsername(username) {
	const [rows] = await pool.query('SELECT id_member, nama, username, password FROM member WHERE username = ?', [username]);
	return rows[0] ?? null;
}

/**
 * Cari member berdasarkan ID.
 * @param {number} id
 */
export async function findMemberById(id) {
	const [rows] = await pool.query('SELECT id_member, nama, alamat, telepon, jen_kelamin, username FROM member WHERE id_member = ?', [id]);
	return rows[0] ?? null;
}

/**
 * Update password member (untuk konversi plaintext ke hash).
 * @param {number} id
 * @param {string} hashedPassword
 */
export async function updateMemberPassword(id, hashedPassword) {
	await pool.query('UPDATE member SET password = ? WHERE id_member = ?', [hashedPassword, id]);
}

/**
 * Buat member baru. Kembalikan id_member yang baru.
 * @param {{ nama: string, alamat: string, telepon: string, jen_kelamin: 'L'|'P', username: string, password: string }} data
 * @returns {Promise<number>}
 */
export async function createMember(data) {
	const [result] = await pool.query(
		'INSERT INTO member (nama, alamat, telepon, jen_kelamin, username, password) VALUES (?, ?, ?, ?, ?, ?)',
		[data.nama, data.alamat, data.telepon, data.jen_kelamin, data.username, data.password]
	);
	return result.insertId;
}
