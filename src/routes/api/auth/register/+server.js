import { z } from 'zod';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { findMemberByUsername, createMember } from '$lib/server/repositories/member';

const schema = z.object({
	nama: z.string().min(1, 'Nama wajib diisi').max(100),
	alamat: z.string().min(1, 'Alamat wajib diisi').max(100),
	telepon: z.string().min(1, 'Nomor telepon wajib diisi').max(20),
	jen_kelamin: z.enum(['L', 'P'], { message: 'Jenis kelamin harus L atau P' }),
	username: z.string().min(1, 'Username wajib diisi').max(20),
	password: z.string().min(6, 'Password minimal 6 karakter')
});

export async function POST(event) {
	let body;
	try {
		body = await event.request.json();
	} catch {
		return json({ error: { code: 'INVALID_JSON', message: 'Request tidak valid' } }, { status: 400 });
	}

	const result = schema.safeParse(body);
	if (!result.success) {
		const message = result.error.errors[0]?.message ?? 'Data tidak valid';
		return json({ error: { code: 'VALIDATION', message } }, { status: 400 });
	}

	const { nama, alamat, telepon, jen_kelamin, username, password } = result.data;

	// Cek username belum dipakai (kolom tidak memiliki unique key di DB)
	const existing = await findMemberByUsername(username);
	if (existing) {
		return json({ error: { code: 'USERNAME_TAKEN', message: 'Username sudah dipakai' } }, { status: 409 });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	await createMember({ nama, alamat, telepon, jen_kelamin, username, password: hashedPassword });

	// Arahkan ke /login tanpa langsung login
	return json({ data: { redirect: '/login?registered=1' } }, { status: 201 });
}
