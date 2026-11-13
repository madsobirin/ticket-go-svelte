import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/guard';
import { findPesananByMember } from '$lib/server/repositories/pesan';

export async function GET(event) {
	const user = requireRole(event, 'member');
	const items = await findPesananByMember(user.id);
	return json({ data: items });
}
