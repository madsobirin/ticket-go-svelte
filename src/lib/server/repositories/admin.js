import { pool } from '$lib/server/db';

/**
 * Cari admin berdasarkan email.
 * @param {string} email
 * @returns {Promise<{ id_admin: number, email: string, password: string } | null>}
 */
export async function findAdminByEmail(email) {
	const [rows] = await pool.query('SELECT id_admin, email, password FROM admin WHERE email = ?', [email]);
	return rows[0] ?? null;
}

/**
 * Update password admin (untuk konversi plaintext ke hash).
 * @param {number} id
 * @param {string} hashedPassword
 */
export async function updateAdminPassword(id, hashedPassword) {
	await pool.query('UPDATE admin SET password = ? WHERE id_admin = ?', [hashedPassword, id]);
}
