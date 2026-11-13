<script>
	import { invalidateAll } from '$app/navigation';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { data } = $props();
	let order = $state(data.order);

	// Sinkronisasi data jika page direload / di-invalidate
	$effect(() => {
		order = data.order;
	});

	let submitting = $state(false);
	let actionType = $state(''); // 'Lunas' | 'Belum Bayar'
	let toastMsg = $state('');
	let toastType = $state('success');

	// Cek kesesuaian nomor resi
	let resiMismatch = $derived(
		order.konfirmasi_no_resi && order.resi_pesan !== order.konfirmasi_no_resi
	);

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num);
	}

	async function ubahStatus(targetStatus) {
		if (submitting) return;

		const confirmMsg = targetStatus === 'Lunas'
			? 'Verifikasi pembayaran dan tandai pesanan ini sebagai LUNAS? Tindakan ini bersifat final.'
			: 'Tolak bukti transfer dan kembalikan pesanan ke status BELUM BAYAR? Bukti transfer saat ini akan dihapus agar member dapat mengirim ulang.';

		if (!window.confirm(confirmMsg)) return;

		submitting = true;
		actionType = targetStatus;
		toastMsg = '';

		try {
			const res = await fetch(`/api/operator/pesan/${order.id_pesan}/status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: targetStatus })
			});

			const json = await res.json();
			if (!res.ok) {
				toastType = 'error';
				toastMsg = json.error?.message || 'Gagal mengubah status pesanan';
				return;
			}

			toastType = 'success';
			toastMsg = targetStatus === 'Lunas'
				? 'Pesanan berhasil diverifikasi dan ditandai Lunas!'
				: 'Pesanan dikembalikan ke Belum Bayar. Bukti lama telah dibersihkan.';

			order.status = targetStatus;
			if (targetStatus === 'Belum Bayar') {
				order.konfirmasi_no_resi = null;
				order.no_rek = null;
				order.tgl_transfer = null;
				order.jam_transfer = null;
			}

			await invalidateAll();
		} catch {
			toastType = 'error';
			toastMsg = 'Terjadi kesalahan koneksi ke server';
		} finally {
			submitting = false;
			actionType = '';
		}
	}
</script>

<div class="detail-page">
	<nav class="breadcrumb" aria-label="Navigasi">
		<a href="/operator" class="back-link">&larr; Kembali ke Daftar Pesanan</a>
	</nav>

	<div class="page-header">
		<div>
			<div class="resi-badge-container">
				<span class="resi-label">Nomor Resi:</span>
				<span class="resi-val">{order.resi_pesan}</span>
				<Badge status={order.status} />
			</div>
			<h1>Detail & Verifikasi Pesanan #{order.id_pesan}</h1>
		</div>
	</div>

	<!-- Peringatan jika nomor resi tidak cocok (Bug Detector) -->
	{#if resiMismatch}
		<div class="alert alert-danger" role="alert">
			<strong>BUG TERDETEKSI:</strong> Nomor resi pesanan (<code>{order.resi_pesan}</code>) tidak sama dengan nomor resi pada konfirmasi bukti transfer (<code>{order.konfirmasi_no_resi}</code>)!
		</div>
	{/if}

	<div class="grid-layout">
		<!-- Kolom Kiri: Info Tiket & Pelanggan -->
		<div class="card info-card">
			<h2>Informasi Tiket & Penumpang</h2>
			<div class="info-table">
				<div class="info-row">
					<span class="info-label">Nama Pelanggan</span>
					<span class="info-value"><strong>{order.nama_member}</strong></span>
				</div>
				<div class="info-row">
					<span class="info-label">Nomor Telepon</span>
					<span class="info-value">{order.telepon_member || '-'}</span>
				</div>
				<div class="info-row">
					<span class="info-label">Rute Perjalanan</span>
					<span class="info-value">
						<strong>{order.nm_kota_asal} &rarr; {order.nm_kota_tujuan}</strong>
					</span>
				</div>
				<div class="info-row">
					<span class="info-label">Keberangkatan</span>
					<span class="info-value">{order.tgl_berangkat} pukul {order.jam_berangkat} WIB</span>
				</div>
				<div class="info-row">
					<span class="info-label">Kendaraan</span>
					<span class="info-value">{order.jenis_mobil} ({order.nomor_polisi})</span>
				</div>
				<div class="info-row">
					<span class="info-label">Nomor Kursi</span>
					<span class="info-value"><strong class="highlight-seat">Kursi #{order.nomor_kursi}</strong></span>
				</div>
				<div class="info-row total-row">
					<span class="info-label">Total Tagihan</span>
					<span class="info-value price">{formatRupiah(order.harga)}</span>
				</div>
			</div>
		</div>

		<!-- Kolom Kanan: Bukti Pembayaran & Aksi Operator -->
		<div class="card action-card">
			<h2>Verifikasi Pembayaran</h2>

			{#if order.no_rek || order.konfirmasi_no_resi}
				<div class="proof-box">
					<div class="proof-header">
						<span class="proof-badge">Bukti Transfer Diterima</span>
					</div>
					<div class="info-table">
						<div class="info-row">
							<span class="info-label">Resi Bukti</span>
							<span class="info-value"><code>{order.konfirmasi_no_resi || '-'}</code></span>
						</div>
						<div class="info-row">
							<span class="info-label">No. Rekening Pengirim</span>
							<span class="info-value"><strong>{order.no_rek}</strong></span>
						</div>
						<div class="info-row">
							<span class="info-label">Waktu Transfer</span>
							<span class="info-value">{order.tgl_transfer} pukul {order.jam_transfer} WIB</span>
						</div>
					</div>
				</div>
			{:else}
				<div class="empty-proof">
					<p>Belum ada bukti transfer yang dikirimkan oleh pelanggan untuk pesanan ini.</p>
				</div>
			{/if}

			<!-- Aksi Operator berdasarkan status -->
			<div class="action-section">
				<h3>Tindakan Operator</h3>

				{#if order.status === 'Dalam Proses'}
					<p class="action-desc">
						Pelanggan telah mengirimkan bukti transfer. Silakan periksa mutasi rekening loket dan tentukan tindakan berikut:
					</p>

					<div class="button-group">
						<Button
							variant="primary"
							disabled={submitting}
							onclick={() => ubahStatus('Lunas')}
						>
							{#if submitting && actionType === 'Lunas'}
								<span class="spinner" aria-hidden="true"></span>
								<span>Memproses...</span>
							{:else}
								<span>&check; Verifikasi & Set Lunas</span>
							{/if}
						</Button>

						<button
							type="button"
							class="btn-reject"
							disabled={submitting}
							onclick={() => ubahStatus('Belum Bayar')}
						>
							{#if submitting && actionType === 'Belum Bayar'}
								<span class="spinner" aria-hidden="true"></span>
								<span>Mengembalikan...</span>
							{:else}
								<span>&times; Tolak & Kembalikan ke Belum Bayar</span>
							{/if}
						</button>
					</div>
				{:else if order.status === 'Lunas'}
					<div class="status-notice status-notice-success">
						<strong>Status Pesanan: LUNAS</strong>
						<p>Pesanan ini telah diverifikasi dan lunas. Status ini bersifat final dan tidak dapat diubah lagi.</p>
					</div>
				{:else if order.status === 'Belum Bayar'}
					<div class="status-notice status-notice-warning">
						<strong>Status Pesanan: BELUM BAYAR</strong>
						<p>Menunggu pelanggan menyelesaikan pembayaran dan mengirimkan bukti transfer ke meja loket.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if toastMsg}
	<Toast
		message={toastMsg}
		type={toastType}
		duration={3500}
		onclose={() => (toastMsg = '')}
	/>
{/if}

<style>
	.detail-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.breadcrumb {
		margin-bottom: var(--space-1);
	}

	.back-link {
		color: var(--text-muted);
		text-decoration: none;
		font-weight: 500;
		font-size: 14px;
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		transition: color var(--transition-fast);
	}

	.back-link:hover {
		color: var(--accent);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-bottom: 1px solid var(--border);
		padding-bottom: var(--space-3);
	}

	.page-header h1 {
		margin: var(--space-2) 0 0 0;
		font-size: 1.5rem;
		color: var(--text-dark);
	}

	.resi-badge-container {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.resi-label {
		font-size: 13px;
		color: var(--text-muted);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.resi-val {
		font-family: monospace;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		background-color: var(--surface-alt);
		padding: 2px 8px;
		border-radius: var(--radius);
		border: 1px solid var(--border);
	}

	.alert {
		padding: var(--space-3);
		border-radius: var(--radius);
		font-size: 14px;
	}

	.alert-danger {
		background-color: #fee2e2;
		color: #991b1b;
		border: 1px solid #f87171;
	}

	.grid-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-4);
	}

	@media (min-width: 840px) {
		.grid-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.card {
		background-color: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: var(--space-4);
		box-shadow: var(--shadow-sm);
	}

	.card h2 {
		margin-top: 0;
		margin-bottom: var(--space-3);
		font-size: 1.15rem;
		color: var(--text-dark);
		border-bottom: 1px solid var(--border);
		padding-bottom: var(--space-2);
	}

	.info-table {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) 0;
		border-bottom: 1px dashed var(--border);
		font-size: 14px;
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		color: var(--text-muted);
	}

	.info-value {
		color: var(--text-dark);
		text-align: right;
	}

	.highlight-seat {
		background-color: #eff6ff;
		color: #1e40af;
		padding: 2px 8px;
		border-radius: var(--radius);
	}

	.total-row {
		margin-top: var(--space-2);
		padding-top: var(--space-3);
		border-top: 2px solid var(--border);
		border-bottom: none;
	}

	.total-row .info-label {
		font-weight: 700;
		font-size: 15px;
		color: var(--text-dark);
	}

	.total-row .price {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--accent);
	}

	.proof-box {
		background-color: var(--surface-alt);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.proof-header {
		margin-bottom: var(--space-2);
	}

	.proof-badge {
		display: inline-block;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background-color: #dbeafe;
		color: #1e40af;
		padding: 3px 8px;
		border-radius: var(--radius);
	}

	.empty-proof {
		background-color: var(--surface-alt);
		border: 1px dashed var(--border);
		border-radius: var(--radius);
		padding: var(--space-4);
		text-align: center;
		color: var(--text-muted);
		font-size: 14px;
		margin-bottom: var(--space-4);
	}

	.action-section h3 {
		font-size: 1rem;
		margin-top: 0;
		margin-bottom: var(--space-2);
		color: var(--text-dark);
	}

	.action-desc {
		font-size: 14px;
		color: var(--text-muted);
		margin-bottom: var(--space-3);
		line-height: 1.5;
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	@media (min-width: 500px) {
		.button-group {
			flex-direction: row;
		}
	}

	.btn-reject {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: 0.5rem 1rem;
		font-size: 14px;
		font-weight: 600;
		border-radius: var(--radius);
		border: 1px solid #ef4444;
		background-color: #fef2f2;
		color: #b91c1c;
		cursor: pointer;
		transition: background-color var(--transition-fast), opacity var(--transition-fast);
		font-family: inherit;
	}

	.btn-reject:hover:not(:disabled) {
		background-color: #fee2e2;
	}

	.btn-reject:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.status-notice {
		padding: var(--space-3);
		border-radius: var(--radius);
		font-size: 14px;
		line-height: 1.5;
	}

	.status-notice strong {
		display: block;
		margin-bottom: var(--space-1);
	}

	.status-notice p {
		margin: 0;
	}

	.status-notice-success {
		background-color: #f0fdf4;
		color: #166534;
		border: 1px solid #bbf7d0;
	}

	.status-notice-warning {
		background-color: #fffbeb;
		color: #92400e;
		border: 1px solid #fde68a;
	}

	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spin 0.75s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
	}
</style>
