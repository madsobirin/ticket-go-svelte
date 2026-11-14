<script>
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	let jadwalList = $state([]);
	let kotaAsalList = $state([]);
	let kotaTujuanList = $state([]);
	let kendaraanList = $state([]);

	let loading = $state(true);
	let errorMsg = $state('');
	let successMsg = $state('');

	// Search & Filter
	let searchQuery = $state('');
	let filterKota = $state('');

	// Form & Modal state
	let showModal = $state(false);
	let editingId = $state(null);
	let idKotaAsal = $state('');
	let idKotaTujuan = $state('');
	let idMobil = $state('');
	let harga = $state('');
	let tglBerangkat = $state('');
	let jamBerangkat = $state('');
	let formLoading = $state(false);

	const todayDate = new Date().toISOString().split('T')[0];

	onMount(() => {
		loadAll();
	});

	async function loadAll() {
		loading = true;
		errorMsg = '';
		try {
			const [jadwalRes, kotaRes, kendaraanRes] = await Promise.all([
				fetch('/api/admin/jadwal'),
				fetch('/api/kota'),
				fetch('/api/admin/kendaraan')
			]);

			const [jadwalJson, kotaJson, kendaraanJson] = await Promise.all([
				jadwalRes.json(),
				kotaRes.json(),
				kendaraanRes.json()
			]);

			if (jadwalRes.ok) jadwalList = jadwalJson.data;
			if (kotaRes.ok) {
				kotaAsalList = kotaJson.data?.asal || [];
				kotaTujuanList = kotaJson.data?.tujuan || [];
			}
			if (kendaraanRes.ok) kendaraanList = kendaraanJson.data;
		} catch {
			errorMsg = 'Gagal memuat data dari server';
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

	function openCreateModal() {
		editingId = null;
		idKotaAsal = kotaAsalList[0]?.id_kota_asal || '';
		idKotaTujuan = kotaTujuanList[0]?.id_kota_tujuan || '';
		idMobil = kendaraanList[0]?.id_mobil || '';
		harga = '60000';
		tglBerangkat = todayDate;
		jamBerangkat = '08:00';
		errorMsg = '';
		successMsg = '';
		showModal = true;
	}

	function startEdit(item) {
		editingId = item.id_jadwal;
		idKotaAsal = item.id_kota_asal;
		idKotaTujuan = item.id_kota_tujuan;
		idMobil = item.id_mobil;
		harga = String(item.harga);
		tglBerangkat = item.tgl_berangkat;
		jamBerangkat = item.jam_berangkat?.slice(0, 5) || '';
		errorMsg = '';
		successMsg = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingId = null;
	}

	async function handleSubmit(e) {
		e.preventDefault();
		formLoading = true;
		errorMsg = '';
		successMsg = '';

		const payload = {
			id_kota_asal: Number(idKotaAsal),
			id_kota_tujuan: Number(idKotaTujuan),
			id_mobil: Number(idMobil),
			harga: Number(harga),
			tgl_berangkat: tglBerangkat,
			jam_berangkat: jamBerangkat.length === 5 ? jamBerangkat + ':00' : jamBerangkat
		};

		try {
			let res;
			if (editingId) {
				res = await fetch(`/api/admin/jadwal/${editingId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			} else {
				res = await fetch('/api/admin/jadwal', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			}

			const json = await res.json();
			if (res.ok) {
				successMsg = editingId ? 'Jadwal perjalanan berhasil diperbarui' : 'Jadwal baru berhasil ditambahkan';
				closeModal();
				await loadAll();
				setTimeout(() => (successMsg = ''), 3000);
			} else {
				errorMsg = json.error?.message ?? 'Gagal menyimpan data jadwal';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan jaringan saat menyimpan jadwal';
		} finally {
			formLoading = false;
		}
	}

	async function handleDelete(id, rute) {
		if (!confirm(`Hapus jadwal ${rute}? Tindakan ini tidak dapat dibatalkan.`)) {
			return;
		}

		try {
			const res = await fetch(`/api/admin/jadwal/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (res.ok) {
				successMsg = `Jadwal ID #${id} berhasil dihapus`;
				await loadAll();
				setTimeout(() => (successMsg = ''), 3000);
			} else {
				errorMsg = json.error?.message ?? 'Gagal menghapus jadwal';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan jaringan saat menghapus jadwal';
		}
	}

	// Filtered list
	const filteredList = $derived(
		jadwalList.filter((item) => {
			const text = `${item.nm_kota_asal} ${item.nm_kota_tujuan} ${item.jenis_mobil} ${item.nomor_polisi}`.toLowerCase();
			const matchesSearch = !searchQuery.trim() || text.includes(searchQuery.toLowerCase());
			const matchesKota = !filterKota || item.nm_kota_tujuan === filterKota;
			return matchesSearch && matchesKota;
		})
	);
</script>

<svelte:head>
	<title>Manajemen Jadwal &amp; Rute | Lampung Travel Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Breadcrumb & Status Bar -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<span>Portal Operasional</span>
			<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" stroke-width="2" />
			</svg>
			<span class="text-slate-900 font-semibold">Manajemen Jadwal &amp; Rute</span>
		</div>

		<div class="flex items-center gap-2.5">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
				<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
				<span>{jadwalList.length} Jadwal Aktif Terdaftar</span>
			</span>
			<button
				type="button"
				onclick={loadAll}
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
				Manajemen Jadwal &amp; Rute Keberangkatan
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 max-w-2xl">
				Atur jam keberangkatan harian, penugasan armada antar kota, penetapan tarif tiket resmi, dan pembukaan reservasi kursi member.
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
				<span>+ Tambah Jadwal Baru</span>
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
					placeholder="Cari rute kota, plat nomor kendaraan, atau tipe minibus..."
					class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
				/>
			</div>

			<div class="md:col-span-4">
				<select
					bind:value={filterKota}
					aria-label="Filter kota tujuan"
					class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
				>
					<option value="">Semua Kota Tujuan</option>
					{#each kotaTujuanList as kt}
						<option value={kt.nm_kota_tujuan}>{kt.nm_kota_tujuan}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Jadwal List Table / Cards -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
		<div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke-width="2" />
					<polyline points="12 6 12 12 16 14" stroke-width="2" />
				</svg>
				<h2 class="text-sm font-bold text-slate-900">Daftar Jadwal Perjalanan Operasional</h2>
			</div>
			<span class="text-xs text-slate-400 font-mono">Total {filteredList.length} Rute</span>
		</div>

		{#if loading}
			<div class="py-16 text-center text-slate-400 text-xs space-y-2">
				<div class="inline-block w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
				<p>Memuat jadwal perjalanan...</p>
			</div>
		{:else if filteredList.length === 0}
			<div class="p-12 text-center text-slate-400 text-xs space-y-3">
				<svg class="w-10 h-10 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke-width="2" />
					<polyline points="12 6 12 12 16 14" stroke-width="2" />
				</svg>
				<p class="font-medium">Tidak ada jadwal perjalanan yang ditemukan.</p>
				<button
					type="button"
					onclick={openCreateModal}
					class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold"
				>
					+ Buat Jadwal Baru
				</button>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
							<th class="p-3.5">ID &amp; Rute Perjalanan</th>
							<th class="p-3.5">Tanggal &amp; Waktu</th>
							<th class="p-3.5">Armada Minibus</th>
							<th class="p-3.5">Tarif Resmi</th>
							<th class="p-3.5 text-right">Aksi Operasional</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 text-xs">
						{#each filteredList as item (item.id_jadwal)}
							<tr class="hover:bg-slate-50/80 transition-colors">
								<td class="p-3.5">
									<div class="flex items-center gap-2">
										<span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
											#{item.id_jadwal}
										</span>
										<span class="font-bold text-slate-900">
											{item.nm_kota_asal} → {item.nm_kota_tujuan}
										</span>
									</div>
									<span class="text-[11px] text-slate-400 mt-0.5 block font-mono">Via Jalan Tol Trans-Sumatera</span>
								</td>

								<td class="p-3.5">
									<div class="font-mono font-bold text-purple-700">
										{item.jam_berangkat?.slice(0, 5)} WIB
									</div>
									<div class="text-[11px] text-slate-500 font-medium">
										{item.tgl_berangkat}
									</div>
								</td>

								<td class="p-3.5">
									<div class="font-bold text-slate-900">{item.jenis_mobil}</div>
									<div class="font-mono text-[11px] text-slate-500">{item.nomor_polisi} • {item.warna_mobil}</div>
								</td>

								<td class="p-3.5">
									<span class="font-mono font-bold text-slate-900 text-sm">
										{formatRupiah(item.harga)}
									</span>
									<span class="block text-[10px] text-emerald-600 font-semibold">Termasuk Asuransi</span>
								</td>

								<td class="p-3.5 text-right">
									<div class="inline-flex items-center gap-1.5">
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
											onclick={() => handleDelete(item.id_jadwal, `${item.nm_kota_asal} - ${item.nm_kota_tujuan}`)}
											class="px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200 inline-flex items-center gap-1 transition"
										>
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
											<span>Hapus</span>
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

<!-- Modal Create / Edit Jadwal -->
{#if showModal}
	<div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
			<div class="flex items-center justify-between pb-2 border-b border-slate-100">
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke-width="2" />
						<polyline points="12 6 12 12 16 14" stroke-width="2" />
					</svg>
					<h3 class="text-base font-bold text-slate-900">
						{editingId ? 'Edit Jadwal Perjalanan' : 'Tambah Jadwal Baru'}
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

			<form onsubmit={handleSubmit} class="space-y-3 text-xs">
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="form-asal" class="block text-slate-600 font-semibold mb-1">Kota Keberangkatan (Asal)</label>
						<select
							id="form-asal"
							bind:value={idKotaAsal}
							required
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
						>
							{#each kotaAsalList as ka}
								<option value={ka.id_kota_asal}>{ka.nm_kota_asal}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="form-tujuan" class="block text-slate-600 font-semibold mb-1">Kota Kedatangan (Tujuan)</label>
						<select
							id="form-tujuan"
							bind:value={idKotaTujuan}
							required
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
						>
							{#each kotaTujuanList as kt}
								<option value={kt.id_kota_tujuan}>{kt.nm_kota_tujuan}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="form-kendaraan" class="block text-slate-600 font-semibold mb-1">Pilih Armada Minibus</label>
						<select
							id="form-kendaraan"
							bind:value={idMobil}
							required
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
						>
							{#each kendaraanList as kd}
								<option value={kd.id_mobil}>{kd.jenis_mobil} ({kd.nomor_polisi})</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="form-harga" class="block text-slate-600 font-semibold mb-1">Tarif Tiket (Rp)</label>
						<input
							id="form-harga"
							type="number"
							bind:value={harga}
							required
							min="1000"
							step="1000"
							placeholder="60000"
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="form-tgl" class="block text-slate-600 font-semibold mb-1">Tanggal Keberangkatan</label>
						<input
							id="form-tgl"
							type="date"
							bind:value={tglBerangkat}
							required
							min={todayDate}
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
						/>
					</div>

					<div>
						<label for="form-jam" class="block text-slate-600 font-semibold mb-1">Jam Berangkat (WIB)</label>
						<input
							id="form-jam"
							type="time"
							bind:value={jamBerangkat}
							required
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
						/>
					</div>
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
						{formLoading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
