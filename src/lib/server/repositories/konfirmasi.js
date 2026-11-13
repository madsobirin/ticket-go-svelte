import { pool } from '$lib/server/db';

/**
 * Cek apakah konfirmasi pembayaran untuk suatu pesanan sudah ada.
 * @param {number} id_pesan
 * @param {any} conn
 */
export async function findKonfirmasiByPesananId(id_pesan, conn = pool) {
	const [rows] = await conn.query(
		'SELECT * FROM konfirmasi_pesan WHERE id_pesan = ?',
		[id_pesan]
	);
	return rows[0] ?? null;
}

/**
 * Cek nomor resi.
 * @param {string} no_resi
 * @param {any} conn
 */
export async function findKonfirmasiByResi(no_resi, conn = pool) {
	const [rows] = await conn.query(
		'SELECT * FROM konfirmasi_pesan WHERE no_resi = ?',
		[no_resi]
	);
	return rows[0] ?? null;
}

/**
 * Insert konfirmasi pembayaran.
 * @param {{ no_resi: string, no_rek: any, tgl_transfer: string, jam_transfer: string, id_pesan: number }} data
 * @param {any} conn
 */
export async function createKonfirmasi(data, conn = pool) {
	// Kolom no_rek bertipe int di DB
	const noRekInt = parseInt(String(data.no_rek).replace(/\D/g, ''), 10) || 0;

	await conn.query(`
		INSERT INTO konfirmasi_pesan (no_resi, no_rek, tgl_transfer, jam_transfer, id_pesan)
		VALUES (?, ?, ?, ?, ?)
	`, [data.no_resi, noRekInt, data.tgl_transfer, data.jam_transfer, data.id_pesan]);

	return true;
}
