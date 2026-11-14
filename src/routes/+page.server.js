import { findMemberById } from '$lib/server/repositories/member';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	let user = null;
	if (locals.user && locals.user.role === 'member') {
		const profile = await findMemberById(locals.user.id);
		user = {
			...locals.user,
			name: profile?.nama || locals.user.name || 'Member',
			nama: profile?.nama || locals.user.name || 'Member',
			username: profile?.username || ''
		};
	} else if (locals.user) {
		user = locals.user;
	}

	return {
		user
	};
}
