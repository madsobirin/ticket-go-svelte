import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (locals.user) {
		const dest = { admin: '/admin', operator: '/operator', member: '/member' };
		throw redirect(302, dest[locals.user.role] ?? '/');
	}
}
