<script>
	let { data } = $props();

	let searchQuery = $state('');

	function formatRupiah(num) {
		return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
	}

	// Filter jadwal berdasarkan search
	const filteredJadwal = $derived(
		(data.jadwalList || []).filter((item) => {
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase();
			return (
				item.nm_kota_asal?.toLowerCase().includes(q) ||
				item.nm_kota_tujuan?.toLowerCase().includes(q) ||
				item.jenis_mobil?.toLowerCase().includes(q) ||
				item.nomor_polisi?.toLowerCase().includes(q)
			);
		})
	);
</script>

<svelte:head>
	<title>Dashboard Operasional | Ticket Go Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Sub-Bar & Breadcrumb -->
	<div
		class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200"
	>
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
			<span class="font-bold text-slate-800">Terminal Rajabasa &bull; Kantor Pusat Operasional</span>
			<span>&bull;</span>
			<span>Panel Kendali Administrator</span>
		</div>

		<div class="flex items-center gap-2">
			<span
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold"
			>
				<span class="w-2 h-2 rounded-full bg-slate-900"></span>
				<span>Sistem Tiket Ticket Go</span>
			</span>
		</div>
	</div>

	<!-- Hero Header -->
	<section
		class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs"
	>
		<div class="space-y-1.5">
			<div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-100">
				<span>Selamat Datang, Administrator</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				Pusat Manajemen Operasional Travel
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
				Kelola jadwal perjalanan, master kota rute, data kendaraan armada, akun member, serta pantau dan tindak lanjuti keluhan pelanggan.
			</p>
		</div>

		<div class="flex items-center flex-wrap gap-2.5 shrink-0">
			<a
				href="/admin/jadwal"
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke-width="2" />
					<line x1="12" y1="8" x2="12" y2="16" stroke-width="2" />
					<line x1="8" y1="12" x2="16" y2="12" stroke-width="2" />
				</svg>
				<span>+ Tambah Jadwal</span>
			</a>
			<a
				href="/admin/member"
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 shadow-xs transition"
			>
				<svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
				</svg>
				<span>+ Registrasi Member</span>
			</a>
		</div>
	</section>

	<!-- 5 Bento Metric Cards: 1 Card per Admin Use Case -->
	<section class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
		<!-- Card 1: Data Member -->
		<a
			href="/admin/member"
			class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between"
		>
			<div class="flex items-center justify-between text-xs text-slate-500">
				<span class="font-semibold group-hover:text-slate-900 transition">Data Member</span>
				<div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
				</div>
			</div>
			<div class="mt-3">
				<span class="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight">
					{data.stats?.total_member ?? 0}
				</span>
				<span class="text-[11px] text-slate-400 font-medium">Akun Pengguna</span>
			</div>
			<span class="text-[10px] text-blue-600 font-bold mt-2 inline-flex items-center gap-1 group-hover:underline">
				<span>Kelola Member &rarr;</span>
			</span>
		</a>

		<!-- Card 2: Jadwal Perjalanan -->
		<a
			href="/admin/jadwal"
			class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between"
		>
			<div class="flex items-center justify-between text-xs text-slate-500">
				<span class="font-semibold group-hover:text-slate-900 transition">Jadwal &amp; Rute</span>
				<div class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke-width="2" />
						<polyline points="12 6 12 12 16 14" stroke-width="2" />
					</svg>
				</div>
			</div>
			<div class="mt-3">
				<span class="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight">
					{data.stats?.total_jadwal ?? 0}
				</span>
				<span class="text-[11px] text-slate-400 font-medium">Jadwal Tersedia</span>
			</div>
			<span class="text-[10px] text-purple-600 font-bold mt-2 inline-flex items-center gap-1 group-hover:underline">
				<span>Kelola Jadwal &rarr;</span>
			</span>
		</a>

		<!-- Card 3: Kota Asal & Tujuan -->
		<a
			href="/admin/kota"
			class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between"
		>
			<div class="flex items-center justify-between text-xs text-slate-500">
				<span class="font-semibold group-hover:text-slate-900 transition">Kota Master</span>
				<div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
			</div>
			<div class="mt-3">
				<span class="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight">
					{(data.stats?.total_kota_asal ?? 0) + (data.stats?.total_kota_tujuan ?? 0)}
				</span>
				<span class="text-[11px] text-slate-400 font-medium">
					{data.stats?.total_kota_asal} Asal &bull; {data.stats?.total_kota_tujuan} Tujuan
				</span>
			</div>
			<span class="text-[10px] text-indigo-600 font-bold mt-2 inline-flex items-center gap-1 group-hover:underline">
				<span>Kelola Kota &rarr;</span>
			</span>
		</a>

		<!-- Card 4: Armada Kendaraan -->
		<a
			href="/admin/kendaraan"
			class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between"
		>
			<div class="flex items-center justify-between text-xs text-slate-500">
				<span class="font-semibold group-hover:text-slate-900 transition">Kendaraan</span>
				<div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 17h14v-5l-2-5H7L5 12v5z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" />
					</svg>
				</div>
			</div>
			<div class="mt-3">
				<span class="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight">
					{data.stats?.total_armada ?? 0}
				</span>
				<span class="text-[11px] text-slate-400 font-medium">Unit Mobil Aktif</span>
			</div>
			<span class="text-[10px] text-emerald-600 font-bold mt-2 inline-flex items-center gap-1 group-hover:underline">
				<span>Kelola Armada &rarr;</span>
			</span>
		</a>

		<!-- Card 5: Keluhan Pelanggan -->
		<a
			href="/admin/keluhan"
			class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between col-span-2 sm:col-span-1"
		>
			<div class="flex items-center justify-between text-xs text-slate-500">
				<span class="font-semibold group-hover:text-slate-900 transition">Keluhan Saran</span>
				<div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</div>
			</div>
			<div class="mt-3">
				<span class="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight">
					{data.stats?.total_keluhan ?? 0}
				</span>
				<span class="text-[11px] text-slate-400 font-medium">Masukan Masuk</span>
			</div>
			<span class="text-[10px] text-amber-600 font-bold mt-2 inline-flex items-center gap-1 group-hover:underline">
				<span>Lihat Keluhan &rarr;</span>
			</span>
		</a>
	</section>

	<!-- Main 2-Column Split Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<!-- Left Main Column (8 of 12 cols) -->
		<div class="lg:col-span-8 space-y-6">
			<!-- Section 1: Jadwal Keberangkatan Terdekat (Mengelola Jadwal) -->
			<section class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2" />
								<line x1="16" y1="2" x2="16" y2="6" stroke-width="2" />
								<line x1="8" y1="2" x2="8" y2="6" stroke-width="2" />
								<line x1="3" y1="10" x2="21" y2="10" stroke-width="2" />
							</svg>
						</div>
						<div>
							<h2 class="text-base font-bold text-slate-900">
								Manifest Jadwal Keberangkatan Terdekat
							</h2>
							<p class="text-xs text-slate-500">
								Status kapasitas keterisian armada dan rute aktif
							</p>
						</div>
					</div>

					<a
						href="/admin/jadwal"
						class="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 self-start sm:self-auto"
					>
						<span>Buka Semua Jadwal &rarr;</span>
					</a>
				</div>

				<!-- Search input for jadwal -->
				<div class="relative">
					<svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8" stroke-width="2" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
					</svg>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Filter jadwal berdasarkan kota atau armada..."
						class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
					/>
				</div>

				{#if filteredJadwal.length === 0}
					<div class="py-10 text-center text-slate-400 text-xs">
						Tidak ada jadwal yang cocok dengan kata kunci pencarian.
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
									<th class="py-3 px-3">Rute Perjalanan</th>
									<th class="py-3 px-3">Keberangkatan</th>
									<th class="py-3 px-3">Armada &amp; Nopol</th>
									<th class="py-3 px-3 text-center">Keterisian</th>
									<th class="py-3 px-3 text-right">Tarif</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each filteredJadwal as j (j.id_jadwal)}
									{@const pct = Math.round((Number(j.terisi) / Number(j.kapasitas)) * 100)}
									<tr class="hover:bg-slate-50 transition-colors">
										<td class="py-3 px-3 font-semibold text-slate-900">
											<div class="flex items-center gap-1.5">
												<span class="font-bold">{j.nm_kota_asal}</span>
												<span class="text-slate-400">&rarr;</span>
												<span class="font-bold text-purple-700">{j.nm_kota_tujuan}</span>
											</div>
										</td>
										<td class="py-3 px-3">
											<div class="font-mono text-slate-800 font-bold">{j.jam_berangkat} WIB</div>
											<div class="text-[10px] text-slate-400">{j.tgl_berangkat}</div>
										</td>
										<td class="py-3 px-3">
											<div class="font-medium text-slate-900">{j.jenis_mobil}</div>
											<div class="font-mono text-[10px] text-slate-400">{j.nomor_polisi}</div>
										</td>
										<td class="py-3 px-3 text-center">
											<span class={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
												pct >= 100 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
											}`}>
												{j.terisi} / {j.kapasitas} Kursi ({pct}%)
											</span>
										</td>
										<td class="py-3 px-3 text-right font-bold font-mono text-slate-900">
											{formatRupiah(j.harga)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</section>

			<!-- Section 2: Anggota & Member Baru (Mengelola Data Member) -->
			<section class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						</div>
						<div>
							<h2 class="text-base font-bold text-slate-900">Member Terdaftar Terkini</h2>
							<p class="text-xs text-slate-500">Pendaftar akun penumpang terbaru</p>
						</div>
					</div>

					<a href="/admin/member" class="text-xs font-bold text-blue-700 hover:text-blue-900">
						Kelola Semua Member &rarr;
					</a>
				</div>

				{#if (data.memberList || []).length === 0}
					<p class="text-xs text-slate-400 py-4 text-center">Belum ada data member terdaftar.</p>
				{:else}
					<div class="divide-y divide-slate-100">
						{#each data.memberList as m (m.id_member)}
							<div class="py-3 flex items-center justify-between gap-3">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
										{m.nama.slice(0, 2).toUpperCase()}
									</div>
									<div>
										<span class="text-xs font-bold text-slate-900 block">{m.nama}</span>
										<span class="text-[11px] text-slate-500 font-mono">@{m.username} &bull; {m.telepon}</span>
									</div>
								</div>

								<div class="flex items-center gap-2">
									<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
										{m.total_pesanan} Transaksi
									</span>
									<span class={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
										m.jen_kelamin === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
									}`}>
										{m.jen_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Section 3: Keluhan & Saran Terkini (Mengelola Keluhan) -->
			<section class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</div>
						<div>
							<h2 class="text-base font-bold text-slate-900">Keluhan &amp; Masukan Pelanggan</h2>
							<p class="text-xs text-slate-500">Aspirasi penumpang terkait kenyamanan perjalanan</p>
						</div>
					</div>

					<a href="/admin/keluhan" class="text-xs font-bold text-amber-700 hover:text-amber-900">
						Buka Semua Keluhan &rarr;
					</a>
				</div>

				{#if (data.keluhanList || []).length === 0}
					<p class="text-xs text-slate-400 py-4 text-center">Tidak ada keluhan pelanggan saat ini. Layanan berjalan prima.</p>
				{:else}
					<div class="space-y-3">
						{#each data.keluhanList as k (k.id_keluhan)}
							<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="text-xs font-bold text-slate-900">{k.nama_member}</span>
										<span class="text-[10px] text-slate-400 font-mono">({k.telepon_member})</span>
									</div>
									<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
										{k.j_keluhan}
									</span>
								</div>
								<p class="text-xs text-slate-600 italic">
									"{k.d_keluhan}"
								</p>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>

		<!-- Right Side Widgets Column (4 of 12 cols) -->
		<div class="lg:col-span-4 space-y-6">
			<!-- Widget 1: Pintasan Cepat 5 Use Case Admin -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
				<h3 class="text-sm font-bold text-slate-900">Menu Utama Administrator</h3>
				<p class="text-[11px] text-slate-400">Akses langsung kelima use case sistem</p>

				<div class="space-y-2 pt-1">
					<a
						href="/admin/member"
						class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition text-left group"
					>
						<div class="flex items-center gap-2.5">
							<span class="w-2 h-2 rounded-full bg-blue-500"></span>
							<span class="text-xs font-bold text-slate-800 group-hover:text-slate-900">1. Mengelola Data Member</span>
						</div>
						<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<polyline points="9 18 15 12 9 6" stroke-width="2" />
						</svg>
					</a>

					<a
						href="/admin/jadwal"
						class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition text-left group"
					>
						<div class="flex items-center gap-2.5">
							<span class="w-2 h-2 rounded-full bg-purple-500"></span>
							<span class="text-xs font-bold text-slate-800 group-hover:text-slate-900">2. Mengelola Jadwal</span>
						</div>
						<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<polyline points="9 18 15 12 9 6" stroke-width="2" />
						</svg>
					</a>

					<a
						href="/admin/kota"
						class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition text-left group"
					>
						<div class="flex items-center gap-2.5">
							<span class="w-2 h-2 rounded-full bg-indigo-500"></span>
							<span class="text-xs font-bold text-slate-800 group-hover:text-slate-900">3. Mengelola Kota Asal &amp; Tujuan</span>
						</div>
						<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<polyline points="9 18 15 12 9 6" stroke-width="2" />
						</svg>
					</a>

					<a
						href="/admin/kendaraan"
						class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition text-left group"
					>
						<div class="flex items-center gap-2.5">
							<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
							<span class="text-xs font-bold text-slate-800 group-hover:text-slate-900">4. Mengelola Kendaraan</span>
						</div>
						<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<polyline points="9 18 15 12 9 6" stroke-width="2" />
						</svg>
					</a>

					<a
						href="/admin/keluhan"
						class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition text-left group"
					>
						<div class="flex items-center gap-2.5">
							<span class="w-2 h-2 rounded-full bg-amber-500"></span>
							<span class="text-xs font-bold text-slate-800 group-hover:text-slate-900">5. Mengelola Keluhan</span>
						</div>
						<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<polyline points="9 18 15 12 9 6" stroke-width="2" />
						</svg>
					</a>
				</div>
			</div>

			<!-- Widget 2: Kondisi Lintasan Tol Live Sensor -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
				<div class="flex items-center justify-between pb-2 border-b border-slate-100">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke-width="2" />
							</svg>
						</div>
						<h3 class="text-sm font-bold text-slate-900">Kondisi Lintasan Tol</h3>
					</div>
					<span class="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">
						Live Sensor
					</span>
				</div>

				<div class="space-y-2.5">
					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
						<div>
							<div class="text-xs font-bold text-slate-900">Tol Natar - Bakauheni</div>
							<div class="text-[10px] text-slate-500">Kecepatan rata-rata 80 km/jam</div>
						</div>
						<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-mono text-[10px] font-bold">
							Lancar
						</span>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
						<div>
							<div class="text-xs font-bold text-slate-900">GT Itera / Kotabaru</div>
							<div class="text-[10px] text-slate-500">Antrean gardu: 3 menit</div>
						</div>
						<span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100 font-mono text-[10px] font-bold">
							Padat Lancar
						</span>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
						<div>
							<div class="text-xs font-bold text-slate-900">Cuaca Rajabasa &amp; Sekitar</div>
							<div class="text-[10px] text-slate-500">Jarak pandang aman &gt; 10 km</div>
						</div>
						<span class="font-mono text-xs font-bold text-slate-800">29°C Cerah</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
