import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/guard';
import { pool } from '$lib/server/db';

export async function GET(event) {
	const url = event.url;
	const idKotaAsal = url.searchParams.get('id_kota_asal');
	const idKotaTujuan = url.searchParams.get('id_kota_tujuan');
	const tanggal = url.searchParams.get('tanggal');

	let query = `
		SELECT 
			j.id_jadwal,
			j.id_kota_asal,
			ka.nm_kota_asal,
			j.id_kota_tujuan,
			kt.nm_kota_tujuan,
			j.harga,
			DATE_FORMAT(j.tgl_berangkat, '%Y-%m-%d') as tgl_berangkat,
			TIME_FORMAT(j.jam_berangkat, '%H:%i') as jam_berangkat,
			j.id_mobil,
			k.jenis_mobil,
			k.nomor_polisi,
			(SELECT COUNT(*) FROM pesan p WHERE p.id_jadwal = j.id_jadwal) as kursi_terisi,
			GREATEST(0, 8 - (SELECT COUNT(*) FROM pesan p WHERE p.id_jadwal = j.id_jadwal)) as sisa_kursi
		FROM jadwal j
		LEFT JOIN kota_asal ka ON j.id_kota_asal = ka.id_kota_asal
		LEFT JOIN kota_tujuan kt ON j.id_kota_tujuan = kt.id_kota_tujuan
		LEFT JOIN kendaraan k ON j.id_mobil = k.id_mobil
		WHERE CONCAT(j.tgl_berangkat, ' ', j.jam_berangkat) >= NOW()
	`;
	const params = [];

	if (idKotaAsal) {
		query += ' AND j.id_kota_asal = ?';
		params.push(Number(idKotaAsal));
	}
	if (idKotaTujuan) {
		query += ' AND j.id_kota_tujuan = ?';
		params.push(Number(idKotaTujuan));
	}
	if (tanggal) {
		query += ' AND j.tgl_berangkat = ?';
		params.push(tanggal);
	}

	query += ' ORDER BY j.tgl_berangkat ASC, j.jam_berangkat ASC';

	try {
		const [rows] = await pool.query(query, params);
		return json({ data: rows });
	} catch (err) {
		console.error('API member jadwal error:', err);
		return json({ error: { code: 'DATABASE_ERROR', message: `Database error: ${err.message}` } }, { status: 500 });
	}
}
