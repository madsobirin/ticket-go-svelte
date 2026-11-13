import { pool } from '$lib/server/db';

export function formatResi(idPesan) {
	return `PSN-${String(idPesan).padStart(4, '0')}`;
}

/**
 * Ambil daftar nomor kursi yang sudah dipesan untuk suatu jadwal.
 * @param {number} id_jadwal
 * @returns {Promise<number[]>}
 */
export async function findBookedSeatsByJadwal(id_jadwal) {
	const [rows] = await pool.query(
		'SELECT nomor_kursi FROM pesan WHERE id_jadwal = ?',
		[id_jadwal]
	);
	return rows.map((r) => Number(r.nomor_kursi));
}

/**
 * Ambil semua pesanan milik seorang member dengan join lengkap.
 * @param {number} id_member
 */
export async function findPesananByMember(id_member) {
	const [rows] = await pool.query(`
		SELECT 
			p.id_pesan,
			p.nomor_kursi,
			p.status,
			p.id_jadwal,
			j.harga,
			DATE_FORMAT(j.tgl_berangkat, '%Y-%m-%d') as tgl_berangkat,
			TIME_FORMAT(j.jam_berangkat, '%H:%i') as jam_berangkat,
			ka.nm_kota_asal,
			kt.nm_kota_tujuan,
			k.jenis_mobil,
			k.nomor_polisi,
			CONCAT('PSN-', LPAD(p.id_pesan, 4, '0')) as resi_pesan,
			kp.no_resi as konfirmasi_no_resi,
			COALESCE(kp.no_resi, CONCAT('PSN-', LPAD(p.id_pesan, 4, '0'))) as no_resi,
			kp.no_rek,
			DATE_FORMAT(kp.tgl_transfer, '%Y-%m-%d') as tgl_transfer,
			TIME_FORMAT(kp.jam_transfer, '%H:%i') as jam_transfer
		FROM pesan p
		JOIN jadwal j ON p.id_jadwal = j.id_jadwal
		LEFT JOIN kota_asal ka ON j.id_kota_asal = ka.id_kota_asal
		LEFT JOIN kota_tujuan kt ON j.id_kota_tujuan = kt.id_kota_tujuan
		LEFT JOIN kendaraan k ON j.id_mobil = k.id_mobil
		LEFT JOIN konfirmasi_pesan kp ON p.id_pesan = kp.id_pesan
		WHERE p.id_member = ?
		ORDER BY p.id_pesan DESC
	`, [id_member]);
	return rows;
}

/**
 * Ambil detail satu pesanan berdasarkan ID.
 * @param {number} id_pesan
 */
export async function findPesananById(id_pesan) {
	const [rows] = await pool.query(`
		SELECT 
			p.id_pesan,
			p.nomor_kursi,
			p.status,
			p.id_jadwal,
			p.id_member,
			m.nama as nama_member,
			m.telepon as telepon_member,
			j.harga,
			DATE_FORMAT(j.tgl_berangkat, '%Y-%m-%d') as tgl_berangkat,
			TIME_FORMAT(j.jam_berangkat, '%H:%i') as jam_berangkat,
			ka.nm_kota_asal,
			kt.nm_kota_tujuan,
			k.jenis_mobil,
			k.nomor_polisi,
			CONCAT('PSN-', LPAD(p.id_pesan, 4, '0')) as resi_pesan,
			kp.no_resi as konfirmasi_no_resi,
			COALESCE(kp.no_resi, CONCAT('PSN-', LPAD(p.id_pesan, 4, '0'))) as no_resi,
			kp.no_rek,
			DATE_FORMAT(kp.tgl_transfer, '%Y-%m-%d') as tgl_transfer,
			TIME_FORMAT(kp.jam_transfer, '%H:%i') as jam_transfer
		FROM pesan p
		JOIN member m ON p.id_member = m.id_member
		JOIN jadwal j ON p.id_jadwal = j.id_jadwal
		LEFT JOIN kota_asal ka ON j.id_kota_asal = ka.id_kota_asal
		LEFT JOIN kota_tujuan kt ON j.id_kota_tujuan = kt.id_kota_tujuan
		LEFT JOIN kendaraan k ON j.id_mobil = k.id_mobil
		LEFT JOIN konfirmasi_pesan kp ON p.id_pesan = kp.id_pesan
		WHERE p.id_pesan = ?
	`, [id_pesan]);
	return rows[0] ?? null;
}

/**
 * Ambil semua pesanan (untuk operator) dengan filter status opsional.
 * @param {string|null} statusFilter
 */
export async function findAllPesanan(statusFilter = null) {
	let sql = `
		SELECT 
			p.id_pesan,
			p.nomor_kursi,
			p.status,
			p.id_jadwal,
			p.id_member,
			m.nama as nama_member,
			m.telepon as telepon_member,
			j.harga,
			DATE_FORMAT(j.tgl_berangkat, '%Y-%m-%d') as tgl_berangkat,
			TIME_FORMAT(j.jam_berangkat, '%H:%i') as jam_berangkat,
			ka.nm_kota_asal,
			kt.nm_kota_tujuan,
			k.jenis_mobil,
			k.nomor_polisi,
			CONCAT('PSN-', LPAD(p.id_pesan, 4, '0')) as resi_pesan,
			kp.no_resi as konfirmasi_no_resi,
			COALESCE(kp.no_resi, CONCAT('PSN-', LPAD(p.id_pesan, 4, '0'))) as no_resi,
			kp.no_rek,
			DATE_FORMAT(kp.tgl_transfer, '%Y-%m-%d') as tgl_transfer,
			TIME_FORMAT(kp.jam_transfer, '%H:%i') as jam_transfer
		FROM pesan p
		JOIN member m ON p.id_member = m.id_member
		JOIN jadwal j ON p.id_jadwal = j.id_jadwal
		LEFT JOIN kota_asal ka ON j.id_kota_asal = ka.id_kota_asal
		LEFT JOIN kota_tujuan kt ON j.id_kota_tujuan = kt.id_kota_tujuan
		LEFT JOIN kendaraan k ON j.id_mobil = k.id_mobil
		LEFT JOIN konfirmasi_pesan kp ON p.id_pesan = kp.id_pesan
	`;
	const params = [];
	if (statusFilter) {
		sql += ' WHERE p.status = ?';
		params.push(statusFilter);
	}
	sql += ' ORDER BY p.id_pesan DESC';

	const [rows] = await pool.query(sql, params);
	return rows;
}

/**
 * Update status pesanan.
 * @param {number} id_pesan
 * @param {string} status
 * @param {any} conn
 */
export async function updatePesananStatus(id_pesan, status, conn = pool) {
	const [result] = await conn.query(
		'UPDATE pesan SET status = ? WHERE id_pesan = ?',
		[status, id_pesan]
	);
	return result.affectedRows > 0;
}
