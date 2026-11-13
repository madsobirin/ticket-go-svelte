<script>
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import Table from '$lib/components/Table.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';

	let kendaraanList = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');
	let successMsg = $state('');

	// Form state
	let editingId = $state(null);
	let jenisMobil = $state('');
	let nomorPolisi = $state('');
	let warnaMobil = $state('');
	let formLoading = $state(false);

	let prefersReducedMotion = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const handler = (e) => (prefersReducedMotion = e.matches);
		mq.addEventListener('change', handler);

		loadKendaraan();

		return () => mq.removeEventListener('change', handler);
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

	function startEdit(item) {
		editingId = item.id_mobil;
		jenisMobil = item.jenis_mobil;
		nomorPolisi = item.nomor_polisi;
		warnaMobil = item.warna_mobil;
		errorMsg = '';
		successMsg = '';
	}

	function cancelEdit() {
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
			nomor_polisi: nomorPolisi.trim(),
			warna_mobil: warnaMobil.trim()
		};

		try {
			if (editingId) {
				const res = await fetch(`/api/admin/kendaraan/${editingId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				const json = await res.json();
				if (!res.ok) {
					errorMsg = json.error?.message ?? 'Gagal memperbarui kendaraan';
					return;
				}
				kendaraanList = kendaraanList.map((k) =>
					k.id_mobil === editingId ? { ...k, ...payload } : k
				);
				successMsg = 'Kendaraan berhasil diperbarui';
				cancelEdit();
			} else {
				const res = await fetch('/api/admin/kendaraan', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				const json = await res.json();
				if (!res.ok) {
					errorMsg = json.error?.message ?? 'Gagal menambah kendaraan';
					return;
				}
				kendaraanList = [json.data, ...kendaraanList];
				successMsg = 'Kendaraan berhasil ditambahkan';
				cancelEdit();
			}
		} catch {
			errorMsg = 'Terjadi kesalahan sistem';
		} finally {
			formLoading = false;
		}
	}

	async function handleDelete(id) {
		if (!confirm('Yakin ingin menghapus kendaraan ini?')) return;
		errorMsg = '';
		successMsg = '';

		try {
			const res = await fetch(`/api/admin/kendaraan/${id}`, { method: 'DELETE' });
			if (res.status === 204) {
				kendaraanList = kendaraanList.filter((k) => k.id_mobil !== id);
				successMsg = 'Kendaraan berhasil dihapus';
				if (editingId === id) cancelEdit();
			} else {
				const json = await res.json();
				errorMsg = json.error?.message ?? 'Gagal menghapus kendaraan';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan saat menghapus';
		}
	}
</script>

<div class="page-container">
	<div class="page-header">
		<h1>Kelola Kendaraan</h1>
		<p class="subtitle">Tambah, ubah, dan hapus armada travel</p>
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
			<h2>{editingId ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}</h2>
			<form onsubmit={handleSubmit}>
				<Input
					label="Jenis Mobil"
					placeholder="misal: Toyota Avanza"
					bind:value={jenisMobil}
					required
					maxlength="20"
				/>

				<Input
					label="Nomor Polisi"
					placeholder="misal: BE 1234 AB"
					bind:value={nomorPolisi}
					required
					maxlength="20"
				/>

				<Input
					label="Warna Mobil"
					placeholder="misal: Hitam"
					bind:value={warnaMobil}
					required
					maxlength="20"
				/>

				<div class="form-actions">
					<Button type="submit" variant="primary" disabled={formLoading}>
						{formLoading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
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
			<h2>Daftar Kendaraan</h2>
			{#if loading}
				<p class="empty-state">Memuat data...</p>
			{:else if kendaraanList.length === 0}
				<p class="empty-state">Belum ada kendaraan yang terdaftar.</p>
			{:else}
				<Table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Jenis Mobil</th>
							<th>No. Polisi</th>
							<th>Warna</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each kendaraanList as item (item.id_mobil)}
							<tr
								in:fly={{ y: 10, duration: prefersReducedMotion ? 0 : 250 }}
								out:fade={{ duration: prefersReducedMotion ? 0 : 200 }}
							>
								<td>#{item.id_mobil}</td>
								<td><strong>{item.jenis_mobil}</strong></td>
								<td>{item.nomor_polisi}</td>
								<td>{item.warna_mobil}</td>
								<td>
									<div class="action-buttons">
										<button class="btn-action edit" onclick={() => startEdit(item)}>Edit</button>
										<button class="btn-action delete" onclick={() => handleDelete(item.id_mobil)}>Hapus</button>
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
		grid-template-columns: 360px 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	@media (max-width: 860px) {
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
