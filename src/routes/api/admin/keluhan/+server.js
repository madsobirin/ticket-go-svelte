import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/guard';
import { findAllKeluhan } from '$lib/server/repositories/keluhan';

export async function GET(event) {
	requireRole(event, 'admin');

	try {
		const list = await findAllKeluhan();
		return json({ data: list });
	} catch (err) {
		return json({ error: { code: 'SERVER_ERROR', message: err.message } }, { status: 500 });
	}
}
