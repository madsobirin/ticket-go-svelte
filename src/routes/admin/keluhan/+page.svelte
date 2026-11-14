<script>
	let { data } = $props();
	let keluhanList = $derived(data.keluhanList || []);

	let searchQuery = $state('');
	let filterJenis = $state('');

	const filteredList = $derived(
		keluhanList.filter((item) => {
			const text = `${item.nama_member} ${item.telepon_member} ${item.j_keluhan} ${item.d_keluhan}`.toLowerCase();
			const matchesSearch = !searchQuery.trim() || text.includes(searchQuery.toLowerCase());
			const matchesJenis = !filterJenis || item.j_keluhan === filterJenis;
			return matchesSearch && matchesJenis;
		})
	);
</script>

<svelte:head>
	<title>Keluhan &amp; Masukan Pelanggan | Lampung Travel Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Breadcrumb & Status Bar -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<span>Portal Operasional</span>
			<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" stroke-width="2" />
			</svg>
			<span class="text-slate-900 font-semibold">Keluhan &amp; Masukan Pelanggan</span>
		</div>

		<div class="flex items-center gap-2.5">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
				<span class="w-2 h-2 rounded-full bg-purple-600"></span>
				<span>{keluhanList.length} Masukan Masuk</span>
			</span>
		</div>
	</div>

	<!-- Page Header -->
	<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
		<div class="space-y-1">
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
				Pusat Penanganan Keluhan &amp; Saran Layanan
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 max-w-2xl">
				Pantau keluhan kenyamanan armada, ketepatan waktu keberangkatan, dan masukan layanan yang dikirimkan langsung oleh member resmi.
			</p>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="https://wa.me/"
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
			>
				<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
				</svg>
				<span>Hubungi Call Center Loket</span>
			</a>
		</div>
	</div>

	<!-- Filter & Search Toolbar -->
	<div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
		<div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
			<div class="md:col-span-8 relative">
				<svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="11" cy="11" r="8" stroke-width="2" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari nama member, nomor telepon, jenis keluhan, atau isi saran..."
					class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
				/>
			</div>

			<div class="md:col-span-4">
				<select
					bind:value={filterJenis}
					aria-label="Filter kategori keluhan"
					class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
				>
					<option value="">Semua Kategori Keluhan</option>
					<option value="AC Travel">Kondisi AC Armada</option>
					<option value="Pelayanan Loket">Pelayanan Kasir Loket</option>
					<option value="Keterlambatan">Keterlambatan Armada</option>
					<option value="Kebersihan">Kebersihan Minibus</option>
					<option value="Lainnya">Lainnya</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Keluhan List Table -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
		<div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
				</svg>
				<h2 class="text-sm font-bold text-slate-900">Umpan Balik Masuk dari Penumpang</h2>
			</div>
			<span class="text-xs text-slate-400 font-mono">{filteredList.length} Laporan Ditampilkan</span>
		</div>

		{#if filteredList.length === 0}
			<div class="p-12 text-center text-slate-400 text-xs space-y-2">
				<svg class="w-10 h-10 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p class="font-medium">Tidak ada keluhan pelanggan yang ditemukan.</p>
				<p class="text-[11px] text-slate-400">Semua perjalanan berjalan lancar dan memuaskan pelanggan.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
							<th class="p-3.5">ID Tiket Keluhan</th>
							<th class="p-3.5">Pelanggan &amp; Kontak</th>
							<th class="p-3.5">Kategori Masukan</th>
							<th class="p-3.5">Rincian Deskripsi Keluhan</th>
							<th class="p-3.5 text-right">Tindakan</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 text-xs">
						{#each filteredList as item (item.id_keluhan)}
							<tr class="hover:bg-slate-50/80 transition-colors">
								<td class="p-3.5">
									<span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
										#{item.id_keluhan}
									</span>
								</td>

								<td class="p-3.5">
									<div class="font-bold text-slate-900">{item.nama_member}</div>
									<div class="font-mono text-[11px] text-slate-500">{item.telepon_member || 'No Telp -'}</div>
								</td>

								<td class="p-3.5">
									<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-100 text-[10px]">
										{item.j_keluhan}
									</span>
								</td>

								<td class="p-3.5 max-w-md">
									<p class="text-slate-700 leading-relaxed text-xs line-clamp-3">
										{item.d_keluhan}
									</p>
								</td>

								<td class="p-3.5 text-right">
									{#if item.telepon_member}
										<a
											href={`https://wa.me/${item.telepon_member.replace(/[^0-9]/g, '')}`}
											target="_blank"
											rel="noreferrer"
											class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
										>
											<svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
											</svg>
											<span>Follow-up WA</span>
										</a>
									{:else}
										<span class="text-slate-400 text-[11px] font-mono">-</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
