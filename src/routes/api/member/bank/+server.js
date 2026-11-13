import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/guard';
import { banks } from '$lib/server/config/bank';

export async function GET(event) {
	requireRole(event, 'member');
	return json({ data: banks });
}
