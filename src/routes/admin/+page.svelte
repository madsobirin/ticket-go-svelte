<script>
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let searchQuery = $state('');
	let showWalkinModal = $state(false);
	let showReceiptModal = $state(false);
	let selectedTicket = $state(null);
	let actionLoading = $state(null);
	let actionMessage = $state(null);

	// Formatting helpers
	function formatRupiah(val) {
		const num = Number(val) || 0;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num);
	}

	function formatCompact(val) {
		const num = Number(val) || 0;
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(0) + 'K';
		}
		return num.toString();
	}

	function detectBankName(no_rek) {
		if (!no_rek) return { code: 'MDR', label: 'Mandiri Livin', raw: 'Bank Mandiri' };
		const str = String(no_rek).toLowerCase();
		if (str.includes('bca')) return { code: 'BCA', label: 'm-BCA', raw: 'BCA' };
		if (str.includes('bri')) return { code: 'BRI', label: 'BRIMO', raw: 'BRI' };
		if (str.includes('bni')) return { code: 'BNI', label: 'BNI Mobile', raw: 'BNI' };
		if (str.includes('mandiri')) return { code: 'MDR', label: 'Mandiri Livin', raw: 'Mandiri' };
		return { code: 'TF', label: 'Transfer', raw: 'Bank Transfer' };
	}

	function openSlipModal(item) {
		selectedTicket = item;
		showReceiptModal = true;
	}

	async function updateStatus(id_pesan, newStatus) {
		actionLoading = id_pesan;
		actionMessage = null;
		try {
			const res = await fetch(`/api/operator/pesan/${id_pesan}/status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});
			const body = await res.json();
			if (!res.ok) {
				alert(body?.error?.message || 'Gagal mengubah status');
				return;
			}
			actionMessage = {
				id: id_pesan,
				type: newStatus === 'Lunas' ? 'success' : 'rejected',
				text:
					newStatus === 'Lunas'
						? `Tiket PSN-${String(id_pesan).padStart(4, '0')} Terverifikasi! Terbit otomatis ke sistem sopir.`
						: `Tiket ditolak. Dikembalikan ke status Belum Bayar.`
			};
			showReceiptModal = false;
			await invalidateAll();
			setTimeout(() => {
				if (actionMessage?.id === id_pesan) {
					actionMessage = null;
				}
			}, 3000);
		} catch (err) {
			alert('Terjadi kesalahan jaringan');
		} finally {
			actionLoading = null;
		}
	}

	// Filtered pending list based on search
	const filteredPending = $derived(
		(data.pendingList || []).filter((item) => {
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase();
			return (
				item.resi_pesan?.toLowerCase().includes(q) ||
				item.nama_member?.toLowerCase().includes(q) ||
				item.telepon_member?.toLowerCase().includes(q) ||
				item.nm_kota_asal?.toLowerCase().includes(q) ||
				item.nm_kota_tujuan?.toLowerCase().includes(q)
			);
		})
	);

	// Occupancy rate calculation
	const totalPenumpang = $derived(Number(data.stats?.total_penumpang || 0));
	const pendingCount = $derived(Number(data.stats?.pending_verifikasi || 0));
	const totalArmada = $derived(Number(data.stats?.total_armada || 0));
	const pendapatanLunas = $derived(Number(data.stats?.pendapatan_lunas || 0));
</script>

<svelte:head>
	<title>Dashboard Operasional | Ticket Go Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Bar Search & Shift Info -->
	<div
		class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80"
	>
		<div class="relative flex-1 max-w-lg">
			<svg
				class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<circle cx="11" cy="11" r="8" stroke-width="2" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari kode booking, nama penumpang, atau rute..."
				class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
			/>
		</div>

		<div class="flex flex-wrap items-center gap-2.5 shrink-0">
			<div
				class="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600 font-medium"
			>
				<svg
					class="w-3.5 h-3.5 text-slate-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2" />
					<line x1="16" y1="2" x2="16" y2="6" stroke-width="2" />
					<line x1="8" y1="2" x2="8" y2="6" stroke-width="2" />
					<line x1="3" y1="10" x2="21" y2="10" stroke-width="2" />
				</svg>
				<span>Hari ini: Senin, 10 Des 2026</span>
			</div>

			<div
				class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
			>
				<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
				<span>Shift Pagi: 06:00 - 14:00 WIB</span>
			</div>

			<button
				type="button"
				onclick={() => (showWalkinModal = true)}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<line x1="12" y1="5" x2="12" y2="19" stroke-width="2" />
					<line x1="5" y1="12" x2="19" y2="12" stroke-width="2" />
				</svg>
				<span>+ Cetak Tiket Loket</span>
			</button>
		</div>
	</div>

	<!-- Top Operational Banner & Greeting Header -->
	<section
		class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4"
	>
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
				<span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
					Terminal Rajabasa • Gate Sentral A1
				</span>
			</div>
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
				Selamat Pagi, {data.user?.name || 'Hendra Setiawan'}
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 max-w-2xl">
				Pantauan langsung operasional keberangkatan armada, verifikasi mutasi tiket member, dan
				antrean loket hari ini.
			</p>
		</div>

		<!-- Quick Operational Actions -->
		<div class="flex flex-wrap items-center gap-2.5 shrink-0">
			<a
				href="/admin/jadwal"
				class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
					/>
				</svg>
				<span>Export Manifest</span>
			</a>

			<div
				class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2" />
					<line x1="2" y1="10" x2="22" y2="10" stroke-width="2" />
				</svg>
				<span>Shift Aktif: Loket 1</span>
			</div>

			<button
				type="button"
				onclick={() => (showWalkinModal = true)}
				class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke-width="2" />
					<line x1="12" y1="8" x2="12" y2="16" stroke-width="2" />
					<line x1="8" y1="12" x2="16" y2="12" stroke-width="2" />
				</svg>
				<span>+ Input Tiket Loket (Walk-in)</span>
			</button>
		</div>
	</section>

	<!-- Key Bento Metrics Cards (4 Stat Cards) -->
	<section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
		<!-- Card 1: Total Penumpang -->
		<div
			class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
		>
			<div class="flex items-start justify-between">
				<div>
					<span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
						Total Penumpang Hari Ini
					</span>
					<div class="flex items-baseline gap-2">
						<span class="text-3xl font-black text-slate-900 tracking-tight"
							>{totalPenumpang || 148}</span
						>
						<span class="text-xs text-slate-500 font-medium">Orang</span>
					</div>
				</div>
				<div
					class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
			</div>
			<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
				<div class="flex items-center gap-1 text-emerald-600 font-bold">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke-width="2" />
						<polyline points="17 6 23 6 23 12" stroke-width="2" />
					</svg>
					<span>+12% vs kemarin</span>
				</div>
				<span class="text-slate-500 font-mono text-[11px]">Kapasitas: 86%</span>
			</div>
			<div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
				<div class="bg-slate-900 h-full rounded-full" style="width: 86%"></div>
			</div>
		</div>

		<!-- Card 2: Menunggu Verifikasi -->
		<div
			class="bg-purple-50/60 p-5 rounded-2xl border border-purple-200/80 shadow-xs flex flex-col justify-between"
		>
			<div class="flex items-start justify-between">
				<div>
					<span class="text-[11px] uppercase tracking-wider text-purple-900 font-bold block mb-1">
						Menunggu Verifikasi
					</span>
					<div class="flex items-baseline gap-2">
						<span class="text-3xl font-black text-purple-700 tracking-tight">{pendingCount}</span>
						<span class="text-xs text-purple-600 font-medium">Tiket</span>
					</div>
				</div>
				<div
					class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs"
				>
					<svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
			</div>
			<div
				class="mt-4 pt-3 border-t border-purple-200/60 flex items-center justify-between text-xs"
			>
				<span
					class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold"
				>
					Perlu Validasi Segera
				</span>
				<a href="#verifikasi-section" class="text-purple-700 font-bold hover:underline text-xs">
					Periksa Sekarang →
				</a>
			</div>
		</div>

		<!-- Card 3: Armada Aktif Tol -->
		<div
			class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
		>
			<div class="flex items-start justify-between">
				<div>
					<span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
						Armada Aktif Tol
					</span>
					<div class="flex items-baseline gap-2">
						<span class="text-3xl font-black text-slate-900 tracking-tight"
							>{totalArmada || 14}</span
						>
						<span class="text-xs text-slate-500 font-medium">Unit Aktif</span>
					</div>
				</div>
				<div
					class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
						/>
					</svg>
				</div>
			</div>
			<div class="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
				<div class="flex justify-between text-slate-500">
					<span>10 Armada Tol Bakauheni-Terpeka</span>
					<span class="font-mono font-bold text-slate-800">71%</span>
				</div>
				<div class="flex justify-between text-slate-500">
					<span>4 Unit Standby Pool Rajabasa</span>
					<span class="font-mono font-bold text-slate-800">29%</span>
				</div>
			</div>
		</div>

		<!-- Card 4: Pendapatan Bruto -->
		<div
			class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
		>
			<div class="flex items-start justify-between">
				<div>
					<span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
						Pendapatan Bruto Hari Ini
					</span>
					<div class="flex items-baseline gap-1">
						<span class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
							{formatRupiah(pendapatanLunas || 11240000)}
						</span>
					</div>
				</div>
				<div
					class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2" />
						<line x1="12" y1="11" x2="12" y2="17" stroke-width="2" />
						<path d="M10 13c0-1.1.9-2 2-2s2 .9 2 2c0 1.5-2 1.5-2 3" stroke-width="2" />
					</svg>
				</div>
			</div>
			<div class="mt-4 pt-2 grid grid-cols-3 gap-1 text-center font-mono text-xs">
				<div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
					<span class="block text-[10px] text-slate-400">Mandiri</span>
					<span class="font-bold text-slate-800"
						>{formatCompact(pendapatanLunas * 0.7 || 7800000)}</span
					>
				</div>
				<div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
					<span class="block text-[10px] text-slate-400">BRI</span>
					<span class="font-bold text-slate-800"
						>{formatCompact(pendapatanLunas * 0.2 || 2400000)}</span
					>
				</div>
				<div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
					<span class="block text-[10px] text-slate-400">Tunai</span>
					<span class="font-bold text-slate-800"
						>{formatCompact(pendapatanLunas * 0.1 || 1040000)}</span
					>
				</div>
			</div>
		</div>
	</section>

	<!-- Main 2-Column Split Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<!-- Left Main Column (8 of 12 cols) -->
		<div class="lg:col-span-8 space-y-6">
			<!-- Section: Antrean Verifikasi Bukti Pembayaran -->
			<section
				id="verifikasi-section"
				class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
			>
				<div
					class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100"
				>
					<div class="flex items-center gap-3">
						<div
							class="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<h2 class="text-base font-bold text-slate-900">
								Antrean Verifikasi Bukti Pembayaran
							</h2>
							<p class="text-xs text-slate-500">
								Transaksi web transit menunggu validasi slip bank loket
							</p>
						</div>
					</div>

					<span
						class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold self-start sm:self-auto border border-purple-100"
					>
						<span class="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
						<span>{filteredPending.length} Menunggu Tindakan</span>
					</span>
				</div>

				<!-- Verification Items List -->
				{#if filteredPending.length === 0}
					<div class="py-12 text-center text-slate-400 text-xs space-y-2">
						<svg
							class="w-10 h-10 mx-auto text-slate-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p class="font-medium">Tidak ada transaksi yang menunggu verifikasi saat ini.</p>
						<p class="text-[11px] text-slate-400">Semua pesanan tiket telah diproses.</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each filteredPending as item (item.id_pesan)}
							{@const bank = detectBankName(item.no_rek)}

							{#if actionMessage?.id === item.id_pesan}
								<div
									class={`p-3.5 rounded-xl text-center text-xs font-semibold ${
										actionMessage.type === 'success'
											? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
											: 'bg-rose-50 text-rose-700 border border-rose-200'
									}`}
								>
									{actionMessage.text}
								</div>
							{:else}
								<div
									class="p-4 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
								>
									<div class="flex items-start gap-3.5">
										<div
											class="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-xs"
										>
											<span class="font-mono text-xs font-bold text-slate-900">{bank.code}</span>
											<span class="text-[9px] uppercase tracking-wider text-slate-400 font-semibold"
												>{bank.label.split(' ')[0]}</span
											>
										</div>

										<div class="space-y-1">
											<div class="flex items-center gap-2">
												<span class="font-mono text-xs font-bold text-slate-900"
													>{item.resi_pesan}</span
												>
												<span
													class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-mono font-semibold"
												>
													Kursi {item.nomor_kursi}
												</span>
											</div>

											<div class="text-xs font-bold text-slate-900">
												{item.nama_member}
												<span class="font-normal text-slate-500 font-mono text-[11px]">
													({item.telepon_member || 'No Telp -'})
												</span>
											</div>

											<div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
												<span class="inline-flex items-center gap-1 text-slate-800 font-medium">
													<svg
														class="w-3.5 h-3.5 text-purple-600"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
														/>
													</svg>
													{item.nm_kota_asal} → {item.nm_kota_tujuan}
												</span>
												<span>•</span>
												<span class="font-mono">{item.jam_berangkat} WIB</span>
												<span>•</span>
												<span class="font-bold text-slate-900">{formatRupiah(item.harga)}</span>
											</div>
										</div>
									</div>

									<div class="flex items-center gap-2 shrink-0 self-end md:self-center">
										<button
											type="button"
											onclick={() => openSlipModal(item)}
											class="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 inline-flex items-center gap-1.5 transition"
										>
											<svg
												class="w-3.5 h-3.5 text-slate-500"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
											<span>Slip Foto</span>
										</button>

										<button
											type="button"
											disabled={actionLoading === item.id_pesan}
											onclick={() => {
												if (
													confirm(
														`Tolak bukti pembayaran tiket ${item.resi_pesan}? Status akan dikembalikan ke Belum Bayar.`
													)
												) {
													updateStatus(item.id_pesan, 'Belum Bayar');
												}
											}}
											class="px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200 inline-flex items-center gap-1 transition disabled:opacity-50"
										>
											<span>Tolak</span>
										</button>

										<button
											type="button"
											disabled={actionLoading === item.id_pesan}
											onclick={() => updateStatus(item.id_pesan, 'Lunas')}
											class="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
										>
											{#if actionLoading === item.id_pesan}
												<span
													class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
												></span>
												<span>Memproses...</span>
											{:else}
												<svg
													class="w-3.5 h-3.5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M5 13l4 4L19 7"
													/>
												</svg>
												<span>Verifikasi &amp; Cetak</span>
											{/if}
										</button>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</section>

			<!-- Section: Jadwal Keberangkatan Armada Terdekat (Operational Manifest) -->
			<section
				class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
			>
				<div
					class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100"
				>
					<div class="flex items-center gap-3">
						<div
							class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2" />
								<line x1="16" y1="2" x2="16" y2="6" stroke-width="2" />
								<line x1="8" y1="2" x2="8" y2="6" stroke-width="2" />
								<line x1="3" y1="10" x2="21" y2="10" stroke-width="2" />
							</svg>
						</div>
						<div>
							<h2 class="text-base font-bold text-slate-900">
								Jadwal Keberangkatan Armada Terdekat
							</h2>
							<p class="text-xs text-slate-500">
								Status gate, muatan kursi, dan jalur ekspres Tol Trans-Sumatera
							</p>
						</div>
					</div>
					<a href="/admin/jadwal" class="text-xs text-purple-700 font-semibold hover:underline">
						Lihat Semua Jadwal →
					</a>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr
								class="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200"
							>
								<th class="p-3 rounded-l-xl">Armada &amp; Nopol</th>
								<th class="p-3">Rute &amp; Jam</th>
								<th class="p-3 text-center">Okupansi Kursi</th>
								<th class="p-3">Status Gate</th>
								<th class="p-3 text-right rounded-r-xl">Aksi</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100 text-xs">
							{#each data.jadwalList || [] as trip, idx}
								<tr class="hover:bg-slate-50/80 transition-colors">
									<td class="p-3">
										<div class="font-mono font-bold text-slate-900">
											{trip.nomor_polisi || `BE ${1200 + idx} AT`}
										</div>
										<div class="text-[11px] text-slate-500">
											{trip.jenis_mobil || 'Toyota Avanza'}
										</div>
									</td>
									<td class="p-3">
										<div class="font-bold text-slate-900">
											{trip.nm_kota_asal} → {trip.nm_kota_tujuan}
										</div>
										<div class="font-mono text-purple-700 font-semibold">
											{trip.jam_berangkat} WIB ({trip.tgl_berangkat})
										</div>
									</td>
									<td class="p-3 text-center">
										<span
											class={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
												trip.terisi >= (trip.kapasitas || 5)
													? 'bg-slate-900 text-white'
													: 'bg-purple-100 text-purple-700'
											}`}
										>
											{trip.terisi}/{trip.kapasitas || 5} Kursi
										</span>
									</td>
									<td class="p-3">
										<span
											class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold"
										>
											<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
											Gate {String.fromCharCode(65 + (idx % 3))}{idx + 1} • Siap
										</span>
									</td>
									<td class="p-3 text-right">
										<div class="inline-flex items-center gap-1">
											<a
												href={`/admin/jadwal`}
												class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
												title="Kelola Jadwal"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
													/>
												</svg>
											</a>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<!-- Visual Toll Express Fleet Tracker Banner -->
			<section
				class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4"
			>
				<div class="flex items-center gap-4">
					<div
						class="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900">
							Koneksi Tol Bakauheni - Terbanggi Besar
						</h3>
						<p class="text-xs text-slate-500">
							Semua unit wajib tapping gerbang tol via Kartu Brizzi/e-Toll Pool No. 04. Hindari
							jalur arteri pada jam sibuk.
						</p>
					</div>
				</div>
				<div class="shrink-0">
					<span
						class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono"
					>
						<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
						Tol Terpeka: Lancar
					</span>
				</div>
			</section>
		</div>

		<!-- Right Side Widgets Column (4 of 12 cols) -->
		<div class="lg:col-span-4 space-y-6">
			<!-- Widget 1: Meja Loket Fisik -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
				<div class="flex items-center justify-between pb-2 border-b border-slate-100">
					<div class="flex items-center gap-2">
						<div
							class="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" />
								<line x1="9" y1="3" x2="9" y2="21" stroke-width="2" />
							</svg>
						</div>
						<h3 class="text-sm font-bold text-slate-900">Meja Loket Fisik</h3>
					</div>
					<span
						class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold"
					>
						Buka • Aktif
					</span>
				</div>

				<div class="space-y-2.5">
					<div
						class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
					>
						<div class="flex items-center gap-2.5">
							<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
							<div>
								<div class="text-xs font-bold text-slate-900">Loket 1 (Tunai &amp; Cetak)</div>
								<div class="text-[10px] text-slate-500">Petugas: Rian Wahyudi</div>
							</div>
						</div>
						<span
							class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800"
						>
							AKTIF
						</span>
					</div>

					<div
						class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
					>
						<div class="flex items-center gap-2.5">
							<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
							<div>
								<div class="text-xs font-bold text-slate-900">Loket 2 (Customer Service)</div>
								<div class="text-[10px] text-slate-500">Petugas: Maya Sari</div>
							</div>
						</div>
						<span
							class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800"
						>
							AKTIF
						</span>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-2 pt-1">
					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
						<span class="text-[10px] text-slate-500 block">Antrean Walk-in</span>
						<span class="text-base font-black text-slate-900 block mt-0.5">4 Orang</span>
						<span class="text-[10px] text-slate-400 font-mono">Est. 6 menit</span>
					</div>
					<div class="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
						<span class="text-[10px] text-purple-700 block">Sisa Tiket Hari Ini</span>
						<span class="text-base font-black text-purple-700 block mt-0.5">22 Kursi</span>
						<span class="text-[10px] text-purple-500 font-mono">dari 170 total</span>
					</div>
				</div>
			</div>

			<!-- Widget 2: Kondisi Lintasan Tol Live Sensor -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
				<div class="flex items-center justify-between pb-2 border-b border-slate-100">
					<div class="flex items-center gap-2">
						<div
							class="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke-width="2" />
							</svg>
						</div>
						<h3 class="text-sm font-bold text-slate-900">Kondisi Lintasan Tol</h3>
					</div>
					<span class="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide"
						>Live Sensor</span
					>
				</div>

				<div class="space-y-2.5">
					<div
						class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
					>
						<div>
							<div class="text-xs font-bold text-slate-900">Tol Natar - Bakauheni</div>
							<div class="text-[10px] text-slate-500">Kecepatan rata-rata 80 km/jam</div>
						</div>
						<span
							class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-mono text-[10px] font-bold"
						>
							Lancar
						</span>
					</div>

					<div
						class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
					>
						<div>
							<div class="text-xs font-bold text-slate-900">GT Itera / Kotabaru</div>
							<div class="text-[10px] text-slate-500">Antrean gardu masuk tol: 3 mnt</div>
						</div>
						<span
							class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100 font-mono text-[10px] font-bold"
						>
							Padat Lancar
						</span>
					</div>

					<div
						class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
					>
						<div>
							<div class="text-xs font-bold text-slate-900">Cuaca Rajabasa &amp; Sekitar</div>
							<div class="text-[10px] text-slate-500">Jarak pandang aman &gt; 10 km</div>
						</div>
						<span class="font-mono text-xs font-bold text-slate-800"> 29°C Cerah </span>
					</div>
				</div>
			</div>

			<!-- Widget 3: Pintasan Cepat Admin -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
				<h3 class="text-sm font-bold text-slate-900">Pintasan Cepat Admin</h3>
				<div class="space-y-2">
					<a
						href="/admin/jadwal"
						class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition text-left"
					>
						<div class="flex items-center gap-2.5">
							<svg
								class="w-4 h-4 text-slate-800"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<polyline points="6 9 6 2 18 2 18 9" stroke-width="2" />
								<path
									d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"
									stroke-width="2"
								/>
								<rect x="6" y="14" width="12" height="8" stroke-width="2" />
							</svg>
							<span class="text-xs font-bold text-slate-900">Cetak Manifest Rekap A5 Massal</span>
						</div>
						<svg
							class="w-4 h-4 text-slate-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<polyline points="9 18 15 12 9 6" stroke-width="2" />
						</svg>
					</a>

					<button
						type="button"
						onclick={() =>
							alert('Fitur broadcast notifikasi armada terkirim ke WhatsApp semua sopir aktif.')}
						class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition text-left"
					>
						<div class="flex items-center gap-2.5">
							<svg
								class="w-4 h-4 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
								/>
							</svg>
							<span class="text-xs font-bold text-slate-900">Broadcast Info Armada Terlambat</span>
						</div>
						<svg
							class="w-4 h-4 text-slate-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<polyline points="9 18 15 12 9 6" stroke-width="2" />
						</svg>
					</button>

					<a
						href="/admin/kendaraan"
						class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition text-left"
					>
						<div class="flex items-center gap-2.5">
							<svg
								class="w-4 h-4 text-rose-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
							<span class="text-xs font-bold text-slate-900">Buka Tiket Darurat / Kursi Sopir</span>
						</div>
						<svg
							class="w-4 h-4 text-slate-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<polyline points="9 18 15 12 9 6" stroke-width="2" />
						</svg>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Modal: Slip Foto Verifikasi Preview -->
{#if showReceiptModal && selectedTicket}
	{@const bank = detectBankName(selectedTicket.no_rek)}
	<div
		class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
	>
		<div
			class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200"
		>
			<div class="flex items-center justify-between pb-2 border-b border-slate-100">
				<div>
					<span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold"
						>Detail Slip Mutasi</span
					>
					<h3 class="text-base font-bold text-slate-900">{selectedTicket.resi_pesan}</h3>
				</div>
				<button
					type="button"
					aria-label="Tutup modal rincian slip"
					onclick={() => (showReceiptModal = false)}
					class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs font-mono">
				<div class="flex justify-between">
					<span class="text-slate-500">Nama Penumpang:</span>
					<span class="font-bold text-slate-900">{selectedTicket.nama_member}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-500">Nominal Tagihan:</span>
					<span class="font-bold text-purple-700 text-sm">{formatRupiah(selectedTicket.harga)}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-500">Kanal Rekening:</span>
					<span class="font-bold text-slate-900">{bank.raw}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-500">Rute:</span>
					<span class="text-slate-800"
						>{selectedTicket.nm_kota_asal} → {selectedTicket.nm_kota_tujuan}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-500">Kursi / Jadwal:</span>
					<span class="text-slate-800"
						>Kursi {selectedTicket.nomor_kursi} • {selectedTicket.jam_berangkat} WIB</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-500">No. Telepon / WA:</span>
					<span class="text-slate-800">{selectedTicket.telepon_member || '-'}</span>
				</div>
			</div>

			<div
				class="h-44 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-4 text-center"
			>
				<svg
					class="w-10 h-10 text-slate-400 mb-1"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<span class="text-xs font-bold text-slate-800">Bukti Transfer Valid Terlampir</span>
				<span class="text-[10px] text-slate-400 font-mono mt-0.5"
					>Sesuai dengan mutasi rekening kasir loket</span
				>
			</div>

			<div class="flex items-center justify-end gap-2 pt-2">
				<button
					type="button"
					onclick={() => (showReceiptModal = false)}
					class="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
				>
					Tutup
				</button>
				<button
					type="button"
					onclick={() => updateStatus(selectedTicket.id_pesan, 'Lunas')}
					class="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
				>
					Setujui &amp; Terbitkan Tiket
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Walk-in Quick Ticket Input (Simulated) -->
{#if showWalkinModal}
	<div
		class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
	>
		<div
			class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200"
		>
			<div class="flex items-center justify-between pb-2 border-b border-slate-100">
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<rect x="2" y="6" width="20" height="12" rx="2" stroke-width="2" />
						<line x1="12" y1="6" x2="12" y2="18" stroke-width="2" />
					</svg>
					<h3 class="text-base font-bold text-slate-900">Input Tiket Loket (Walk-in)</h3>
				</div>
				<button
					type="button"
					aria-label="Tutup modal walk-in"
					onclick={() => (showWalkinModal = false)}
					class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div>
					<label for="walkin-nama" class="block text-slate-600 font-semibold mb-1"
						>Nama Lengkap Penumpang</label
					>
					<input
						id="walkin-nama"
						type="text"
						placeholder="Contoh: Hendri Saputra"
						class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="walkin-wa" class="block text-slate-600 font-semibold mb-1"
							>No. WhatsApp</label
						>
						<input
							id="walkin-wa"
							type="tel"
							placeholder="08xxxxxxxxxx"
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
						/>
					</div>
					<div>
						<label for="walkin-rute" class="block text-slate-600 font-semibold mb-1"
							>Pilih Rute Transit</label
						>
						<select
							id="walkin-rute"
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
						>
							<option>Bandar Lampung - Metro</option>
							<option>Bandar Lampung - Kalianda</option>
							<option>Bandar Lampung - Tulang Bawang</option>
							<option>Bandar Lampung - Bakauheni</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="walkin-jadwal" class="block text-slate-600 font-semibold mb-1"
							>Jadwal Keberangkatan</label
						>
						<select
							id="walkin-jadwal"
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
						>
							{#each data.jadwalList || [] as trip}
								<option
									>{trip.jam_berangkat} WIB ({trip.nm_kota_asal} - {trip.nm_kota_tujuan})</option
								>
							{/each}
						</select>
					</div>
					<div>
						<label for="walkin-bayar" class="block text-slate-600 font-semibold mb-1"
							>Metode Bayar</label
						>
						<select
							id="walkin-bayar"
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
						>
							<option>Tunai di Meja Loket</option>
							<option>QRIS Loket (Cetak Struk)</option>
							<option>Debit Mandiri EDC</option>
						</select>
					</div>
				</div>
			</div>

			<div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
				<button
					type="button"
					onclick={() => (showWalkinModal = false)}
					class="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
				>
					Batal
				</button>
				<button
					type="button"
					onclick={() => {
						alert('Tiket Walk-in Berhasil Dicetak ke Printer Thermal Loket!');
						showWalkinModal = false;
					}}
					class="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
				>
					Simpan &amp; Cetak Tiket Loket
				</button>
			</div>
		</div>
	</div>
{/if}
