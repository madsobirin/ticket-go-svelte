import { pool } from '$lib/server/db';

/**
 * Buat keluhan baru dari member.
 * @param {{ id_member: number, j_keluhan: string, d_keluhan: string }} data
 */
export async function createKeluhan({ id_member, j_keluhan, d_keluhan }) {
	const [result] = await pool.query(
		'INSERT INTO keluhan (id_member, j_keluhan, d_keluhan) VALUES (?, ?, ?)',
		[id_member, j_keluhan, d_keluhan]
	);
	return {
		id_keluhan: result.insertId,
		id_member,
		j_keluhan,
		d_keluhan
	};
}

/**
 * Ambil semua keluhan untuk admin.
 */
export async function findAllKeluhan() {
	const [rows] = await pool.query(`
		SELECT 
			k.id_keluhan,
			k.id_member,
			COALESCE(m.nama, 'Member #') as nama_member,
			COALESCE(m.telepon, '-') as telepon_member,
			k.j_keluhan,
			k.d_keluhan
		FROM keluhan k
		LEFT JOIN member m ON k.id_member = m.id_member
		ORDER BY k.id_keluhan DESC
	`);
	return rows;
}

/**
 * Ambil daftar keluhan milik member tertentu.
 * @param {number} id_member
 */
export async function findKeluhanByMember(id_member) {
	const [rows] = await pool.query(
		'SELECT id_keluhan, j_keluhan, d_keluhan FROM keluhan WHERE id_member = ? ORDER BY id_keluhan DESC',
		[id_member]
	);
	return rows;
}
