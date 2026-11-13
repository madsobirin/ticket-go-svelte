import { json } from '@sveltejs/kit';
import { clearSession } from '$lib/server/auth';

export async function DELETE(event) {
	clearSession(event);
	return json({ data: { ok: true } });
}
