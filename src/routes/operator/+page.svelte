<script>
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	let pesananList = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');
	let successMsg = $state('');

	let activeFilter = $state(''); // '' | 'Dalam Proses' | 'Belum Bayar' | 'Lunas'
	let searchQuery = $state('');

	onMount(() => {
		loadPesanan();
	});

	async function loadPesanan(status = activeFilter) {
		loading = true;
		errorMsg = '';
		try {
			const param = status ? `?status=${encodeURIComponent(status)}` : '';
			const res = await fetch(`/api/operator/pesan${param}`);
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

	function setFilter(status) {
		activeFilter = status;
		loadPesanan(status);
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num);
	}

	function detectBankName(no_rek) {
		if (!no_rek) return { code: 'MDR', label: 'Mandiri Livin' };
		const str = String(no_rek).toLowerCase();
		if (str.includes('bca')) return { code: 'BCA', label: 'BCA Mobile' };
		if (str.includes('bri')) return { code: 'BRI', label: 'BRImo' };
		if (str.includes('bni')) return { code: 'BNI', label: 'BNI Mobile' };
		if (str.includes('mandiri')) return { code: 'MDR', label: 'Mandiri Livin' };
		return { code: 'TF', label: 'Transfer Bank' };
	}

	// Filter list based on search query
	const filteredList = $derived(
		pesananList.filter((item) => {
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

	// Quick Stats count
	const pendingCount = $derived(pesananList.filter((p) => p.status === 'Dalam Proses').length);
	const lunasCount = $derived(pesananList.filter((p) => p.status === 'Lunas').length);
	const belumBayarCount = $derived(pesananList.filter((p) => p.status === 'Belum Bayar').length);
</script>

<svelte:head>
	<title>Meja Loket &amp; Verifikasi Bukti Bayar | Lampung Travel</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Breadcrumb & Status Bar -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<span>Portal Operasional</span>
			<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" stroke-width="2" />
			</svg>
			<span>Meja Loket</span>
			<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" stroke-width="2" />
			</svg>
			<span class="text-slate-900 font-semibold">Validasi Pembayaran</span>
		</div>

		<div class="flex items-center gap-2.5">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
				<span class="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
				<span>{pendingCount} Perlu Validasi</span>
			</span>
			<button
				type="button"
				onclick={() => loadPesanan(activeFilter)}
				class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				<span>Segarkan</span>
			</button>
		</div>
	</div>

	<!-- Page Header -->
	<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<span class="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-mono text-[10px] font-bold">
					LIVE MEJA LOKET
				</span>
				<span class="text-xs text-slate-400 font-mono">Shift Pagi (06:00 - 14:00 WIB)</span>
			</div>
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
				Verifikasi Bukti Bayar &amp; Meja Loket Kasir
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 max-w-2xl">
				Validasi mutasi bank transfer, cocokkan nominal slip transfer member, dan terbitkan status tiket lunas secara real-time.
			</p>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="/admin"
				class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2" />
					<rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2" />
					<rect x="14" y="14" width="7" height="7" rx="1" stroke-width="2" />
					<rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2" />
				</svg>
				<span>Ke Dashboard Admin</span>
			</a>
		</div>
	</div>

	<!-- Status Filter Tabs -->
	<div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={() => setFilter('')}
				class={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
					activeFilter === ''
						? 'bg-slate-900 text-white shadow-xs'
						: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
				}`}
			>
				Semua Transaksi ({pesananList.length})
			</button>

			<button
				type="button"
				onclick={() => setFilter('Dalam Proses')}
				class={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
					activeFilter === 'Dalam Proses'
						? 'bg-purple-600 text-white shadow-xs'
						: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
				}`}
			>
				<span class="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
				<span>Menunggu Verifikasi ({pendingCount})</span>
			</button>

			<button
				type="button"
				onclick={() => setFilter('Lunas')}
				class={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
					activeFilter === 'Lunas'
						? 'bg-emerald-600 text-white shadow-xs'
						: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
				}`}
			>
				Telah Terverifikasi ({lunasCount})
			</button>

			<button
				type="button"
				onclick={() => setFilter('Belum Bayar')}
				class={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
					activeFilter === 'Belum Bayar'
						? 'bg-amber-600 text-white shadow-xs'
						: 'bg-amber-50 text-amber-800 hover:bg-amber-100'
				}`}
			>
				Belum Bayar ({belumBayarCount})
			</button>
		</div>

		<!-- Search Bar -->
		<div class="relative max-w-xl">
			<svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<circle cx="11" cy="11" r="8" stroke-width="2" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Filter kode booking (mis. PSN-0019), nama penumpang, atau rute..."
				class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
			/>
		</div>
	</div>

	<!-- List / Table Pesanan -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
		<div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<rect x="2" y="6" width="20" height="12" rx="2" stroke-width="2" />
					<line x1="12" y1="6" x2="12" y2="18" stroke-width="2" />
				</svg>
				<h2 class="text-sm font-bold text-slate-900">Antrean Pesanan Tiket Masuk</h2>
			</div>
			<span class="text-xs text-slate-400 font-mono">{filteredList.length} Transaksi Ditampilkan</span>
		</div>

		{#if loading}
			<div class="py-16 text-center text-slate-400 text-xs space-y-2">
				<div class="inline-block w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
				<p>Memuat transaksi loket...</p>
			</div>
		{:else if filteredList.length === 0}
			<div class="p-12 text-center text-slate-400 text-xs space-y-2">
				<svg class="w-10 h-10 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p class="font-medium">Tidak ada transaksi yang cocok.</p>
				<p class="text-[11px] text-slate-400">Semua pesanan pada filter ini telah diproses.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
							<th class="p-3.5">Kode &amp; Status</th>
							<th class="p-3.5">Penumpang &amp; Kontak</th>
							<th class="p-3.5">Rute &amp; Jadwal</th>
							<th class="p-3.5">Tarif Tiket</th>
							<th class="p-3.5">Metode Bayar</th>
							<th class="p-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 text-xs">
						{#each filteredList as item (item.id_pesan)}
							{@const bank = detectBankName(item.no_rek)}
							<tr class="hover:bg-slate-50/80 transition-colors">
								<td class="p-3.5">
									<div class="flex items-center gap-2">
										<span class="font-mono font-bold text-slate-900">{item.resi_pesan}</span>
										<span class={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
											item.status === 'Lunas'
												? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
												: item.status === 'Dalam Proses'
												? 'bg-purple-100 text-purple-700'
												: 'bg-amber-50 text-amber-800 border border-amber-100'
										}`}>
											{item.status}
										</span>
									</div>
									<span class="font-mono text-[11px] text-purple-700 block mt-0.5">Kursi #{item.nomor_kursi}</span>
								</td>

								<td class="p-3.5">
									<div class="font-bold text-slate-900">{item.nama_member}</div>
									<div class="font-mono text-[11px] text-slate-500">{item.telepon_member || 'No Telp -'}</div>
								</td>

								<td class="p-3.5">
									<div class="font-bold text-slate-900">{item.nm_kota_asal} → {item.nm_kota_tujuan}</div>
									<div class="font-mono text-[11px] text-slate-500">
										{item.jam_berangkat?.slice(0, 5)} WIB ({item.tgl_berangkat})
									</div>
								</td>

								<td class="p-3.5">
									<span class="font-mono font-bold text-slate-900 text-sm">
										{formatRupiah(item.harga)}
									</span>
								</td>

								<td class="p-3.5">
									<div class="flex items-center gap-1.5">
										<span class="font-mono font-bold text-slate-800">{bank.code}</span>
										<span class="text-[11px] text-slate-500">({bank.label})</span>
									</div>
									{#if item.konfirmasi_no_resi}
										<span class="font-mono text-[10px] text-emerald-700 block mt-0.5 font-semibold">
											Slip Terunggah
										</span>
									{:else}
										<span class="font-mono text-[10px] text-slate-400 block mt-0.5">
											Belum Ada Slip
										</span>
									{/if}
								</td>

								<td class="p-3.5 text-right">
									<a
										href={`/operator/pesan/${item.id_pesan}`}
										class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
									>
										<span>Periksa &amp; Validasi</span>
										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<polyline points="9 18 15 12 9 6" stroke-width="2" />
										</svg>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
