import { findAllKeluhan } from '$lib/server/repositories/keluhan';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const keluhanList = await findAllKeluhan();
	return { keluhanList };
}
