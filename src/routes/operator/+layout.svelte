<script>
	import { page } from '$app/state';
	import logo from '$lib/assets/logo.png';
	let { data, children } = $props();

	let mobileMenuOpen = $state(false);

	async function logout() {
		await fetch('/api/auth/logout', { method: 'DELETE' });
		window.location.href = '/login';
	}
</script>

<div class="min-h-screen bg-white flex flex-col md:flex-row text-slate-800 antialiased font-sans">
	<!-- Mobile Header -->
	<header class="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-30">
		<a href="/operator" class="flex items-center gap-2.5">
			<img src={logo} alt="Ticket Go" class="h-8 w-auto object-contain shrink-0" />
			<div>
				<span class="font-extrabold text-slate-900 text-sm tracking-tight">Ticket Go</span>
				<span class="block text-[10px] text-purple-600 font-semibold leading-none">Meja Operator Loket</span>
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

	<!-- Mobile overlay -->
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
		class={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
			mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
		}`}
	>
		<div class="p-5 flex-1 flex flex-col overflow-y-auto">
			<!-- Brand Header -->
			<div class="mb-5">
				<div class="flex items-center gap-2.5">
					<img src={logo} alt="Ticket Go" class="h-9 w-auto object-contain shrink-0" />
					<div>
						<span class="font-extrabold text-slate-900 text-sm tracking-tight block">Ticket Go</span>
						<span class="text-[10px] text-slate-400 font-medium block">Portal Meja Kasir</span>
					</div>
				</div>

				<div class="mt-2.5">
					<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold tracking-wide uppercase border border-purple-100">
						<span class="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
						Petugas Meja Loket
					</span>
				</div>
			</div>

			<!-- Navigation Links -->
			<nav class="space-y-1.5 flex-1">
				<a
					href="/operator"
					onclick={() => (mobileMenuOpen = false)}
					class={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
						page.url.pathname === '/operator'
							? 'bg-slate-900 text-white shadow-xs'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
					}`}
				>
					<div class="flex items-center gap-2.5">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<rect x="2" y="6" width="20" height="12" rx="2" stroke-width="2" />
							<path d="M12 12h.01M17 12h.01M7 12h.01" stroke-width="2" />
						</svg>
						<span>Verifikasi Bukti Bayar</span>
					</div>
				</a>

				<a
					href="/admin"
					onclick={() => (mobileMenuOpen = false)}
					class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
				>
					<div class="flex items-center gap-2.5">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2" />
							<rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2" />
							<rect x="14" y="14" width="7" height="7" rx="1" stroke-width="2" />
							<rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2" />
						</svg>
						<span>Layar Dashboard Admin</span>
					</div>
				</a>
			</nav>
		</div>

		<!-- Bottom User Profile Card -->
		<div class="p-4 border-t border-slate-200">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2.5 min-w-0">
					<div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
						{(data.user?.name || data.user?.username || 'OP').slice(0, 2).toUpperCase()}
					</div>
					<div class="min-w-0">
						<p class="text-xs font-bold text-slate-900 truncate">
							{data.user?.name || data.user?.username || 'Petugas Loket'}
						</p>
						<p class="text-[10px] text-slate-400 font-medium truncate">Kasir Sentral Loket</p>
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
