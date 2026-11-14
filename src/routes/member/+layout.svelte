<script>
	import { page } from '$app/state';
	let { data, children } = $props();

	let mobileMenuOpen = $state(false);

	async function logout() {
		await fetch('/api/auth/logout', { method: 'DELETE' });
		window.location.href = '/login';
	}
</script>

<div class="min-h-screen bg-white flex flex-col md:flex-row text-slate-800 antialiased font-sans">
	<!-- Mobile Header -->
	<header class="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-30">
		<a href="/member" class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
				<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M8 6v6" /><path d="M16 6v6" /><path d="M4 6h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
					<circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
				</svg>
			</div>
			<div class="flex items-center gap-1">
				<span class="font-bold text-slate-900 text-base tracking-tight">Lampung Travel</span>
				<span class="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"></span>
			</div>
		</a>
		<button
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			aria-label="Toggle menu"
			class="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if mobileMenuOpen}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</header>

	<!-- Sidebar Overlay for mobile -->
	{#if mobileMenuOpen}
		<button
			type="button"
			tabindex="0"
			class="fixed inset-0 bg-slate-900/30 z-40 md:hidden backdrop-blur-xs transition-opacity cursor-default border-none w-full text-left"
			onclick={() => (mobileMenuOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (mobileMenuOpen = false)}
			aria-label="Tutup menu navigasi"
		></button>
	{/if}

	<!-- Left Sidebar -->
	<aside
		class={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-64 bg-white border-r border-gray-100 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
			mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
		}`}
	>
		<div class="p-5 flex-1 flex flex-col overflow-y-auto">
			<!-- Brand Header -->
			<div class="flex items-center gap-2.5 mb-6">
				<div class="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
					<svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M8 6v6" /><path d="M16 6v6" /><path d="M4 6h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
						<circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
					</svg>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="font-extrabold text-slate-900 text-base tracking-tight">Lampung Travel</span>
					<span class="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"></span>
				</div>
			</div>

			<!-- Sidebar Search input -->
			<div class="relative mb-5">
				<span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8" stroke-width="2" />
						<path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" />
					</svg>
				</span>
				<input
					type="text"
					placeholder="Cari menu atau tiket..."
					class="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
				/>
			</div>

			<!-- Navigation Links -->
			<nav class="space-y-1.5 flex-1">
				<a
					href="/member"
					onclick={() => (mobileMenuOpen = false)}
					class={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
						page.url.pathname === '/member'
							? 'bg-slate-50 text-slate-900 border border-slate-200 shadow-xs'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
					}`}
				>
					<svg class={`w-4.5 h-4.5 ${page.url.pathname === '/member' ? 'text-slate-900' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8" stroke-width="2" />
						<path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" />
					</svg>
					<span>Cari Perjalanan</span>
				</a>

				<a
					href="/member/pesanan"
					onclick={() => (mobileMenuOpen = false)}
					class={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
						page.url.pathname.startsWith('/member/pesanan')
							? 'bg-slate-50 text-slate-900 border border-slate-200 shadow-xs'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
					}`}
				>
					<svg class={`w-4.5 h-4.5 ${page.url.pathname.startsWith('/member/pesanan') ? 'text-slate-900' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<rect x="2" y="5" width="20" height="14" rx="2" stroke-width="2" />
						<path d="M2 10h20" stroke-width="2" />
					</svg>
					<span>Pesanan Saya</span>
				</a>

				<a
					href="/member/keluhan"
					onclick={() => (mobileMenuOpen = false)}
					class={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
						page.url.pathname.startsWith('/member/keluhan')
							? 'bg-slate-50 text-slate-900 border border-slate-200 shadow-xs'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
					}`}
				>
					<svg class={`w-4.5 h-4.5 ${page.url.pathname.startsWith('/member/keluhan') ? 'text-slate-900' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
					<span>Keluhan</span>
				</a>
			</nav>
		</div>

		<!-- Bottom User Profile Card -->
		<div class="p-4 border-t border-dashed border-gray-200">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3 min-w-0">
					<div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<div class="min-w-0">
						<p class="text-xs font-semibold text-slate-900 truncate">
							{data.user?.nama || data.user?.name || 'Member'}
						</p>
						<p class="text-[11px] text-slate-400">Member</p>
					</div>
				</div>

				<button
					onclick={logout}
					title="Keluar akun"
					aria-label="Keluar akun"
					class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
				</button>
			</div>
		</div>
	</aside>

	<!-- Main Content Area -->
	<main class="flex-1 min-h-screen bg-white">
		{#if children}
			{@render children()}
		{/if}
	</main>
</div>
