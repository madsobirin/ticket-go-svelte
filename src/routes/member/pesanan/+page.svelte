<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let pesananList = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');

	let searchQuery = $state('');
	let activeTab = $state('semua'); // 'semua' | 'lunas' | 'proses' | 'belum'

	const userName = $derived(data?.user?.nama || data?.user?.name || 'Member');
	const userInitials = $derived(
		(data?.user?.nama || data?.user?.name || 'MB')
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	);

	onMount(() => {
		loadPesanan();
	});

	async function loadPesanan() {
		loading = true;
		errorMsg = '';
		try {
			const res = await fetch('/api/member/pesanan');
			const json = await res.json();
			if (res.ok) {
				pesananList = json.data;
			} else {
				errorMsg = json.error?.message ?? 'Gagal memuat pesanan';
			}
		} catch {
			errorMsg = 'Gagal menghubungi server';
		} finally {
			loading = false;
		}
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num);
	}

	function formatHariTanggal(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}

	const counts = $derived({
		semua: pesananList.length,
		lunas: pesananList.filter((p) => p.status === 'Lunas').length,
		proses: pesananList.filter((p) => p.status === 'Dalam Proses').length,
		belum: pesananList.filter((p) => p.status === 'Belum Bayar').length
	});

	const filteredList = $derived.by(() => {
		let list = pesananList;
		if (activeTab === 'lunas') list = list.filter((p) => p.status === 'Lunas');
		if (activeTab === 'proses') list = list.filter((p) => p.status === 'Dalam Proses');
		if (activeTab === 'belum') list = list.filter((p) => p.status === 'Belum Bayar');

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((p) =>
				p.resi_pesan?.toLowerCase().includes(q) ||
				p.nm_kota_asal?.toLowerCase().includes(q) ||
				p.nm_kota_tujuan?.toLowerCase().includes(q) ||
				p.jenis_mobil?.toLowerCase().includes(q)
			);
		}
		return list;
	});
</script>

<svelte:head>
	<title>Pesanan Saya - Lampung Travel</title>
</svelte:head>

<div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Navigation & Support Line -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<div class="flex items-center gap-2 text-xs font-medium text-slate-500">
			<a href="/member" class="hover:text-purple-600 transition flex items-center gap-1">
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
				</svg>
				<span>Beranda</span>
			</a>
			<span class="text-slate-300">/</span>
			<span class="text-slate-900 font-semibold">Pesanan Saya</span>
		</div>

		<div class="flex items-center gap-2 self-start sm:self-auto">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600">
				<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
				<span>Layanan Loket Aktif:</span>
				<strong class="text-slate-800">0811-7200-999</strong>
			</div>
		</div>
	</div>

	<!-- Title Section -->
	<div>
		<h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Pesanan Saya</h1>
		<p class="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
			Kelola tiket perjalanan antar-kota, pantau status verifikasi loket, dan unduh slip boarding resmi Anda.
		</p>
	</div>

	<!-- 2-Column Grid Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left Column: Search, Filter Tabs & Order Cards List -->
		<div class="lg:col-span-8 space-y-4">
			<!-- Search & Filter Card -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3.5">
				<!-- Search Input -->
				<div class="relative">
					<span class="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<circle cx="11" cy="11" r="8" stroke-width="2" />
							<path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" />
						</svg>
					</span>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari kode booking (misal PSN-0014) atau kota rute..."
						class="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
					/>
				</div>

				<!-- Quick Filter Tabs -->
				<div class="flex flex-wrap items-center gap-2 pt-0.5">
					<button
						type="button"
						onclick={() => (activeTab = 'semua')}
						class={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
							activeTab === 'semua'
								? 'bg-slate-900 text-white shadow-2xs'
								: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
						}`}
					>
						Semua Pesanan ({counts.semua})
					</button>

					<button
						type="button"
						onclick={() => (activeTab = 'lunas')}
						class={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
							activeTab === 'lunas'
								? 'bg-slate-900 text-white shadow-2xs'
								: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
						}`}
					>
						Terkonfirmasi ({counts.lunas})
					</button>

					<button
						type="button"
						onclick={() => (activeTab = 'proses')}
						class={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
							activeTab === 'proses'
								? 'bg-slate-900 text-white shadow-2xs'
								: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
						}`}
					>
						Menunggu Verifikasi ({counts.proses})
					</button>

					<button
						type="button"
						onclick={() => (activeTab = 'belum')}
						class={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
							activeTab === 'belum'
								? 'bg-slate-900 text-white shadow-2xs'
								: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
						}`}
					>
						Belum Bayar ({counts.belum})
					</button>
				</div>
			</div>

			<!-- Orders List -->
			{#if loading}
				<div class="space-y-4">
					{#each [1, 2, 3] as _}
						<div class="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
							<div class="flex justify-between">
								<div class="h-4 w-32 bg-slate-100 rounded"></div>
								<div class="h-4 w-28 bg-slate-100 rounded"></div>
							</div>
							<div class="h-6 w-48 bg-slate-100 rounded"></div>
							<div class="h-10 bg-slate-50 rounded-xl"></div>
						</div>
					{/each}
				</div>
			{:else if errorMsg}
				<div class="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100 text-rose-700 space-y-3">
					<p class="font-semibold text-sm">{errorMsg}</p>
					<button
						type="button"
						onclick={loadPesanan}
						class="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition"
					>
						Coba Lagi
					</button>
				</div>
			{:else if filteredList.length === 0}
				<div class="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3 shadow-2xs">
					<div class="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<rect x="2" y="5" width="20" height="14" rx="2" stroke-width="2" />
							<path d="M2 10h20" stroke-width="2" />
						</svg>
					</div>
					<p class="font-bold text-slate-800 text-base">Tidak ada pesanan ditemukan</p>
					<p class="text-xs text-slate-500 max-w-sm mx-auto">
						{#if searchQuery || activeTab !== 'semua'}
							Tidak ada pesanan yang sesuai dengan filter atau kata kunci pencarian.
						{:else}
							Anda belum memesan tiket travel. Cari jadwal dan pilih kursi sekarang!
						{/if}
					</p>
					<a
						href="/member"
						class="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition shadow-xs mt-2"
					>
						Cari Perjalanan Sekarang
					</a>
				</div>
			{:else}
				<div class="space-y-4">
					{#each filteredList as order (order.id_pesan)}
						<div
							transition:fade={{ duration: 150 }}
							class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
						>
							<!-- Top Order Meta -->
							<div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
								<div class="flex items-center gap-2">
									<span class="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
										{order.resi_pesan}
									</span>
									<span class="text-xs text-slate-400 font-medium">
										Dipesan {formatHariTanggal(order.tgl_berangkat)}
									</span>
								</div>

								<div>
									{#if order.status === 'Lunas'}
										<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
											<span class="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
											Terkonfirmasi Loket (Lunas)
										</span>
									{:else if order.status === 'Dalam Proses'}
										<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
											<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
											Menunggu Verifikasi Loket
										</span>
									{:else}
										<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
											<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
											Menunggu Pembayaran
										</span>
									{/if}
								</div>
							</div>

							<!-- Body: Route & Trip Meta -->
							<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
								<!-- Route Title & Stops -->
								<div class="md:col-span-7 space-y-1">
									<div class="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 uppercase tracking-wide">
										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
										<span>Rute Tol Trans Sumatera • Tol Natar Express</span>
									</div>

									<h2 class="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
										<span>{order.nm_kota_asal}</span>
										<svg class="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
										</svg>
										<span>{order.nm_kota_tujuan}</span>
									</h2>

									<p class="text-[11px] text-slate-400 font-medium">
										Pool {order.nm_kota_asal} • Pusat Kota {order.nm_kota_tujuan}
									</p>
								</div>

								<!-- Meta Box: Schedule, Vehicle & Seat -->
								<div class="md:col-span-5 bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
									<div class="flex justify-between items-center text-slate-600">
										<span class="text-[11px] text-slate-400 font-medium">Jadwal Berangkat:</span>
										<span class="font-bold text-slate-800">{formatHariTanggal(order.tgl_berangkat)}</span>
									</div>
									<div class="flex justify-between items-center text-slate-600">
										<span class="text-[11px] text-slate-400 font-medium">Waktu:</span>
										<span class="font-semibold text-slate-800">{order.jam_berangkat} WIB (~1j 15m)</span>
									</div>
									<div class="flex justify-between items-center text-slate-600 pt-0.5">
										<span class="text-[11px] text-slate-400 font-medium">Armada &amp; Kursi:</span>
										<span class="font-semibold text-slate-800">
											{order.jenis_mobil} • <strong class="text-purple-700 font-extrabold">Kursi {order.nomor_kursi}</strong>
										</span>
									</div>
								</div>
							</div>

							<!-- Footer: Passenger & Action Buttons -->
							<div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
								<!-- Passenger Meta -->
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
										{userInitials}
									</div>
									<div>
										<p class="text-xs font-bold text-slate-900">{userName} (1 Tiket)</p>
										<p class="text-[11px] text-slate-500 font-medium">
											{formatRupiah(order.harga)} •
											{#if order.status === 'Lunas'}
												<span class="text-emerald-700 font-semibold">Transfer Terverifikasi</span>
											{:else if order.status === 'Dalam Proses'}
												<span class="text-amber-700 font-semibold">Bukti Diunggah</span>
											{:else}
												<span class="text-slate-500">Menunggu Pembayaran</span>
											{/if}
										</p>
									</div>
								</div>

								<!-- Action Buttons -->
								<div class="flex items-center gap-2 self-end sm:self-auto">
									{#if order.status === 'Lunas'}
										<a
											href={`/member/pesanan/${order.id_pesan}`}
											class="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
										>
											Detail
										</a>
										<a
											href={`/member/pesanan/${order.id_pesan}/tiket`}
											class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition shadow-xs hover:scale-102 active:scale-98"
										>
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
											</svg>
											<span>Cetak Slip (A5)</span>
										</a>
									{:else if order.status === 'Dalam Proses'}
										<a
											href={`/member/pesanan/${order.id_pesan}/bayar`}
											class="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
										>
											Upload Ulang
										</a>
										<a
											href={`/member/pesanan/${order.id_pesan}`}
											class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition shadow-2xs"
										>
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span>Cek Verifikasi Loket</span>
										</a>
									{:else}
										<a
											href={`/member/pesanan/${order.id_pesan}`}
											class="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
										>
											Detail
										</a>
										<a
											href={`/member/pesanan/${order.id_pesan}/bayar`}
											class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition shadow-xs hover:scale-102 active:scale-98"
										>
											<span>Bayar Sekarang</span>
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
											</svg>
										</a>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Right Column: Sidebar Widgets -->
		<div class="lg:col-span-4 space-y-4">
			<!-- Widget 1: Status Member & Tier Card -->
			<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
				<div class="flex items-center justify-between pb-2 border-b border-slate-100">
					<div class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
							<svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="7" width="20" height="14" rx="2" />
								<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
							</svg>
						</div>
						<div>
							<h3 class="text-xs font-bold text-slate-900">Status Member</h3>
							<p class="text-[11px] text-slate-400">Tier Reguler</p>
						</div>
					</div>

					<span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
						Level 1
					</span>
				</div>

				<!-- Stats Counter -->
				<div class="grid grid-cols-2 gap-3 pt-1">
					<div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
						<p class="text-[11px] text-slate-400 font-medium">Total Trip</p>
						<p class="text-xl font-extrabold text-slate-900 mt-0.5">{pesananList.length}</p>
						<p class="text-[10px] text-slate-500 mt-0.5">Provinsi Lampung</p>
					</div>

					<div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
						<p class="text-[11px] text-slate-400 font-medium">Trip Aktif</p>
						<p class="text-xl font-extrabold text-purple-700 mt-0.5">{counts.lunas + counts.proses}</p>
						<p class="text-[10px] text-slate-500 mt-0.5">Siap Berangkat</p>
					</div>
				</div>

				<!-- Progress Voucher -->
				<div class="space-y-1.5 pt-1">
					<div class="flex justify-between items-center text-xs">
						<span class="font-semibold text-slate-700">Kemajuan Diskon 10%</span>
						<span class="font-bold text-purple-700">{Math.min(10, pesananList.length)}/10 Trip</span>
					</div>

					<div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
						<div
							class="bg-purple-600 h-2 rounded-full transition-all duration-500"
							style={`width: ${Math.min(100, (pesananList.length / 10) * 100)}%`}
						></div>
					</div>

					<p class="text-[11px] text-slate-500 leading-relaxed pt-1">
						Kumpulkan {Math.max(1, 10 - pesananList.length)} perjalanan lagi untuk membuka voucher diskon otomatis 10% setiap booking.
					</p>
				</div>
			</div>

			<!-- Widget 2: Pusat Armada & Tol Lampung (Live Tracker) -->
			<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
				<div class="flex items-center justify-between pb-2 border-b border-slate-100">
					<div class="flex items-center gap-2">
						<div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<circle cx="12" cy="12" r="10" stroke-width="2" />
								<polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
							</svg>
						</div>
						<h3 class="text-xs font-bold text-slate-900">Pusat Armada &amp; Tol Lampung</h3>
					</div>

					<span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
						Live Tracker
					</span>
				</div>

				<!-- Graphic Box -->
				<div class="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 flex flex-col justify-end min-h-[95px] relative overflow-hidden">
					<div class="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-100/40 rounded-full blur-xl pointer-events-none"></div>
					<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-[11px] font-semibold text-emerald-800 self-start shadow-2xs">
						<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
						<span>Tol Natar - Terpeka Lancar</span>
					</div>
				</div>

				<p class="text-[11px] text-slate-500 leading-relaxed">
					Waktu tempuh normal Rajabasa - Metro via Tol berkisar 1 jam 15 menit dengan penjemputan alamat tepat waktu.
				</p>
			</div>

			<!-- Widget 3: Help & Support -->
			<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
				<div class="flex items-start gap-3">
					<div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
						<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					</div>
					<div>
						<h3 class="text-xs font-bold text-slate-900">Kendala Perjalanan atau Reschedule?</h3>
						<p class="text-[11px] text-slate-500 mt-1 leading-relaxed">
							Customer Support &amp; Tim Loket Resmi siap membantu perubahan jam keberangkatan tanpa biaya tambahan (maks H-4 jam).
						</p>
					</div>
				</div>

				<a
					href="/member/keluhan"
					class="w-full bg-slate-900 hover:bg-black text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition hover:scale-[1.01] active:scale-[0.99]"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
					<span>WhatsApp Loket (24 Jam)</span>
				</a>
			</div>
		</div>
	</div>
</div>
