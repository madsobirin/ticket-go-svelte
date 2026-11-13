import { getSession } from '$lib/server/auth';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Baca session dari cookie dan taruh di event.locals.user
	event.locals.user = getSession(event);

	return resolve(event);
}
