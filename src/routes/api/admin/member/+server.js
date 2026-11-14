import { json } from '@sveltejs/kit';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { requireRole } from '$lib/server/guard';
import { pool } from '$lib/server/db';

const createMemberSchema = z.object({
	nama: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
	alamat: z.string().min(3, 'Alamat minimal 3 karakter').max(100, 'Alamat maksimal 100 karakter'),
	telepon: z.string().min(8, 'Nomor telepon minimal 8 digit').max(20, 'Nomor telepon maksimal 20 digit'),
	jen_kelamin: z.enum(['L', 'P'], { message: 'Jenis kelamin harus L atau P' }),
	username: z.string().min(3, 'Username minimal 3 karakter').max(20, 'Username maksimal 20 karakter'),
	password: z.string().min(6, 'Password minimal 6 karakter')
});

export async function GET(event) {
	requireRole(event, 'admin');

	const [members] = await pool.query(`
		SELECT 
			m.id_member,
			m.nama,
			m.alamat,
			m.telepon,
			m.jen_kelamin,
			m.username,
			(SELECT COUNT(*) FROM pesan p WHERE p.id_member = m.id_member) as total_pesanan,
			(SELECT COUNT(*) FROM pesan p WHERE p.id_member = m.id_member AND p.status = 'Lunas') as pesanan_lunas
		FROM member m
		ORDER BY m.id_member DESC
	`);

	return json({ data: members });
}

export async function POST(event) {
	requireRole(event, 'admin');

	let body;
	try {
		body = await event.request.json();
	} catch {
		return json({ error: { code: 'INVALID_JSON', message: 'Request tidak valid' } }, { status: 400 });
	}

	const parsed = createMemberSchema.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.errors[0]?.message ?? 'Data tidak valid';
		return json({ error: { code: 'VALIDATION', message } }, { status: 400 });
	}

	const [existing] = await pool.query('SELECT id_member FROM member WHERE username = ?', [parsed.data.username]);
	if (existing.length > 0) {
		return json({ error: { code: 'USERNAME_TAKEN', message: 'Username sudah digunakan' } }, { status: 409 });
	}

	const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
	const [result] = await pool.query(
		'INSERT INTO member (nama, alamat, telepon, jen_kelamin, username, password) VALUES (?, ?, ?, ?, ?, ?)',
		[parsed.data.nama, parsed.data.alamat, parsed.data.telepon, parsed.data.jen_kelamin, parsed.data.username, hashedPassword]
	);

	return json({
		data: {
			id_member: result.insertId,
			nama: parsed.data.nama,
			username: parsed.data.username
		}
	}, { status: 201 });
}
