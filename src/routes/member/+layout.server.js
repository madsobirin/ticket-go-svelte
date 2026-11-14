import { redirect } from '@sveltejs/kit';
import { findMemberById } from '$lib/server/repositories/member';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url }) {
	const isProtected =
		url.pathname.startsWith('/member/pesanan') || url.pathname.startsWith('/member/keluhan');

	if (!locals.user || locals.user.role !== 'member') {
		if (isProtected) {
			throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
		}
		return {
			user: null
		};
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
