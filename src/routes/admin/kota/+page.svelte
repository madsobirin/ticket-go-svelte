<script>
	import { onMount } from 'svelte';

	let activeTab = $state('asal'); // 'asal' | 'tujuan'
	let kotaAsalList = $state([]);
	let kotaTujuanList = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');
	let successMsg = $state('');

	// Search & Filter
	let searchQuery = $state('');

	// Form & Modal state
	let showModal = $state(false);
	let modalTab = $state('asal'); // 'asal' | 'tujuan'
	let editingId = $state(null);
	let namaKota = $state('');
	let formLoading = $state(false);

	onMount(() => {
		loadData();
	});

	async function loadData() {
		loading = true;
		errorMsg = '';
		try {
			const [asalRes, tujuanRes] = await Promise.all([
				fetch('/api/admin/kota/asal'),
				fetch('/api/admin/kota/tujuan')
			]);

			const [asalJson, tujuanJson] = await Promise.all([
				asalRes.json(),
				tujuanRes.json()
			]);

			if (asalRes.ok) kotaAsalList = asalJson.data;
			if (tujuanRes.ok) kotaTujuanList = tujuanJson.data;

			if (!asalRes.ok || !tujuanRes.ok) {
				errorMsg = asalJson.error?.message || tujuanJson.error?.message || 'Gagal memuat daftar kota';
			}
		} catch {
			errorMsg = 'Gagal menghubungi server database kota';
		} finally {
			loading = false;
		}
	}

	function openCreateModal(tab) {
		modalTab = tab;
		editingId = null;
		namaKota = '';
		errorMsg = '';
		successMsg = '';
		showModal = true;
	}

	function startEdit(item, tab) {
		modalTab = tab;
		editingId = tab === 'asal' ? item.id_kota_asal : item.id_kota_tujuan;
		namaKota = tab === 'asal' ? item.nm_kota_asal : item.nm_kota_tujuan;
		errorMsg = '';
		successMsg = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingId = null;
		namaKota = '';
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (!namaKota.trim()) return;

		formLoading = true;
		errorMsg = '';
		successMsg = '';

		const endpoint = modalTab === 'asal' ? '/api/admin/kota/asal' : '/api/admin/kota/tujuan';
		const payload = modalTab === 'asal' ? { nm_kota_asal: namaKota.trim() } : { nm_kota_tujuan: namaKota.trim() };

		try {
			let res;
			if (editingId) {
				res = await fetch(`${endpoint}/${editingId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			} else {
				res = await fetch(endpoint, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			}

			const json = await res.json();
			if (res.ok) {
				successMsg = editingId
					? `Data ${modalTab === 'asal' ? 'kota asal' : 'kota tujuan'} berhasil diperbarui`
					: `${modalTab === 'asal' ? 'Kota asal' : 'Kota tujuan'} baru berhasil ditambahkan`;
				closeModal();
				await loadData();
				setTimeout(() => (successMsg = ''), 3000);
			} else {
				errorMsg = json.error?.message ?? 'Gagal menyimpan data kota';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan jaringan saat menyimpan kota';
		} finally {
			formLoading = false;
		}
	}

	async function handleDelete(item, tab) {
		const id = tab === 'asal' ? item.id_kota_asal : item.id_kota_tujuan;
		const name = tab === 'asal' ? item.nm_kota_asal : item.nm_kota_tujuan;
		const totalJadwal = item.total_jadwal ?? 0;

		if (totalJadwal > 0) {
			alert(`Kota "${name}" tidak bisa dihapus karena masih digunakan dalam ${totalJadwal} jadwal perjalanan.`);
			return;
		}

		if (!confirm(`Hapus ${tab === 'asal' ? 'kota asal' : 'kota tujuan'} "${name}"?`)) {
			return;
		}

		const endpoint = tab === 'asal' ? `/api/admin/kota/asal/${id}` : `/api/admin/kota/tujuan/${id}`;

		try {
			const res = await fetch(endpoint, { method: 'DELETE' });
			const json = await res.json();
			if (res.ok) {
				successMsg = `Kota "${name}" berhasil dihapus`;
				await loadData();
				setTimeout(() => (successMsg = ''), 3000);
			} else {
				errorMsg = json.error?.message ?? 'Gagal menghapus kota';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan jaringan saat menghapus kota';
		}
	}

	// Filtered lists
	const currentList = $derived(activeTab === 'asal' ? kotaAsalList : kotaTujuanList);
	const filteredList = $derived(
		currentList.filter((item) => {
			const name = (activeTab === 'asal' ? item.nm_kota_asal : item.nm_kota_tujuan) ?? '';
			return !searchQuery.trim() || name.toLowerCase().includes(searchQuery.toLowerCase());
		})
	);

	const totalJadwalAsal = $derived(kotaAsalList.reduce((sum, k) => sum + (k.total_jadwal || 0), 0));
	const totalJadwalTujuan = $derived(kotaTujuanList.reduce((sum, k) => sum + (k.total_jadwal || 0), 0));
</script>

<svelte:head>
	<title>Kelola Kota Asal &amp; Tujuan | Lampung Travel Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Breadcrumb & Status Bar -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<span>Portal Operasional</span>
			<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" stroke-width="2" />
			</svg>
			<span class="text-slate-900 font-semibold">Kelola Kota Asal &amp; Tujuan</span>
		</div>

		<div class="flex items-center gap-2.5">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
				<span class="w-2 h-2 rounded-full bg-purple-600"></span>
				<span>{kotaAsalList.length} Kota Asal &bull; {kotaTujuanList.length} Kota Tujuan</span>
			</span>
			<button
				type="button"
				onclick={loadData}
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
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
				Manajemen Kota Asal &amp; Destinasi Tujuan
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 max-w-2xl">
				Konfigurasi master data titik terminal keberangkatan dan kota tujuan travel antarkabupaten se-Provinsi Lampung.
			</p>
		</div>

		<div class="flex items-center flex-wrap gap-2.5 shrink-0">
			<button
				type="button"
				onclick={() => openCreateModal(activeTab)}
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke-width="2" />
					<line x1="12" y1="8" x2="12" y2="16" stroke-width="2" />
					<line x1="8" y1="12" x2="16" y2="12" stroke-width="2" />
				</svg>
				<span>+ Tambah {activeTab === 'asal' ? 'Kota Asal' : 'Kota Tujuan'}</span>
			</button>
		</div>
	</div>

	<!-- Stat Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
			<div class="flex items-center justify-between text-xs font-medium text-slate-500">
				<span>Terminal / Kota Asal</span>
				<span class="w-2 h-2 rounded-full bg-indigo-500"></span>
			</div>
			<div class="flex items-baseline gap-2">
				<span class="text-2xl font-black text-slate-900">{kotaAsalList.length}</span>
				<span class="text-xs text-slate-400">Kota terdaftar</span>
			</div>
			<p class="text-[11px] text-slate-500">{totalJadwalAsal} jadwal aktif diberangkatkan</p>
		</div>

		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
			<div class="flex items-center justify-between text-xs font-medium text-slate-500">
				<span>Destinasi / Kota Tujuan</span>
				<span class="w-2 h-2 rounded-full bg-purple-500"></span>
			</div>
			<div class="flex items-baseline gap-2">
				<span class="text-2xl font-black text-slate-900">{kotaTujuanList.length}</span>
				<span class="text-xs text-slate-400">Kota terdaftar</span>
			</div>
			<p class="text-[11px] text-slate-500">{totalJadwalTujuan} jadwal menuju kota tujuan</p>
		</div>

		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
			<div class="flex items-center justify-between text-xs font-medium text-slate-500">
				<span>Cakupan Wilayah</span>
				<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
			</div>
			<div class="flex items-baseline gap-2">
				<span class="text-2xl font-black text-emerald-600">100%</span>
				<span class="text-xs text-slate-400">Prov. Lampung</span>
			</div>
			<p class="text-[11px] text-slate-500">Lintas Trans-Sumatera &amp; Pantai</p>
		</div>
	</div>

	<!-- Alert Messages -->
	{#if successMsg}
		<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				<span>{successMsg}</span>
			</div>
			<button type="button" aria-label="Tutup pesan" onclick={() => (successMsg = '')} class="text-emerald-600 hover:text-emerald-800">×</button>
		</div>
	{/if}

	{#if errorMsg}
		<div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke-width="2" />
					<line x1="12" y1="8" x2="12" y2="12" stroke-width="2" />
					<line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" />
				</svg>
				<span>{errorMsg}</span>
			</div>
			<button type="button" aria-label="Tutup pesan" onclick={() => (errorMsg = '')} class="text-rose-600 hover:text-rose-800">×</button>
		</div>
	{/if}

	<!-- Tabs & Search Controls -->
	<div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
		<!-- Dual Tabs -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={() => (activeTab = 'asal')}
					class={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
						activeTab === 'asal'
							? 'bg-slate-900 text-white shadow-xs'
							: 'bg-slate-50 text-slate-600 hover:bg-slate-100'
					}`}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="4" stroke-width="2" />
						<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke-width="2" />
					</svg>
					<span>Kota Asal (Titik Keberangkatan)</span>
					<span class={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'asal' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
						{kotaAsalList.length}
					</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'tujuan')}
					class={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
						activeTab === 'tujuan'
							? 'bg-slate-900 text-white shadow-xs'
							: 'bg-slate-50 text-slate-600 hover:bg-slate-100'
					}`}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span>Kota Tujuan (Destinasi Akhir)</span>
					<span class={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'tujuan' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
						{kotaTujuanList.length}
					</span>
				</button>
			</div>

			<span class="text-xs text-slate-400 font-medium hidden sm:inline-block">
				{filteredList.length} kota ditemukan
			</span>
		</div>

		<!-- Search Input -->
		<div class="relative">
			<svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<circle cx="11" cy="11" r="8" stroke-width="2" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder={`Cari nama ${activeTab === 'asal' ? 'kota asal' : 'kota tujuan'}...`}
				class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
			/>
		</div>
	</div>

	<!-- Table Card -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
		{#if loading}
			<div class="p-12 text-center text-xs text-slate-400 space-y-2">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900"></div>
				<p>Memuat daftar kota...</p>
			</div>
		{:else if filteredList.length === 0}
			<div class="p-12 text-center space-y-3">
				<div class="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke-width="2" />
						<line x1="12" y1="8" x2="12" y2="12" stroke-width="2" />
						<line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" />
					</svg>
				</div>
				<p class="text-xs font-bold text-slate-700">Tidak ada kota yang cocok</p>
				<p class="text-[11px] text-slate-400">Coba ubah kata kunci pencarian Anda atau tambah kota baru.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead>
						<tr class="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
							<th class="py-3.5 px-4 w-16 text-center">ID</th>
							<th class="py-3.5 px-4">Nama Kota / Wilayah</th>
							<th class="py-3.5 px-4">Kategori Master</th>
							<th class="py-3.5 px-4 text-center">Jadwal Terdaftar</th>
							<th class="py-3.5 px-4 text-center">Status</th>
							<th class="py-3.5 px-4 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each filteredList as item (activeTab === 'asal' ? item.id_kota_asal : item.id_kota_tujuan)}
							{@const itemId = activeTab === 'asal' ? item.id_kota_asal : item.id_kota_tujuan}
							{@const itemName = activeTab === 'asal' ? item.nm_kota_asal : item.nm_kota_tujuan}
							{@const hasJadwal = (item.total_jadwal ?? 0) > 0}
							<tr class="hover:bg-slate-50/80 transition-colors">
								<td class="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
									#{itemId}
								</td>
								<td class="py-3 px-4">
									<div class="flex items-center gap-2.5">
										<div class={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
											activeTab === 'asal' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
										}`}>
											{itemName.slice(0, 2).toUpperCase()}
										</div>
										<div>
											<span class="font-bold text-slate-900 block">{itemName}</span>
											<span class="text-[10px] text-slate-400">Provinsi Lampung</span>
										</div>
									</div>
								</td>
								<td class="py-3 px-4">
									<span class={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
										activeTab === 'asal'
											? 'bg-blue-50 text-blue-700 border-blue-100'
											: 'bg-emerald-50 text-emerald-700 border-emerald-100'
									}`}>
										<span>{activeTab === 'asal' ? 'Titik Asal Keberangkatan' : 'Destinasi Tujuan Akhir'}</span>
									</span>
								</td>
								<td class="py-3 px-4 text-center">
									{#if hasJadwal}
										<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
											<span>{item.total_jadwal} Jadwal</span>
										</span>
									{:else}
										<span class="text-slate-400 text-[10px] italic">0 Jadwal</span>
									{/if}
								</td>
								<td class="py-3 px-4 text-center">
									{#if hasJadwal}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
											<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
											Aktif Melayani
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
											<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
											Standby / Siap Rute
										</span>
									{/if}
								</td>
								<td class="py-3 px-4 text-right">
									<div class="flex items-center justify-end gap-1.5">
										<button
											type="button"
											onclick={() => startEdit(item, activeTab)}
											title="Edit Nama Kota"
											aria-label="Edit Nama Kota"
											class="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
										</button>
										<button
											type="button"
											onclick={() => handleDelete(item, activeTab)}
											title={hasJadwal ? 'Tidak dapat dihapus: terikat dengan jadwal' : 'Hapus Kota'}
											aria-label="Hapus Kota"
											class={`p-1.5 rounded-lg transition ${
												hasJadwal
													? 'text-slate-300 cursor-not-allowed'
													: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
											}`}
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Modal Create / Edit -->
{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<div>
					<h3 class="text-sm font-black text-slate-900">
						{editingId ? 'Edit ' : 'Tambah '} {modalTab === 'asal' ? 'Kota Asal' : 'Kota Tujuan'}
					</h3>
					<p class="text-[11px] text-slate-400">
						{modalTab === 'asal' ? 'Titik awal keberangkatan armada' : 'Destinasi penurunan penumpang'}
					</p>
				</div>
				<button
					type="button"
					aria-label="Tutup popup modal"
					onclick={closeModal}
					class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<label for="input-nama-kota" class="block text-xs font-bold text-slate-700 mb-1">
						Nama Kota / Wilayah <span class="text-rose-500">*</span>
					</label>
					<input
						id="input-nama-kota"
						type="text"
						bind:value={namaKota}
						required
						maxlength={modalTab === 'asal' ? 27 : 26}
						placeholder="Misal: Bandar Lampung, Metro, Kalianda"
						class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
					/>
					<p class="mt-1 text-[10px] text-slate-400 flex justify-between">
						<span>Format nama resmi kabupaten/kota/kecamatan terminal</span>
						<span>{namaKota.length} / {modalTab === 'asal' ? 27 : 26}</span>
					</p>
				</div>

				<div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
					<button
						type="button"
						onclick={closeModal}
						class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={formLoading}
						class="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition disabled:opacity-50"
					>
						{formLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Kota')}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
