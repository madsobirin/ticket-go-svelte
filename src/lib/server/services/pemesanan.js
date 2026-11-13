import { pool } from '$lib/server/db';
import { findJadwalById } from '$lib/server/repositories/jadwal';
import { formatResi } from '$lib/server/repositories/pesan';
import { createKonfirmasi, findKonfirmasiByPesananId, findKonfirmasiByResi } from '$lib/server/repositories/konfirmasi';

/**
 * Pesan kursi dengan transaksi dan SELECT ... FOR UPDATE.
 *
 * @param {{ id_jadwal: number, id_member: number, kursiList: number[] }} param0
 * @returns {Promise<{ created: number[], id_jadwal: number, first_id_pesan: number }>}
 */
export async function pesanKursi({ id_jadwal, id_member, kursiList }) {
	if (!kursiList || kursiList.length === 0) {
		const err = new Error('Pilih minimal 1 kursi');
		err.status = 400;
		throw err;
	}
	if (kursiList.length > 5) {
		const err = new Error('Maksimal pemesanan 5 kursi');
		err.status = 400;
		throw err;
	}

	for (const seat of kursiList) {
		if (seat < 1 || seat > 5) {
			const err = new Error('Nomor kursi harus antara 1 sampai 5');
			err.status = 400;
			throw err;
		}
	}

	// 1. Cek jadwal
	const jadwal = await findJadwalById(id_jadwal);
	if (!jadwal) {
		const err = new Error('Jadwal tidak ditemukan');
		err.status = 404;
		throw err;
	}

	// Cek jadwal belum lewat
	const departureTime = new Date(`${jadwal.tgl_berangkat}T${jadwal.jam_berangkat}:00`);
	if (departureTime < new Date()) {
		const err = new Error('Jadwal keberangkatan ini sudah lewat');
		err.status = 400;
		throw err;
	}

	// 2. Buka koneksi transaksi
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();

		const createdIds = [];

		for (const seat of kursiList) {
			// 3. Cek kursi dengan lock FOR UPDATE
			const [existing] = await conn.query(
				'SELECT id_pesan, nomor_kursi FROM pesan WHERE id_jadwal = ? AND nomor_kursi = ? FOR UPDATE',
				[id_jadwal, String(seat)]
			);

			if (existing.length > 0) {
				const err = new Error(`Kursi ${seat} sudah dipesan`);
				err.status = 409;
				throw err;
			}

			// 4. Insert pesan status Belum Bayar
			const [result] = await conn.query(
				'INSERT INTO pesan (nomor_kursi, status, id_jadwal, id_member) VALUES (?, ?, ?, ?)',
				[String(seat), 'Belum Bayar', id_jadwal, id_member]
			);
			createdIds.push(result.insertId);
		}

		await conn.commit();
		return { created: createdIds, id_jadwal, first_id_pesan: createdIds[0] };
	} catch (err) {
		await conn.rollback();
		throw err;
	} finally {
		conn.release();
	}
}

/**
 * Kirim bukti transfer ke meja loket.
 * Resi dibuat otomatis oleh server: PSN-XXXX dari id_pesan.
 *
 * @param {{ id_pesan: number, id_member: number, no_rek: string, tgl_transfer: string, jam_transfer: string }} param0
 */
export async function kirimBuktiKeLoket({ id_pesan, id_member, no_rek, tgl_transfer, jam_transfer }) {
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();

		// 1. Lock baris pesanan
		const [rows] = await conn.query(
			'SELECT id_pesan, id_member, status FROM pesan WHERE id_pesan = ? FOR UPDATE',
			[id_pesan]
		);
		const pesan = rows[0];

		if (!pesan) {
			const err = new Error('Pesanan tidak ditemukan');
			err.status = 404;
			throw err;
		}

		// 2. Pastikan milik member
		if (pesan.id_member !== id_member) {
			const err = new Error('Akses ditolak: bukan pesanan milik Anda');
			err.status = 403;
			throw err;
		}

		// 3. Status harus Belum Bayar
		if (pesan.status !== 'Belum Bayar') {
			const err = new Error('Bukti transfer hanya bisa dikirim untuk pesanan berstatus Belum Bayar');
			err.status = 409;
			throw err;
		}

		// 4. Cek belum pernah ada di konfirmasi_pesan
		const existingKonfirmasi = await findKonfirmasiByPesananId(id_pesan, conn);
		if (existingKonfirmasi) {
			const err = new Error('Bukti transfer sudah pernah dikirim untuk pesanan ini');
			err.status = 409;
			throw err;
		}

		// 5. Generate no_resi server-side dari id_pesan
		const no_resi = formatResi(id_pesan);

		const existingResi = await findKonfirmasiByResi(no_resi, conn);
		if (existingResi) {
			const err = new Error('Nomor resi sudah terdaftar');
			err.status = 409;
			throw err;
		}

		// 6. Insert konfirmasi dan ubah status jadi Dalam Proses
		await createKonfirmasi({ no_resi, no_rek, tgl_transfer, jam_transfer, id_pesan }, conn);
		await conn.query('UPDATE pesan SET status = ? WHERE id_pesan = ?', ['Dalam Proses', id_pesan]);

		await conn.commit();
		return { ok: true, id_pesan, no_resi };
	} catch (err) {
		await conn.rollback();
		throw err;
	} finally {
		conn.release();
	}
}

// Alias kompatibilitas
export const konfirmasiPembayaran = kirimBuktiKeLoket;

/**
 * Operator mengubah status pesanan.
 * Aturan utama:
 * 1. Hanya boleh dari status 'Dalam Proses'.
 * 2. Target status hanya 'Lunas' atau 'Belum Bayar'.
 * 3. Jika target 'Lunas', cukup ubah status.
 * 4. Jika target 'Belum Bayar', ubah status dan hapus konfirmasi_pesan (dalam 1 transaksi).
 *
 * @param {{ id_pesan: number, newStatus: 'Lunas' | 'Belum Bayar' }} param0
 */
export async function operatorUbahStatus({ id_pesan, newStatus }) {
	if (newStatus !== 'Lunas' && newStatus !== 'Belum Bayar') {
		const err = new Error('Status baru harus "Lunas" atau "Belum Bayar"');
		err.status = 400;
		throw err;
	}

	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();

		const [rows] = await conn.query(
			'SELECT id_pesan, status FROM pesan WHERE id_pesan = ? FOR UPDATE',
			[id_pesan]
		);
		const pesan = rows[0];

		if (!pesan) {
			const err = new Error('Pesanan tidak ditemukan');
			err.status = 404;
			throw err;
		}

		// Operator hanya bisa mengubah dari status 'Dalam Proses'
		if (pesan.status !== 'Dalam Proses') {
			const err = new Error(`Perubahan status ditolak: operator hanya dapat mengubah pesanan dari status Dalam Proses (status saat ini: ${pesan.status})`);
			err.status = 409;
			throw err;
		}

		if (newStatus === 'Lunas') {
			await conn.query('UPDATE pesan SET status = ? WHERE id_pesan = ?', ['Lunas', id_pesan]);
		} else if (newStatus === 'Belum Bayar') {
			// Hapus bukti transfer milik pesanan ini agar member bisa kirim ulang
			await conn.query('DELETE FROM konfirmasi_pesan WHERE id_pesan = ?', [id_pesan]);
			await conn.query('UPDATE pesan SET status = ? WHERE id_pesan = ?', ['Belum Bayar', id_pesan]);
		}

		await conn.commit();
		return { id_pesan, status: newStatus };
	} catch (err) {
		await conn.rollback();
		throw err;
	} finally {
		conn.release();
	}
}
