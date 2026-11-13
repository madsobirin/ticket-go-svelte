import { json, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { setSession } from '$lib/server/auth';
import { findAdminByEmail, updateAdminPassword } from '$lib/server/repositories/admin';
import { findOperatorByUser, updateOperatorPassword } from '$lib/server/repositories/operator';
import { findMemberByUsername, updateMemberPassword } from '$lib/server/repositories/member';

/**
 * Verifikasi password: coba bcrypt dulu, lalu fallback ke plaintext untuk akun lama.
 * Jika cocok via plaintext, hash ulang dan simpan (konversi bertahap).
 *
 * @param {string} input Password yang dikirim user.
 * @param {string} stored Password yang tersimpan di DB.
 * @param {(hashed: string) => Promise<void>} onUpgrade Callback untuk simpan hash baru.
 * @returns {Promise<boolean>}
 */
async function verifyPassword(input, stored, onUpgrade) {
	// Coba verifikasi sebagai bcrypt hash
	const looksLikeHash = stored.startsWith('$2b$') || stored.startsWith('$2a$');
	if (looksLikeHash) {
		return bcrypt.compare(input, stored);
	}

	// Fallback: bandingkan plaintext (akun lama)
	if (input === stored) {
		// Konversi ke hash. Kolom password di tabel admin dan operator_loket varchar(50),
		// cukup untuk hash bcrypt rounds rendah (tapi bcrypt standar ~60 karakter).
		// Kolom member.password varchar(20) TERLALU PENDEK untuk hash — jangan upgrade member.
		if (onUpgrade) {
			try {
				const hashed = await bcrypt.hash(input, 10);
				await onUpgrade(hashed);
			} catch {
				// Jika kolom terlalu pendek (member), abaikan upgrade; login tetap berhasil.
			}
		}
		return true;
	}

	return false;
}

export async function POST({ request, ...event }) {
	const eventFull = { request, ...event };

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: { code: 'INVALID_JSON', message: 'Request tidak valid' } }, { status: 400 });
	}

	const identifier = typeof body?.identifier === 'string' ? body.identifier.trim() : '';
	const password = typeof body?.password === 'string' ? body.password : '';

	if (!identifier || !password) {
		return json({ error: { code: 'VALIDATION', message: 'Identifier dan password wajib diisi' } }, { status: 400 });
	}

	// ----------------------------------------------------------------
	// Urutan pencarian akun: admin.email → operator_loket.user → member.username
	// Asumsi: tidak ada identifier yang sama di dua tabel berbeda.
	// Jika ada konflik, admin akan selalu menang karena diperiksa lebih dulu.
	// ----------------------------------------------------------------

	// 1. Cek tabel admin (kolom: email)
	const admin = await findAdminByEmail(identifier);
	if (admin) {
		const valid = await verifyPassword(password, admin.password, (hashed) =>
			updateAdminPassword(admin.id_admin, hashed)
		);
		if (!valid) {
			return json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifier atau password salah' } }, { status: 401 });
		}
		setSession(eventFull, { role: 'admin', id: admin.id_admin });
		return json({ data: { role: 'admin', redirect: '/admin' } });
	}

	// 2. Cek tabel operator_loket (kolom: user)
	const operator = await findOperatorByUser(identifier);
	if (operator) {
		const valid = await verifyPassword(password, operator.password, (hashed) =>
			updateOperatorPassword(operator.id_opr, hashed)
		);
		if (!valid) {
			return json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifier atau password salah' } }, { status: 401 });
		}
		setSession(eventFull, { role: 'operator', id: operator.id_opr });
		return json({ data: { role: 'operator', redirect: '/operator' } });
	}

	// 3. Cek tabel member (kolom: username)
	const member = await findMemberByUsername(identifier);
	if (member) {
		// Upgrade hash member kini aman: kolom sudah varchar(255)
		const valid = await verifyPassword(password, member.password, (hashed) =>
			updateMemberPassword(member.id_member, hashed)
		);
		if (!valid) {
			return json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifier atau password salah' } }, { status: 401 });
		}
		setSession(eventFull, { role: 'member', id: member.id_member });
		return json({ data: { role: 'member', redirect: '/member' } });
	}

	// Tidak ditemukan di tabel manapun
	return json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifier atau password salah' } }, { status: 401 });
}
