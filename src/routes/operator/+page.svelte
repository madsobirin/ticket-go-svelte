<script>
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import Table from '$lib/components/Table.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let pesananList = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');

	let activeFilter = $state(''); // '' | 'Dalam Proses' | 'Belum Bayar' | 'Lunas'
	let prefersReducedMotion = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const handler = (e) => (prefersReducedMotion = e.matches);
		mq.addEventListener('change', handler);

		loadPesanan();

		return () => mq.removeEventListener('change', handler);
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
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<div class="operator-page">
	<div class="page-header">
		<div>
			<h1>Verifikasi Pesanan Loket</h1>
			<p class="subtitle">Pantau pembayaran transfer dan verifikasi tiket pelanggan</p>
		</div>

		<!-- Filter Tabs -->
		<div class="filter-tabs" role="tablist">
			<button
				type="button"
				class="filter-tab"
				class:active={activeFilter === ''}
				onclick={() => setFilter('')}
			>
				Semua
			</button>
			<button
				type="button"
				class="filter-tab"
				class:active={activeFilter === 'Dalam Proses'}
				onclick={() => setFilter('Dalam Proses')}
			>
				Dalam Proses
			</button>
			<button
				type="button"
				class="filter-tab"
				class:active={activeFilter === 'Belum Bayar'}
				onclick={() => setFilter('Belum Bayar')}
			>
				Belum Bayar
			</button>
			<button
				type="button"
				class="filter-tab"
				class:active={activeFilter === 'Lunas'}
				onclick={() => setFilter('Lunas')}
			>
				Lunas
			</button>
		</div>
	</div>

	{#if errorMsg}
		<div class="alert alert-danger">{errorMsg}</div>
	{/if}

	{#if loading}
		<Skeleton height="70px" count={5} />
	{:else if pesananList.length === 0}
		<div class="empty-state">
			<p>Tidak ada pesanan dengan status "{activeFilter || 'Semua'}".</p>
		</div>
	{:else}
		<Table>
			<thead>
				<tr>
					<th>No. Resi</th>
					<th>Nama Pelanggan</th>
					<th>Rute Travel</th>
					<th>Keberangkatan</th>
					<th>Kursi</th>
					<th>Total</th>
					<th>Status</th>
					<th>Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#each pesananList as item (item.id_pesan)}
					<tr
						animate:flip={{ duration: prefersReducedMotion ? 0 : 250 }}
						in:fade={{ duration: prefersReducedMotion ? 0 : 200 }}
					>
						<td><strong class="resi-text">{item.no_resi}</strong></td>
						<td>
							<div><strong>{item.nama_member}</strong></div>
							<small class="muted-text">{item.telepon_member || '-'}</small>
						</td>
						<td>
							<div>{item.nm_kota_asal} &rarr; {item.nm_kota_tujuan}</div>
							<small class="muted-text">{item.jenis_mobil} ({item.nomor_polisi})</small>
						</td>
						<td>
							<div>{item.tgl_berangkat}</div>
							<small class="muted-text">{item.jam_berangkat} WIB</small>
						</td>
						<td><strong>Kursi {item.nomor_kursi}</strong></td>
						<td><strong>{formatRupiah(item.harga)}</strong></td>
						<td>
							<Badge status={item.status} />
						</td>
						<td>
							<a href="/operator/pesan/{item.id_pesan}" class="btn-detail">
								Detail & Verifikasi &rarr;
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</Table>
	{/if}
</div>

<style>
	.operator-page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
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
	.filter-tabs {
		display: flex;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 3px;
		gap: 3px;
	}
	.filter-tab {
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		padding: 0.4rem 0.85rem;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		cursor: pointer;
		font-family: inherit;
		transition: all var(--transition-fast);
	}
	.filter-tab:hover {
		color: var(--text);
	}
	.filter-tab.active {
		background: var(--bg);
		color: var(--text);
		font-weight: 600;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}
	.resi-text {
		font-family: monospace;
		font-size: 13px;
		color: var(--accent);
	}
	.muted-text {
		color: var(--text-muted);
		font-size: 12px;
	}
	.btn-detail {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.75rem;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--accent);
		text-decoration: none;
		font-size: 12px;
		font-weight: 600;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}
	.btn-detail:hover {
		background: var(--accent);
		color: #ffffff;
		border-color: var(--accent);
	}
	.empty-state {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 3rem;
		text-align: center;
		color: var(--text-muted);
	}
	.alert-danger {
		background: #fee;
		color: var(--danger);
		padding: 0.75rem;
		border-radius: var(--radius);
	}
</style>
