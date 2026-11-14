<script>
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	let kendaraanList = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');
	let successMsg = $state('');

	// Search & Filter
	let searchQuery = $state('');
	let modelFilter = $state('');

	// Form & Modal state
	let showModal = $state(false);
	let editingId = $state(null);
	let jenisMobil = $state('');
	let nomorPolisi = $state('');
	let warnaMobil = $state('');
	let formLoading = $state(false);

	onMount(() => {
		loadKendaraan();
	});

	async function loadKendaraan() {
		loading = true;
		errorMsg = '';
		try {
			const res = await fetch('/api/admin/kendaraan');
			const json = await res.json();
			if (res.ok) {
				kendaraanList = json.data;
			} else {
				errorMsg = json.error?.message ?? 'Gagal memuat kendaraan';
			}
		} catch {
			errorMsg = 'Gagal menghubungi server';
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		editingId = null;
		jenisMobil = '';
		nomorPolisi = '';
		warnaMobil = '';
		errorMsg = '';
		successMsg = '';
		showModal = true;
	}

	function startEdit(item) {
		editingId = item.id_mobil;
		jenisMobil = item.jenis_mobil;
		nomorPolisi = item.nomor_polisi;
		warnaMobil = item.warna_mobil;
		errorMsg = '';
		successMsg = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingId = null;
		jenisMobil = '';
		nomorPolisi = '';
		warnaMobil = '';
	}

	async function handleSubmit(e) {
		e.preventDefault();
		formLoading = true;
		errorMsg = '';
		successMsg = '';

		const payload = {
			jenis_mobil: jenisMobil.trim(),
			nomor_polisi: nomorPolisi.trim().toUpperCase(),
			warna_mobil: warnaMobil.trim()
		};

		try {
			let res;
			if (editingId) {
				res = await fetch(`/api/admin/kendaraan/${editingId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			} else {
				res = await fetch('/api/admin/kendaraan', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			}

			const json = await res.json();
			if (res.ok) {
				successMsg = editingId ? 'Armada berhasil diperbarui' : 'Armada baru berhasil ditambahkan';
				closeModal();
				await loadKendaraan();
				setTimeout(() => (successMsg = ''), 3000);
			} else {
				errorMsg = json.error?.message ?? 'Gagal menyimpan data armada';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan jaringan saat menyimpan data';
		} finally {
			formLoading = false;
		}
	}

	async function handleDelete(id, nopol) {
		if (!confirm(`Hapus armada dengan nomor polisi ${nopol}? Tindakan ini tidak dapat dibatalkan.`)) {
			return;
		}

		try {
			const res = await fetch(`/api/admin/kendaraan/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (res.ok) {
				successMsg = `Armada ${nopol} berhasil dihapus`;
				await loadKendaraan();
				setTimeout(() => (successMsg = ''), 3000);
			} else {
				errorMsg = json.error?.message ?? 'Gagal menghapus armada';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan jaringan saat menghapus armada';
		}
	}

	// Filtered list
	const filteredList = $derived(
		kendaraanList.filter((item) => {
			const matchesSearch =
				!searchQuery.trim() ||
				item.nomor_polisi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.jenis_mobil?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.warna_mobil?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesModel = !modelFilter || item.jenis_mobil?.toLowerCase().includes(modelFilter.toLowerCase());

			return matchesSearch && matchesModel;
		})
	);
</script>

<svelte:head>
	<title>Manajemen Armada &amp; Sopir | Lampung Travel Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Breadcrumb & Status Bar -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<span>Portal Operasional</span>
			<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" stroke-width="2" />
			</svg>
			<span class="text-slate-900 font-semibold">Manajemen Armada &amp; Sopir</span>
		</div>

		<div class="flex items-center gap-2.5">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
				<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
				<span>{kendaraanList.length} Unit Terdaftar</span>
			</span>
			<button
				type="button"
				onclick={loadKendaraan}
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
				Manajemen Armada &amp; Penugasan Minibus
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 max-w-2xl">
				Pantau status operasional kendaraan minibus, kapasitas kursi, nomor plat polisi, dan kelayakan armada rute Tol Trans-Sumatera.
			</p>
		</div>

		<div class="flex items-center flex-wrap gap-2.5 shrink-0">
			<button
				type="button"
				onclick={openCreateModal}
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke-width="2" />
					<line x1="12" y1="8" x2="12" y2="16" stroke-width="2" />
					<line x1="8" y1="12" x2="16" y2="12" stroke-width="2" />
				</svg>
				<span>+ Tambah Unit Armada</span>
			</button>
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
			<button type="button" aria-label="Tutup pesan sukses" onclick={() => (successMsg = '')} class="text-emerald-600 hover:text-emerald-800">×</button>
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
			<button type="button" aria-label="Tutup pesan error" onclick={() => (errorMsg = '')} class="text-rose-600 hover:text-rose-800">×</button>
		</div>
	{/if}

	<!-- 4 Bento KPI Metric Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
		<!-- Metric 1: Total Armada -->
		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
			<div class="flex items-start justify-between">
				<div>
					<span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Total Armada Operasi</span>
					<div class="flex items-baseline gap-2 mt-1">
						<span class="text-3xl font-black text-slate-900 tracking-tight">{kendaraanList.length}</span>
						<span class="text-xs text-slate-500 font-medium">Minibus</span>
					</div>
				</div>
				<div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
					</svg>
				</div>
			</div>
			<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span class="inline-flex items-center gap-1.5 font-medium text-slate-800">
					<span class="w-2 h-2 rounded-full bg-purple-600"></span> Siap Jalur Tol
				</span>
				<span>100% Aktif</span>
			</div>
		</div>

		<!-- Metric 2: Sopir On-Duty -->
		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
			<div class="flex items-start justify-between">
				<div>
					<span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Sopir Bertugas Hari Ini</span>
					<div class="flex items-baseline gap-2 mt-1">
						<span class="text-3xl font-black text-purple-700 tracking-tight">{kendaraanList.length}</span>
						<span class="text-xs text-slate-500 font-medium">/ 10 Personel</span>
					</div>
				</div>
				<div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
			</div>
			<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span>Shift Pagi: Aktif</span>
				<span class="text-purple-700 font-bold">100% Bertugas</span>
			</div>
		</div>

		<!-- Metric 3: Fleet Health -->
		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
			<div class="flex items-start justify-between">
				<div>
					<span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Kesiapan Armada</span>
					<div class="flex items-baseline gap-2 mt-1">
						<span class="text-3xl font-black text-slate-900 tracking-tight">100%</span>
						<span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">Prima</span>
					</div>
				</div>
				<div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
			</div>
			<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span>Semua Unit Lolos Cek Rem</span>
				<span class="text-emerald-700 font-bold">Aman</span>
			</div>
		</div>

		<!-- Metric 4: Uji KIR & STNK -->
		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
			<div class="flex items-start justify-between">
				<div>
					<span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Status Pajak &amp; KIR</span>
					<div class="flex items-baseline gap-2 mt-1">
						<span class="text-3xl font-black text-slate-900 tracking-tight">Valid</span>
						<span class="text-xs text-slate-500 font-medium">Dishub Prov</span>
					</div>
				</div>
				<div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
			</div>
			<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span>Semua Dokumen Lengkap</span>
				<span class="text-slate-800 font-bold">2027</span>
			</div>
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
					placeholder="Cari plat nomor polisi (BE ...), jenis mobil, atau warna..."
					class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
				/>
			</div>

			<div class="md:col-span-4">
				<select
					bind:value={modelFilter}
					aria-label="Filter model kendaraan"
					class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
				>
					<option value="">Semua Model Kendaraan</option>
					<option value="Avanza">Toyota Avanza</option>
					<option value="Innova">Toyota Innova</option>
					<option value="Xenia">Daihatsu Xenia</option>
					<option value="Hiace">Toyota HiAce</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Armada Cards Grid / List -->
	{#if loading}
		<div class="py-16 text-center text-slate-400 text-xs space-y-2">
			<div class="inline-block w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
			<p>Memuat data armada...</p>
		</div>
	{:else if filteredList.length === 0}
		<div class="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400 text-xs space-y-3">
			<svg class="w-10 h-10 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
			</svg>
			<p class="font-medium">Tidak ada armada yang sesuai dengan pencarian.</p>
			<button
				type="button"
				onclick={openCreateModal}
				class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold"
			>
				+ Daftarkan Armada Pertama
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each filteredList as item (item.id_mobil)}
				<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4">
					<div class="flex items-start justify-between gap-3">
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
								</svg>
							</div>

							<div>
								<div class="flex items-center gap-2">
									<span class="font-mono text-sm font-black text-slate-900">{item.nomor_polisi}</span>
									<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-100">
										Aktif
									</span>
								</div>
								<h3 class="text-xs font-bold text-slate-800 mt-0.5">{item.jenis_mobil}</h3>
								<p class="text-[11px] text-slate-500 font-medium">Warna: {item.warna_mobil || 'Standar'}</p>
							</div>
						</div>

						<span class="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold">
							ID #{item.id_mobil}
						</span>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono">
						<div>
							<span class="text-[10px] text-slate-400 block">Kapasitas Maksimal</span>
							<span class="font-bold text-slate-800">5-7 Kursi Penumpang</span>
						</div>
						<div>
							<span class="text-[10px] text-slate-400 block">Status Dokumen</span>
							<span class="font-bold text-emerald-700">KIR &amp; STNK Valid</span>
						</div>
					</div>

					<div class="flex items-center justify-between pt-1 border-t border-slate-100">
						<span class="text-[11px] text-slate-400 font-mono">Pool: Rajabasa Sentral</span>

						<div class="flex items-center gap-2">
							<button
								type="button"
								onclick={() => startEdit(item)}
								class="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
							>
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
								<span>Edit</span>
							</button>

							<button
								type="button"
								onclick={() => handleDelete(item.id_mobil, item.nomor_polisi)}
								class="px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200 inline-flex items-center gap-1 transition"
							>
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
								<span>Hapus</span>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal Create / Edit Armada -->
{#if showModal}
	<div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
			<div class="flex items-center justify-between pb-2 border-b border-slate-100">
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
					</svg>
					<h3 class="text-base font-bold text-slate-900">
						{editingId ? 'Edit Data Armada' : 'Tambah Unit Armada Baru'}
					</h3>
				</div>
				<button
					type="button"
					aria-label="Tutup form modal"
					onclick={closeModal}
					class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form onsubmit={handleSubmit} class="space-y-3.5 text-xs">
				<div>
					<label for="form-jenis-mobil" class="block text-slate-600 font-semibold mb-1">Model / Tipe Kendaraan</label>
					<input
						id="form-jenis-mobil"
						type="text"
						bind:value={jenisMobil}
						required
						placeholder="Contoh: Toyota Avanza, Innova Reborn, HiAce"
						class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
					/>
				</div>

				<div>
					<label for="form-nopol" class="block text-slate-600 font-semibold mb-1">Nomor Polisi (Plat Kendaraan)</label>
					<input
						id="form-nopol"
						type="text"
						bind:value={nomorPolisi}
						required
						placeholder="Contoh: BE 1234 AT"
						class="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-slate-900"
					/>
				</div>

				<div>
					<label for="form-warna" class="block text-slate-600 font-semibold mb-1">Warna Kendaraan</label>
					<input
						id="form-warna"
						type="text"
						bind:value={warnaMobil}
						required
						placeholder="Contoh: Putih, Hitam Metalik, Silver"
						class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
					/>
				</div>

				<div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
					<button
						type="button"
						onclick={closeModal}
						class="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={formLoading}
						class="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition disabled:opacity-50"
					>
						{formLoading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Daftarkan Armada'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
