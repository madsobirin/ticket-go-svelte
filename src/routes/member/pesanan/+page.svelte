<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let pesananList = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');

	onMount(() => {
		loadPesanan();
	});

	async function loadPesanan() {
		loading = true;
		errorMsg = '';
		try {
			const res = await fetch('/api/member/pesanan');
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

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}

	function getStatusClass(status) {
		if (status === 'Lunas') return 'status-lunas';
		if (status === 'Dalam Proses') return 'status-proses';
		return 'status-belum';
	}
</script>

<div class="orders-page">
	<div class="page-header">
		<h1>Daftar Pesanan Saya</h1>
		<p class="subtitle">Riwayat pemesanan tiket dan status pembayaran</p>
	</div>

	{#if errorMsg}
		<div class="alert alert-danger">{errorMsg}</div>
	{/if}

	{#if loading}
		<div class="skeleton-list">
			<Skeleton height="120px" count={3} />
		</div>
	{:else if pesananList.length === 0}
		<div class="empty-card">
			<p>Anda belum memiliki pesanan tiket travel.</p>
			<a href="/member" class="btn-browse">Cari Jadwal Sekarang</a>
		</div>
	{:else}
		<div class="orders-list">
			{#each pesananList as order (order.id_pesan)}
				<div class="order-card" transition:fade={{ duration: 200 }}>
					<div class="order-header">
						<div class="order-id">
							<span class="muted">Kode Pesanan:</span>
							<strong>#{order.id_pesan}</strong>
						</div>
						<div class="badge {getStatusClass(order.status)}">
							{order.status}
						</div>
					</div>

					<div class="order-body">
						<div class="route-details">
							<div class="route-title">
								{order.nm_kota_asal} &rarr; {order.nm_kota_tujuan}
							</div>
							<div class="vehicle-sub">
								{order.jenis_mobil} ({order.nomor_polisi})
							</div>
						</div>

						<div class="seat-info">
							<span class="muted">Nomor Kursi</span>
							<strong class="seat-badge">Kursi {order.nomor_kursi}</strong>
						</div>

						<div class="schedule-info">
							<span class="muted">Keberangkatan</span>
							<div>{order.tgl_berangkat}</div>
							<small class="muted">{order.jam_berangkat} WIB</small>
						</div>

						<div class="price-info">
							<span class="muted">Harga</span>
							<div class="price-val">{formatRupiah(order.harga)}</div>
						</div>
					</div>

					<div class="order-footer">
						<div class="footer-actions">
							<a href="/member/pesanan/{order.id_pesan}/tiket" class="btn-ticket">
								Lihat Booking Slip
							</a>

							{#if order.status === 'Belum Bayar'}
								<a href="/member/pesanan/{order.id_pesan}/bayar" class="btn-pay">
									Bayar Sekarang &rarr;
								</a>
							{:else if order.status === 'Dalam Proses'}
								<span class="proof-info">
									Resi: <strong>{order.no_resi}</strong> (Menunggu verifikasi loket)
								</span>
							{:else if order.status === 'Lunas'}
								<span class="proof-info success">
									Resi: <strong>{order.no_resi}</strong> (Lunas)
								</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.orders-page {
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
	.orders-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.order-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border);
	}
	.order-id {
		font-size: 14px;
	}
	.badge {
		font-size: 12px;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 20px;
	}
	.status-belum {
		background: rgba(115, 115, 115, 0.12);
		color: var(--status-belum-bayar);
	}
	.status-proses {
		background: rgba(202, 138, 4, 0.12);
		color: var(--status-dalam-proses);
	}
	.status-lunas {
		background: rgba(22, 163, 74, 0.12);
		color: var(--status-lunas);
	}
	.order-body {
		display: grid;
		grid-template-columns: 2fr 1fr 1.5fr 1fr;
		gap: 1rem;
		align-items: center;
	}
	@media (max-width: 720px) {
		.order-body {
			grid-template-columns: 1fr 1fr;
		}
	}
	.route-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
	}
	.vehicle-sub {
		font-size: 13px;
		color: var(--text-muted);
		margin-top: 2px;
	}
	.seat-badge {
		display: inline-block;
		background: var(--bg);
		border: 1px solid var(--border);
		padding: 2px 8px;
		border-radius: var(--radius-sm);
		font-size: 13px;
		margin-top: 2px;
	}
	.price-val {
		font-size: 16px;
		font-weight: 600;
		color: var(--accent);
	}
	.muted {
		color: var(--text-muted);
		font-size: 12px;
		display: block;
	}
	.order-footer {
		padding-top: 0.75rem;
		border-top: 1px solid var(--border);
	}
	.footer-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.btn-ticket {
		font-size: 13px;
		color: var(--text-muted);
		text-decoration: none;
		border: 1px solid var(--border);
		padding: 0.35rem 0.75rem;
		border-radius: var(--radius);
		transition: all var(--transition-fast);
	}
	.btn-ticket:hover {
		color: var(--text);
		border-color: var(--text);
	}
	.hint-text {
		font-size: 13px;
		color: var(--text-muted);
	}
	.btn-pay {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: var(--accent);
		color: #ffffff;
		text-decoration: none;
		font-size: 13px;
		font-weight: 600;
		padding: 0.4rem 0.85rem;
		border-radius: var(--radius);
		transition: background-color var(--transition-fast);
	}
	.btn-pay:hover {
		background: var(--accent-hover);
	}
	.proof-info {
		font-size: 13px;
		color: var(--text-muted);
	}
	.proof-info.success {
		color: var(--status-lunas);
		font-weight: 500;
	}
	.empty-card {
		padding: 3rem 1.5rem;
		text-align: center;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--text-muted);
	}
	.btn-browse {
		display: inline-block;
		margin-top: 1rem;
		background: var(--accent);
		color: #ffffff;
		padding: 0.5rem 1rem;
		border-radius: var(--radius);
		text-decoration: none;
		font-size: 14px;
		font-weight: 600;
	}
	.alert-danger {
		background: #fee;
		color: var(--danger);
		padding: 0.75rem;
		border-radius: var(--radius);
	}
</style>
