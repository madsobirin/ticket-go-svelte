<script>
	import Input from '$lib/components/Input.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { data } = $props();

	let noResi = $state('');
	let noRek = $state('');
	let tglTransfer = $state(new Date().toISOString().split('T')[0]);
	let jamTransfer = $state(new Date().toTimeString().slice(0, 5));

	let status = $state('idle'); // 'idle' | 'loading' | 'success'
	let toastMsg = $state('');
	let toastType = $state('error');

	async function handleSubmit(e) {
		e.preventDefault();
		status = 'loading';
		toastMsg = '';

		try {
			const res = await fetch(`/api/member/pesanan/${data.order.id_pesan}/konfirmasi`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					no_resi: noResi.trim(),
					no_rek: noRek.trim(),
					tgl_transfer: tglTransfer,
					jam_transfer: jamTransfer
				})
			});

			const json = await res.json();
			if (!res.ok) {
				status = 'idle';
				toastMsg = json.error?.message ?? 'Gagal mengirim bukti transfer';
				toastType = 'error';
				return;
			}

			// Berhasil: tampilkan centang singkat, lalu redirect
			status = 'success';
			toastMsg = 'Bukti pembayaran berhasil dikirim!';
			toastType = 'success';

			setTimeout(() => {
				window.location.href = '/member/pesanan';
			}, 700);
		} catch {
			status = 'idle';
			toastMsg = 'Terjadi kesalahan sistem';
			toastType = 'error';
		}
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<div class="confirm-page">
	<a href="/member/pesanan" class="back-link">&larr; Kembali ke Daftar Pesanan</a>

	<div class="confirm-grid">
		<!-- Form Card -->
		<div class="card form-card">
			<h1>Kirim Bukti Pembayaran</h1>
			<p class="subtitle">Isi data transfer sesuai bukti struk ATM atau m-Banking Anda</p>

			<form onsubmit={handleSubmit}>
				<Input
					label="Nomor Resi / Referensi Transfer"
					placeholder="misal: 041422680263"
					bind:value={noResi}
					required
					maxlength="20"
				/>

				<Input
					label="Nomor Rekening Pengirim"
					placeholder="misal: 1234567890"
					bind:value={noRek}
					required
					maxlength="20"
				/>

				<div class="form-row">
					<Input
						label="Tanggal Transfer"
						type="date"
						bind:value={tglTransfer}
						required
					/>
					<Input
						label="Jam Transfer"
						type="time"
						bind:value={jamTransfer}
						required
					/>
				</div>

				<button
					type="submit"
					class="btn-submit"
					class:loading={status === 'loading'}
					class:success={status === 'success'}
					disabled={status !== 'idle'}
				>
					{#if status === 'loading'}
						<span class="spinner"></span>
						<span>Memverifikasi...</span>
					{:else if status === 'success'}
						<span class="check-icon">&#10003;</span>
						<span>Berhasil Terkirim</span>
					{:else}
						<span>Kirim Bukti Transfer</span>
					{/if}
				</button>
			</form>
		</div>

		<!-- Order Summary Card -->
		<div class="card summary-card">
			<h2>Ringkasan Tagihan</h2>
			<div class="summary-details">
				<div class="detail-row">
					<span class="label">Kode Pesanan</span>
					<strong>#{data.order.id_pesan}</strong>
				</div>
				<div class="detail-row">
					<span class="label">Rute</span>
					<strong>{data.order.nm_kota_asal} &rarr; {data.order.nm_kota_tujuan}</strong>
				</div>
				<div class="detail-row">
					<span class="label">Nomor Kursi</span>
					<span>Kursi {data.order.nomor_kursi}</span>
				</div>
				<div class="detail-row">
					<span class="label">Keberangkatan</span>
					<span>{data.order.tgl_berangkat} - {data.order.jam_berangkat} WIB</span>
				</div>
				<div class="detail-row total-row">
					<span class="label">Total Harus Dibayar</span>
					<strong class="total-amount">{formatRupiah(data.order.harga)}</strong>
				</div>
			</div>

			<div class="bank-info">
				<strong>Rekening Tujuan Travel:</strong>
				<p>Bank BCA: <strong>123-456-7890</strong><br />a.n. PT Travel Antarkota Lampung</p>
			</div>
		</div>
	</div>

	{#if toastMsg}
		<Toast message={toastMsg} type={toastType} onclose={() => (toastMsg = '')} />
	{/if}
</div>

<style>
	.confirm-page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.back-link {
		color: var(--text-muted);
		text-decoration: none;
		font-size: 14px;
		display: inline-flex;
		align-items: center;
		transition: color var(--transition-fast);
	}
	.back-link:hover {
		color: var(--text);
	}
	.confirm-grid {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 1.5rem;
		align-items: start;
	}
	@media (max-width: 768px) {
		.confirm-grid {
			grid-template-columns: 1fr;
		}
	}
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
	}
	.card h1 {
		font-size: 20px;
		font-weight: 600;
		margin: 0;
		color: var(--text);
	}
	.card h2 {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 1rem;
		color: var(--text);
	}
	.subtitle {
		font-size: 14px;
		color: var(--text-muted);
		margin: 0.25rem 0 1.5rem;
	}
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.btn-submit {
		width: 100%;
		padding: 0.75rem;
		border-radius: var(--radius);
		border: none;
		background: var(--accent);
		color: #ffffff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: inherit;
		transition: background-color var(--transition-fast);
	}
	.btn-submit:hover:not(:disabled) {
		background: var(--accent-hover);
	}
	.btn-submit.loading {
		opacity: 0.8;
		cursor: wait;
	}
	.btn-submit.success {
		background-color: var(--status-lunas);
		color: #ffffff;
	}
	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.4);
		border-top-color: #ffffff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.check-icon {
		font-size: 16px;
		font-weight: bold;
	}
	.summary-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: 14px;
	}
	.detail-row {
		display: flex;
		justify-content: space-between;
	}
	.detail-row .label {
		color: var(--text-muted);
	}
	.total-row {
		padding-top: 0.75rem;
		border-top: 1px solid var(--border);
		margin-top: 0.25rem;
	}
	.total-amount {
		font-size: 17px;
		color: var(--accent);
	}
	.bank-info {
		margin-top: 1.5rem;
		background: var(--bg);
		border: 1px dashed var(--border);
		border-radius: var(--radius);
		padding: 0.85rem;
		font-size: 13px;
	}
	.bank-info p {
		margin: 0.35rem 0 0;
		color: var(--text-muted);
		line-height: 1.4;
	}
</style>
