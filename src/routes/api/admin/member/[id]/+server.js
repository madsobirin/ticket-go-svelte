import { json } from '@sveltejs/kit';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { requireRole } from '$lib/server/guard';
import { pool } from '$lib/server/db';

const updateMemberSchema = z.object({
	nama: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
	alamat: z.string().min(3, 'Alamat minimal 3 karakter').max(100, 'Alamat maksimal 100 karakter'),
	telepon: z.string().min(8, 'Nomor telepon minimal 8 digit').max(20, 'Nomor telepon maksimal 20 digit'),
	jen_kelamin: z.enum(['L', 'P'], { message: 'Jenis kelamin harus L atau P' }),
	username: z.string().min(3, 'Username minimal 3 karakter').max(20, 'Username maksimal 20 karakter'),
	password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal(''))
});

export async function PUT(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);

	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID member tidak valid' } }, { status: 400 });
	}

	let body;
	try {
		body = await event.request.json();
	} catch {
		return json({ error: { code: 'INVALID_JSON', message: 'Request tidak valid' } }, { status: 400 });
	}

	const parsed = updateMemberSchema.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.errors[0]?.message ?? 'Data tidak valid';
		return json({ error: { code: 'VALIDATION', message } }, { status: 400 });
	}

	const [existingUsername] = await pool.query(
		'SELECT id_member FROM member WHERE username = ? AND id_member != ?',
		[parsed.data.username, id]
	);
	if (existingUsername.length > 0) {
		return json({ error: { code: 'USERNAME_TAKEN', message: 'Username sudah digunakan oleh member lain' } }, { status: 409 });
	}

	if (parsed.data.password && parsed.data.password.trim().length >= 6) {
		const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
		await pool.query(
			'UPDATE member SET nama = ?, alamat = ?, telepon = ?, jen_kelamin = ?, username = ?, password = ? WHERE id_member = ?',
			[parsed.data.nama, parsed.data.alamat, parsed.data.telepon, parsed.data.jen_kelamin, parsed.data.username, hashedPassword, id]
		);
	} else {
		await pool.query(
			'UPDATE member SET nama = ?, alamat = ?, telepon = ?, jen_kelamin = ?, username = ? WHERE id_member = ?',
			[parsed.data.nama, parsed.data.alamat, parsed.data.telepon, parsed.data.jen_kelamin, parsed.data.username, id]
		);
	}

	return json({ data: { id_member: id, message: 'Member berhasil diperbarui' } });
}

export async function DELETE(event) {
	requireRole(event, 'admin');
	const id = Number(event.params.id);

	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID member tidak valid' } }, { status: 400 });
	}

	// Cek apakah member punya transaksi aktif
	const [activeBookings] = await pool.query(
		"SELECT id_pesan FROM pesan WHERE id_member = ? AND status IN ('Dalam Proses', 'Lunas')",
		[id]
	);
	if (activeBookings.length > 0) {
		return json({
			error: {
				code: 'ACTIVE_BOOKINGS',
				message: 'Member tidak dapat dihapus karena memiliki riwayat tiket aktif/lunas'
			}
		}, { status: 409 });
	}

	// Hapus pesan lama / konfirmasi jika ada
	await pool.query('DELETE FROM konfirmasi_pesan WHERE id_pesan IN (SELECT id_pesan FROM pesan WHERE id_member = ?)', [id]);
	await pool.query('DELETE FROM pesan WHERE id_member = ?', [id]);
	await pool.query('DELETE FROM keluhan WHERE id_member = ?', [id]);
	await pool.query('DELETE FROM member WHERE id_member = ?', [id]);

	return json({ data: { message: 'Member berhasil dihapus' } });
}
