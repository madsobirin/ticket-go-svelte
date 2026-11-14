import { redirect } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(302, '/login');
	}

	const [[{ pendingCount }]] = await pool.query(
		"SELECT COUNT(*) as pendingCount FROM pesan WHERE status = 'Dalam Proses'"
	);

	return {
		user: locals.user,
		pendingCount
	};
}
