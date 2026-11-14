import { pool } from '$lib/server/db';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const [[stats]] = await pool.query(`
		SELECT 
			(SELECT COUNT(*) FROM member) as total_member,
			(SELECT COUNT(*) FROM jadwal) as total_jadwal,
			(SELECT COUNT(*) FROM kota_asal) as total_kota_asal,
			(SELECT COUNT(*) FROM kota_tujuan) as total_kota_tujuan,
			(SELECT COUNT(*) FROM kendaraan) as total_armada,
			(SELECT COUNT(*) FROM keluhan) as total_keluhan,
			(SELECT COUNT(*) FROM pesan) as total_penumpang
	`);

	// List upcoming departures for operational manifest table (Use Case: Jadwal & Kendaraan)
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

	// List recent member registrations (Use Case: Data Member)
	const [memberList] = await pool.query(`
		SELECT 
			m.id_member,
			m.nama,
			m.telepon,
			m.jen_kelamin,
			m.username,
			(SELECT COUNT(*) FROM pesan p WHERE p.id_member = m.id_member) as total_pesanan
		FROM member m
		ORDER BY m.id_member DESC
		LIMIT 5
	`);

	// List recent complaints (Use Case: Keluhan)
	const [keluhanList] = await pool.query(`
		SELECT 
			k.id_keluhan,
			k.j_keluhan,
			k.d_keluhan,
			m.nama as nama_member,
			m.telepon as telepon_member
		FROM keluhan k
		JOIN member m ON k.id_member = m.id_member
		ORDER BY k.id_keluhan DESC
		LIMIT 5
	`);

	return {
		stats,
		jadwalList,
		memberList,
		keluhanList
	};
}
