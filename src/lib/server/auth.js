const COOKIE_NAME = 'session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 jam

/**
 * Encode session payload ke base64 JSON (bukan enkripsi penuh;
 * untuk produksi tambahkan HMAC dengan SESSION_SECRET).
 * @param {{ role: string, id: number }} payload
 * @returns {string}
 */
function encode(payload) {
	return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * Decode session cookie. Kembalikan null jika tidak valid.
 * @param {string} value
 * @returns {{ role: string, id: number } | null}
 */
function decode(value) {
	try {
		const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
		if (!parsed?.role || !parsed?.id) return null;
		return parsed;
	} catch {
		return null;
	}
}

/**
 * Set session cookie di response.
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {{ role: string, id: number }} payload
 */
export function setSession(event, payload) {
	event.cookies.set(COOKIE_NAME, encode(payload), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: COOKIE_MAX_AGE,
		secure: process.env.NODE_ENV === 'production'
	});
}

/**
 * Hapus session cookie (logout).
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
export function clearSession(event) {
	event.cookies.delete(COOKIE_NAME, { path: '/' });
}

/**
 * Baca session dari cookie. Kembalikan null jika tidak ada atau tidak valid.
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @returns {{ role: string, id: number } | null}
 */
export function getSession(event) {
	const value = event.cookies.get(COOKIE_NAME);
	if (!value) return null;
	return decode(value);
}
