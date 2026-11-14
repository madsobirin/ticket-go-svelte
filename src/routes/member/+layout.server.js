import { redirect } from '@sveltejs/kit';
import { findMemberById } from '$lib/server/repositories/member';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	if (!locals.user || locals.user.role !== 'member') {
		throw redirect(302, '/login');
	}
	const profile = await findMemberById(locals.user.id);
	return {
		user: {
			...locals.user,
			name: profile?.nama || locals.user.name || 'Member',
			nama: profile?.nama || locals.user.name || 'Member',
			username: profile?.username || ''
		}
	};
}
