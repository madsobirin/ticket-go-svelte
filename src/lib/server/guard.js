import { error } from '@sveltejs/kit';

/**
 * Guard: pastikan user sudah login dan rolenya sesuai.
 * Lempar 401 jika belum login, 403 jika role tidak sesuai.
 *
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {...string} roles Role yang diizinkan, misal 'admin', 'member', 'operator'.
 * @returns {{ role: string, id: number }}
 */
export function requireRole(event, ...roles) {
	const user = event.locals.user;

	if (!user) {
		throw error(401, 'Belum login');
	}

	if (!roles.includes(user.role)) {
		throw error(403, 'Akses ditolak');
	}

	return user;
}
