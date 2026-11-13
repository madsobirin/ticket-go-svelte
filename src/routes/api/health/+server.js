import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function GET() {
	try {
		await pool.query('SELECT 1');
		return json({ data: { ok: true } });
	} catch (err) {
		return json({ error: { code: 'DB_ERROR', message: err.message } }, { status: 500 });
	}
}
