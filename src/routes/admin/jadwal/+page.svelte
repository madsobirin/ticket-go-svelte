<script>
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import Table from '$lib/components/Table.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import Button from '$lib/components/Button.svelte';

	let jadwalList = $state([]);
	let kotaAsalList = $state([]);
	let kotaTujuanList = $state([]);
	let kendaraanList = $state([]);

	let loading = $state(true);
	let errorMsg = $state('');
	let successMsg = $state('');

	// Form state
	let editingId = $state(null);
	let idKotaAsal = $state('');
	let idKotaTujuan = $state('');
	let idMobil = $state('');
	let harga = $state('');
	let tglBerangkat = $state('');
	let jamBerangkat = $state('');
	let formLoading = $state(false);

	let prefersReducedMotion = $state(false);

	// Today YYYY-MM-DD for min date
	const todayDate = new Date().toISOString().split('T')[0];

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const handler = (e) => (prefersReducedMotion = e.matches);
		mq.addEventListener('change', handler);

		loadAll();

		return () => mq.removeEventListener('change', handler);
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
				kotaAsalList = kotaJson.data.kota_asal;
				kotaTujuanList = kotaJson.data.kota_tujuan;
			}
			if (kendaraanRes.ok) kendaraanList = kendaraanJson.data;
		} catch {
			errorMsg = 'Gagal memuat data dari server';
		} finally {
			loading = false;
		}
	}

	function startEdit(item) {
		editingId = item.id_jadwal;
		idKotaAsal = String(item.id_kota_asal);
		idKotaTujuan = String(item.id_kota_tujuan);
		idMobil = String(item.id_mobil);
		harga = String(item.harga);
		tglBerangkat = item.tgl_berangkat;
		jamBerangkat = item.jam_berangkat;
		errorMsg = '';
		successMsg = '';
	}

	function cancelEdit() {
		editingId = null;
		idKotaAsal = '';
		idKotaTujuan = '';
		idMobil = '';
		harga = '';
		tglBerangkat = '';
		jamBerangkat = '';
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
			jam_berangkat: jamBerangkat
		};

		try {
			if (editingId) {
				const res = await fetch(`/api/admin/jadwal/${editingId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				const json = await res.json();
				if (!res.ok) {
					errorMsg = json.error?.message ?? 'Gagal memperbarui jadwal';
					return;
				}
				jadwalList = jadwalList.map((j) =>
					j.id_jadwal === editingId ? json.data : j
				);
				successMsg = 'Jadwal berhasil diperbarui';
				cancelEdit();
			} else {
				const res = await fetch('/api/admin/jadwal', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				const json = await res.json();
				if (!res.ok) {
					errorMsg = json.error?.message ?? 'Gagal menambah jadwal';
					return;
				}
				jadwalList = [json.data, ...jadwalList];
				successMsg = 'Jadwal baru berhasil ditambahkan';
				cancelEdit();
			}
		} catch {
			errorMsg = 'Terjadi kesalahan sistem';
		} finally {
			formLoading = false;
		}
	}

	async function handleDelete(id) {
		if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
		errorMsg = '';
		successMsg = '';

		try {
			const res = await fetch(`/api/admin/jadwal/${id}`, { method: 'DELETE' });
			if (res.status === 204) {
				jadwalList = jadwalList.filter((j) => j.id_jadwal !== id);
				successMsg = 'Jadwal berhasil dihapus';
				if (editingId === id) cancelEdit();
			} else {
				const json = await res.json();
				errorMsg = json.error?.message ?? 'Gagal menghapus jadwal';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan saat menghapus';
		}
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<div class="page-container">
	<div class="page-header">
		<h1>Kelola Jadwal Keberangkatan</h1>
		<p class="subtitle">Atur rute, armada, waktu, dan harga tiket travel</p>
	</div>

	{#if successMsg}
		<div class="alert alert-success">{successMsg}</div>
	{/if}
	{#if errorMsg}
		<div class="alert alert-danger">{errorMsg}</div>
	{/if}

	<div class="content-grid">
		<!-- Form Card -->
		<div class="card form-card">
			<h2>{editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h2>
			<form onsubmit={handleSubmit}>
				<Select
					label="Kota Asal"
					bind:value={idKotaAsal}
					placeholder="-- Pilih Kota Asal --"
					required
					options={kotaAsalList.map((k) => ({ value: String(k.id_kota_asal), label: k.nm_kota_asal }))}
				/>

				<Select
					label="Kota Tujuan"
					bind:value={idKotaTujuan}
					placeholder="-- Pilih Kota Tujuan --"
					required
					options={kotaTujuanList.map((k) => ({ value: String(k.id_kota_tujuan), label: k.nm_kota_tujuan }))}
				/>

				<Select
					label="Armada / Kendaraan"
					bind:value={idMobil}
					placeholder="-- Pilih Kendaraan --"
					required
					options={kendaraanList.map((m) => ({ value: String(m.id_mobil), label: `${m.jenis_mobil} (${m.nomor_polisi})` }))}
				/>

				<Input
					label="Harga Tiket (Rp)"
					type="number"
					placeholder="misal: 60000"
					bind:value={harga}
					required
					min="1"
				/>

				<div class="form-row">
					<Input
						label="Tanggal Berangkat"
						type="date"
						bind:value={tglBerangkat}
						required
						min={todayDate}
					/>
					<Input
						label="Jam Berangkat"
						type="time"
						bind:value={jamBerangkat}
						required
					/>
				</div>

				<div class="form-actions">
					<Button type="submit" variant="primary" disabled={formLoading}>
						{formLoading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Jadwal'}
					</Button>
					{#if editingId}
						<Button type="button" variant="secondary" onclick={cancelEdit}>
							Batal
						</Button>
					{/if}
				</div>
			</form>
		</div>

		<!-- List Card -->
		<div class="card list-card">
			<h2>Daftar Jadwal</h2>
			{#if loading}
				<p class="empty-state">Memuat jadwal...</p>
			{:else if jadwalList.length === 0}
				<p class="empty-state">Belum ada jadwal keberangkatan.</p>
			{:else}
				<Table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Rute</th>
							<th>Kendaraan</th>
							<th>Keberangkatan</th>
							<th>Harga</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each jadwalList as item (item.id_jadwal)}
							<tr
								in:fly={{ y: 10, duration: prefersReducedMotion ? 0 : 250 }}
								out:fade={{ duration: prefersReducedMotion ? 0 : 200 }}
							>
								<td>#{item.id_jadwal}</td>
								<td>
									<strong>{item.nm_kota_asal}</strong> &rarr; <strong>{item.nm_kota_tujuan}</strong>
								</td>
								<td>
									<div>{item.jenis_mobil}</div>
									<small class="muted-text">{item.nomor_polisi}</small>
								</td>
								<td>
									<div>{item.tgl_berangkat}</div>
									<small class="muted-text">{item.jam_berangkat} WIB</small>
								</td>
								<td><strong>{formatRupiah(item.harga)}</strong></td>
								<td>
									<div class="action-buttons">
										<button class="btn-action edit" onclick={() => startEdit(item)}>Edit</button>
										<button class="btn-action delete" onclick={() => handleDelete(item.id_jadwal)}>Hapus</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</Table>
			{/if}
		</div>
	</div>
</div>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.page-header h1 {
		font-size: 24px;
		font-weight: 600;
		margin: 0;
		color: var(--text);
	}
	.subtitle {
		font-size: 14px;
		color: var(--text-muted);
		margin: 0.25rem 0 0;
	}
	.content-grid {
		display: grid;
		grid-template-columns: 380px 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	@media (max-width: 960px) {
		.content-grid {
			grid-template-columns: 1fr;
		}
	}
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
	}
	.card h2 {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 1.25rem;
		color: var(--text);
	}
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.form-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	.alert {
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		font-size: 14px;
	}
	.alert-success {
		background: #eafaf1;
		color: #080;
		border: 1px solid #c3e6cb;
	}
	.alert-danger {
		background: #fee;
		color: var(--danger);
		border: 1px solid #f5c6cb;
	}
	.empty-state {
		color: var(--text-muted);
		font-size: 14px;
		margin: 1rem 0;
	}
	.muted-text {
		color: var(--text-muted);
		font-size: 12px;
	}
	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}
	.btn-action {
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 3px 8px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.btn-action.edit {
		color: var(--accent);
	}
	.btn-action.edit:hover {
		background: var(--accent);
		color: #ffffff;
		border-color: var(--accent);
	}
	.btn-action.delete {
		color: var(--danger);
	}
	.btn-action.delete:hover {
		background: var(--danger);
		color: #ffffff;
		border-color: var(--danger);
	}
</style>
