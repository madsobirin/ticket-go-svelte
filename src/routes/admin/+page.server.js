import { pool } from '$lib/server/db';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const [[stats]] = await pool.query(`
		SELECT 
			(SELECT COUNT(*) FROM pesan) as total_penumpang,
			(SELECT COUNT(*) FROM pesan WHERE status = 'Dalam Proses') as pending_verifikasi,
			(SELECT COUNT(*) FROM pesan WHERE status = 'Lunas') as total_lunas,
			(SELECT COALESCE(SUM(j.harga), 0) FROM pesan p JOIN jadwal j ON p.id_jadwal = j.id_jadwal WHERE p.status = 'Lunas') as pendapatan_lunas,
			(SELECT COUNT(*) FROM kendaraan) as total_armada,
			(SELECT COUNT(*) FROM jadwal) as total_jadwal
	`);

	const [pendingList] = await pool.query(`
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
		WHERE p.status = 'Dalam Proses'
		ORDER BY p.id_pesan DESC
		LIMIT 10
	`);

	// List upcoming departures for operational manifest table
	const [jadwalList] = await pool.query(`
		SELECT 
			j.id_jadwal,
			DATE_FORMAT(j.tgl_berangkat, '%Y-%m-%d') as tgl_berangkat,
			TIME_FORMAT(j.jam_berangkat, '%H:%i') as jam_berangkat,
			j.harga,
			ka.nm_kota_asal,
			kt.nm_kota_tujuan,
			k.jenis_mobil,
			k.nomor_polisi,
			5 as kapasitas,
			(SELECT COUNT(*) FROM pesan p WHERE p.id_jadwal = j.id_jadwal AND p.status IN ('Dalam Proses', 'Lunas')) as terisi
		FROM jadwal j
		LEFT JOIN kota_asal ka ON j.id_kota_asal = ka.id_kota_asal
		LEFT JOIN kota_tujuan kt ON j.id_kota_tujuan = kt.id_kota_tujuan
		LEFT JOIN kendaraan k ON j.id_mobil = k.id_mobil
		ORDER BY j.tgl_berangkat ASC, j.jam_berangkat ASC
		LIMIT 6
	`);

	return {
		stats,
		pendingList,
		jadwalList
	};
}
