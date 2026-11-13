import { findKeluhanByMember } from '$lib/server/repositories/keluhan';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const keluhanList = await findKeluhanByMember(locals.user.id);
	return { keluhanList };
}
