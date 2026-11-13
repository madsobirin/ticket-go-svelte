import { pool } from '$lib/server/db';

/**
 * Cari operator berdasarkan kolom `user`.
 * @param {string} username
 * @returns {Promise<{ id_opr: number, user: string, password: string } | null>}
 */
export async function findOperatorByUser(username) {
	const [rows] = await pool.query('SELECT id_opr, user, password FROM operator_loket WHERE user = ?', [username]);
	return rows[0] ?? null;
}

/**
 * Update password operator (untuk konversi plaintext ke hash).
 * @param {number} id
 * @param {string} hashedPassword
 */
export async function updateOperatorPassword(id, hashedPassword) {
	await pool.query('UPDATE operator_loket SET password = ? WHERE id_opr = ?', [hashedPassword, id]);
}
