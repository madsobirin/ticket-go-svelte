<script>
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	let { data } = $props();

	let kotaAsalList = $state([]);
	let kotaTujuanList = $state([]);
	let jadwalList = $state([]);

	let filterAsal = $state('');
	let filterTujuan = $state('');
	let filterTanggal = $state('');
	let activeTab = $state('semua'); // 'semua' | 'hari_ini' | 'minggu_ini'

	let loading = $state(true);
	let errorMsg = $state('');
	let prefersReducedMotion = $state(false);

	const todayDate = new Date().toISOString().split('T')[0];
	const userName = $derived(data?.user?.nama || data?.user?.name || 'Member');

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const handler = (e) => (prefersReducedMotion = e.matches);
		mq.addEventListener('change', handler);

		loadKota();
		loadJadwal();

		return () => mq.removeEventListener('change', handler);
	});

	async function loadKota() {
		try {
			const res = await fetch('/api/kota');
			const json = await res.json();
			if (res.ok) {
				kotaAsalList = json.data.kota_asal;
				kotaTujuanList = json.data.kota_tujuan;
			}
		} catch {
			// fallback
		}
	}

	async function loadJadwal() {
		loading = true;
		errorMsg = '';
		try {
			const params = new URLSearchParams();
			if (filterAsal) params.append('id_kota_asal', filterAsal);
			if (filterTujuan) params.append('id_kota_tujuan', filterTujuan);
			if (filterTanggal) params.append('tanggal', filterTanggal);

			const res = await fetch(`/api/member/jadwal?${params.toString()}`);
			const json = await res.json();
			if (res.ok) {
				jadwalList = json.data;
			} else {
				errorMsg = json.error?.message ?? 'Gagal memuat jadwal';
			}
		} catch {
			errorMsg = 'Gagal menghubungi server';
		} finally {
			loading = false;
		}
	}

	function handleSearch(e) {
		e?.preventDefault();
		loadJadwal();
	}

	function handleSwap() {
		const temp = filterAsal;
		filterAsal = filterTujuan;
		filterTujuan = temp;
	}

	function setTab(tab) {
		activeTab = tab;
		if (tab === 'hari_ini') {
			filterTanggal = todayDate;
		} else if (tab === 'semua') {
			filterTanggal = '';
		} else if (tab === 'minggu_ini') {
			filterTanggal = '';
		}
		loadJadwal();
	}

	const filteredJadwal = $derived.by(() => {
		if (activeTab === 'minggu_ini') {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const nextWeek = new Date(today);
			nextWeek.setDate(today.getDate() + 7);

			return jadwalList.filter((item) => {
				const itemDate = new Date(item.tgl_berangkat);
				return itemDate >= today && itemDate <= nextWeek;
			});
		}
		return jadwalList;
	});

	function getGreeting() {
		const hour = new Date().getHours();
		if (hour >= 4 && hour < 11) return 'Selamat pagi';
		if (hour >= 11 && hour < 15) return 'Selamat siang';
		if (hour >= 15 && hour < 18) return 'Selamat sore';
		return 'Selamat malam';
	}

	function getTodayFormatted() {
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date());
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num);
	}

	function getEstimasiTiba(jamStr) {
		if (!jamStr) return '09:15';
		const parts = jamStr.split(':');
		const h = parseInt(parts[0], 10) || 0;
		const m = parseInt(parts[1], 10) || 0;
		const date = new Date();
		date.setHours(h + 1, m + 15, 0);
		return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	}

	function getKategoriKelas(item) {
		const h = parseInt(item.jam_berangkat?.split(':')[0] || '8', 10);
		if (h >= 18 || h < 4) return { label: 'Malam', color: 'bg-slate-100 text-slate-700' };
		if (item.harga >= 70000 || item.jenis_mobil?.toLowerCase().includes('innova')) {
			return { label: 'Eksekutif', color: 'bg-purple-100 text-purple-700' };
		}
		return { label: 'Reguler', color: 'bg-slate-100 text-slate-700' };
	}
</script>

<svelte:head>
	<title>Cari Jadwal Perjalanan - Lampung Travel</title>
</svelte:head>

<div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Bar -->
	<div
		class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100"
	>
		<div class="flex items-center gap-2 text-xs font-medium text-slate-500">
			<svg class="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
					clip-rule="evenodd"
				/>
			</svg>
			<span>{getTodayFormatted()}</span>
			<span class="text-slate-300">•</span>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex items-center gap-1.5 text-slate-400">
				<div
					class="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold"
				>
					{userName.charAt(0).toUpperCase()}
				</div>
			</div>
		</div>
	</div>

	<!-- Greeting & Section Header -->
	<div>
		<p class="text-xs font-semibold text-purple-600 mb-1">{getGreeting()}, {userName}</p>
		<h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Cari Perjalanan</h1>
		<p class="text-sm text-slate-500 mt-1">
			Pilih rute antarkota dan tanggal perjalanan Anda dengan armada nyaman Lampung Travel.
		</p>
	</div>

	<!-- Search Filter Card -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
		<form onsubmit={handleSearch} class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
			<!-- Kota Asal -->
			<div class="md:col-span-3">
				<label
					for="filter-asal"
					class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"
				>
					<span class="w-2 h-2 rounded-full border-2 border-slate-400 inline-block"></span>
					Kota Asal
				</label>
				<select
					id="filter-asal"
					bind:value={filterAsal}
					class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
				>
					<option value="">Semua Asal</option>
					{#each kotaAsalList as kota}
						<option value={kota.id_kota_asal}>{kota.nm_kota_asal}</option>
					{/each}
				</select>
			</div>

			<!-- Swap Button -->
			<div class="hidden md:flex md:col-span-1 items-center justify-center pb-1">
				<button
					type="button"
					onclick={handleSwap}
					aria-label="Tukar kota asal dan tujuan"
					class="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
						/>
					</svg>
				</button>
			</div>

			<!-- Kota Tujuan -->
			<div class="md:col-span-3">
				<label
					for="filter-tujuan"
					class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"
				>
					<svg class="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
							clip-rule="evenodd"
						/>
					</svg>
					Kota Tujuan
				</label>
				<select
					id="filter-tujuan"
					bind:value={filterTujuan}
					class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
				>
					<option value="">Semua Tujuan</option>
					{#each kotaTujuanList as kota}
						<option value={kota.id_kota_tujuan}>{kota.nm_kota_tujuan}</option>
					{/each}
				</select>
			</div>

			<!-- Tanggal Berangkat -->
			<div class="md:col-span-3">
				<label
					for="filter-tanggal"
					class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"
				>
					<svg
						class="w-3.5 h-3.5 text-slate-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2" />
						<path d="M16 2v4M8 2v4M3 10h18" stroke-width="2" />
					</svg>
					Tanggal Berangkat
				</label>
				<input
					id="filter-tanggal"
					type="date"
					bind:value={filterTanggal}
					class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
				/>
			</div>

			<!-- Cari Button -->
			<div class="md:col-span-2">
				<button
					type="submit"
					class="w-full bg-slate-900 hover:bg-black text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition hover:scale-[1.01] active:scale-[0.99]"
				>
					<span>Cari</span>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M14 5l7 7m0 0l-7 7m7-7H3"
						/>
					</svg>
				</button>
			</div>
		</form>
	</div>

	<!-- Quick Filter Tabs & Summary Row -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
		<div class="flex items-center gap-2">
			<button
				onclick={() => setTab('semua')}
				class={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
					activeTab === 'semua'
						? 'bg-slate-900 text-white shadow-2xs'
						: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				Semua
			</button>
			<button
				onclick={() => setTab('hari_ini')}
				class={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
					activeTab === 'hari_ini'
						? 'bg-slate-900 text-white shadow-2xs'
						: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				Hari Ini
			</button>
			<button
				onclick={() => setTab('minggu_ini')}
				class={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
					activeTab === 'minggu_ini'
						? 'bg-slate-900 text-white shadow-2xs'
						: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				Minggu Ini
			</button>
		</div>

		<div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
			<svg
				class="w-4 h-4 text-slate-400"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M8 6v6M16 6v6M4 6h16a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
			</svg>
			<span>Menampilkan <strong>{filteredJadwal.length}</strong> jadwal tersedia</span>
		</div>
	</div>

	<!-- Schedule List Content -->
	{#if loading}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
			{#each [1, 2, 3, 4] as _}
				<div class="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
					<div class="flex justify-between">
						<div class="h-4 w-24 bg-slate-100 rounded"></div>
						<div class="h-4 w-16 bg-slate-100 rounded"></div>
					</div>
					<div class="h-6 w-48 bg-slate-100 rounded"></div>
					<div class="h-16 bg-slate-50 rounded-xl"></div>
					<div class="flex justify-between items-center pt-2">
						<div class="h-6 w-28 bg-slate-100 rounded"></div>
						<div class="h-9 w-28 bg-slate-100 rounded-xl"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if errorMsg}
		<div
			class="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100 text-rose-700 space-y-3"
		>
			<p class="font-semibold text-sm">{errorMsg}</p>
			<button
				onclick={loadJadwal}
				class="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition"
			>
				Coba Lagi
			</button>
		</div>
	{:else if filteredJadwal.length === 0}
		<div
			class="p-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-3"
		>
			<div
				class="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="11" cy="11" r="8" stroke-width="2" />
					<path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" />
				</svg>
			</div>
			<p class="font-bold text-slate-800 text-base">Tidak ada jadwal ditemukan</p>
			<p class="text-xs text-slate-500 max-w-md mx-auto">
				Silakan ubah filter kota asal, tujuan, atau tanggal perjalanan Anda.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
			{#each filteredJadwal as item, i (item.id_jadwal)}
				{@const kategori = getKategoriKelas(item)}
				<div
					in:fly={prefersReducedMotion ? { duration: 0 } : { y: 15, duration: 250, delay: i * 40 }}
					class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-400 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
				>
					<div>
						<!-- Top Card Header: Route Antarkota & Badge -->
						<div class="flex items-center justify-between mb-2">
							<span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
								>Rute Antarkota</span
							>
							<span
								class={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${kategori.color}`}
							>
								{kategori.label}
							</span>
						</div>

						<!-- City Destination -->
						<h2
							class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-3"
						>
							<span>{item.nm_kota_asal}</span>
							<svg
								class="w-4 h-4 text-purple-600 shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								/>
							</svg>
							<span>{item.nm_kota_tujuan}</span>
						</h2>

						<!-- Time & Duration Box -->
						<div class="bg-slate-50 rounded-xl p-3 flex items-center justify-between mb-4">
							<div>
								<div class="flex items-baseline gap-1.5">
									<span class="text-xl font-extrabold text-slate-900">{item.jam_berangkat}</span>
									<span class="text-xs font-semibold text-slate-500">WIB</span>
								</div>
								<p class="text-[11px] text-slate-500 mt-0.5">
									Estimasi tiba: {getEstimasiTiba(item.jam_berangkat)} WIB
								</p>
							</div>

							<div class="text-right">
								<span
									class="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block mb-1"
								>
									1j 15m
								</span>
								<p class="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
									<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
									Via Tol Natar
								</p>
							</div>
						</div>

						<!-- Vehicle and Seat Availability -->
						<div
							class="flex items-center justify-between text-xs text-slate-600 pb-4 mb-4 border-b border-slate-100"
						>
							<div class="flex items-center gap-1.5">
								<svg
									class="w-3.5 h-3.5 text-slate-400"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path d="M5 17h14v-5l-2-5H7L5 12v5z" /><circle
										cx="7.5"
										cy="17.5"
										r="1.5"
									/><circle cx="16.5" cy="17.5" r="1.5" />
								</svg>
								<span>{item.jenis_mobil} • {item.nomor_polisi}</span>
							</div>

							<div>
								{#if (item.sisa_kursi ?? 5) <= 2}
									<span class="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
										<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
												clip-rule="evenodd"
											/>
										</svg>
										Sisa {item.sisa_kursi ?? 5} dari 5 kursi
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 text-purple-700 font-medium text-xs">
										<svg
											class="w-3.5 h-3.5 text-purple-600"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M4 18v3M20 18v3M5 14h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2zM6 14v4M18 14v4"
											/>
										</svg>
										Tersedia {item.sisa_kursi ?? 5} dari 5 kursi
									</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Bottom Row: Price & Pilih Kursi -->
					<div class="flex items-center justify-between pt-1">
						<div>
							<p class="text-[11px] text-slate-400 font-medium">Tarif per penumpang</p>
							<p class="text-xl font-extrabold text-purple-700">{formatRupiah(item.harga)}</p>
						</div>

						<a
							href={`/member/jadwal/${item.id_jadwal}`}
							class="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-full text-xs font-semibold transition hover:scale-105 active:scale-95 shadow-xs"
						>
							<span>Pilih Kursi</span>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								/>
							</svg>
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- 3 Feature Highlight Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
		<!-- Card 1 -->
		<div
			class="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs"
		>
			<div
				class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
			</div>
			<div>
				<h3 class="text-xs font-bold text-slate-900">Antar-Jemput Alamat</h3>
				<p class="text-[11px] text-slate-500 mt-0.5">Layanan door-to-door dalam area kota</p>
			</div>
		</div>

		<!-- Card 2 -->
		<div
			class="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs"
		>
			<div
				class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			</div>
			<div>
				<h3 class="text-xs font-bold text-slate-900">Full Akses Jalan Tol</h3>
				<p class="text-[11px] text-slate-500 mt-0.5">Perjalanan bebas hambatan & tepat waktu</p>
			</div>
		</div>

		<!-- Card 3 -->
		<div
			class="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs"
		>
			<div
				class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
			</div>
			<div>
				<h3 class="text-xs font-bold text-slate-900">Asuransi Jasa Raharja</h3>
				<p class="text-[11px] text-slate-500 mt-0.5">Semua tiket terproteksi resmi</p>
			</div>
		</div>
	</div>

	<!-- Bottom Support Notice -->
	<div
		class="bg-purple-50/60 rounded-2xl border border-purple-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4"
	>
		<div class="flex items-center gap-3">
			<div
				class="w-8 h-8 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center shrink-0 text-sm font-bold"
			>
				ℹ
			</div>
			<p class="text-xs text-slate-700 leading-relaxed">
				Tidak menemukan jadwal yang sesuai? Jadwal tambahan dibuka setiap jam kerja operasional
				loket.
			</p>
		</div>

		<a
			href="/member/keluhan"
			class="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-50 transition shadow-2xs"
		>
			<span>Hubungi CS</span>
			<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
				/>
			</svg>
		</a>
	</div>
</div>
