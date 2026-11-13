<script>
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { data } = $props();

	// Bank state (in page state only, not in DB)
	let selectedBank = $state(data.banks[0]);
	let copied = $state(false);

	// Modal state
	let showModal = $state(false);
	let noRek = $state('');
	let tglTransfer = $state(new Date().toISOString().split('T')[0]);
	let jamTransfer = $state(new Date().toTimeString().slice(0, 5));

	let submitStatus = $state('idle'); // 'idle' | 'loading' | 'success'
	let toastMsg = $state('');
	let toastType = $state('error');

	let prefersReducedMotion = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const handler = (e) => (prefersReducedMotion = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	function copyAccount() {
		navigator.clipboard.writeText(selectedBank.accountNumber);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function handleKeydown(e) {
		if (e.key === 'Escape' && showModal) {
			showModal = false;
		}
	}

	async function handleSubmitProof(e) {
		e.preventDefault();
		submitStatus = 'loading';
		toastMsg = '';

		try {
			const res = await fetch(`/api/member/pesanan/${data.order.id_pesan}/kirim`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					no_rek: noRek.trim(),
					tgl_transfer: tglTransfer,
					jam_transfer: jamTransfer
				})
			});

			const json = await res.json();
			if (!res.ok) {
				submitStatus = 'idle';
				toastMsg = json.error?.message ?? 'Gagal mengirim bukti pembayaran';
				toastType = 'error';
				return;
			}

			submitStatus = 'success';
			toastMsg = 'Bukti pembayaran berhasil dikirim ke loket!';
			toastType = 'success';

			setTimeout(() => {
				showModal = false;
				window.location.href = '/member/pesanan';
			}, 700);
		} catch {
			submitStatus = 'idle';
			toastMsg = 'Terjadi kesalahan sistem';
			toastType = 'error';
		}
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="pay-page">
	<a href="/member/pesanan" class="back-link">&larr; Kembali ke Daftar Pesanan</a>

	<div class="page-title">
		<h1>Pembayaran Tiket</h1>
		<p class="subtitle">Selesaikan pembayaran langsung melalui transfer bank di bawah ini</p>
	</div>

	<div class="pay-grid">
		<!-- Left: Bank Selection & Transfer Instructions -->
		<div class="card main-pay-card">
			<h2>1. Pilih Bank Tujuan Transfer</h2>
			<p class="instruction">Pilih salah satu dari 5 bank resmi travel kami:</p>

			<div class="bank-tabs" role="tablist">
				{#each data.banks as bank}
					<button
						type="button"
						role="tab"
						aria-selected={selectedBank.id === bank.id}
						class="bank-tab"
						class:active={selectedBank.id === bank.id}
						onclick={() => (selectedBank = bank)}
					>
						<strong>{bank.name}</strong>
					</button>
				{/each}
			</div>

			<!-- Animated Bank Details Container -->
			<div class="bank-details-box">
				{#key selectedBank.id}
					<div
						class="bank-detail-content"
						in:fade={{ duration: prefersReducedMotion ? 0 : 250 }}
					>
						<div class="bank-name">{selectedBank.fullName}</div>
						<div class="account-row">
							<div>
								<span class="acc-label">Nomor Rekening Tujuan:</span>
								<div class="acc-number">{selectedBank.accountNumber}</div>
								<div class="acc-holder">a.n. {selectedBank.accountHolder}</div>
							</div>
							<button type="button" class="btn-copy" onclick={copyAccount}>
								{copied ? '✓ Tersalin!' : 'Salin Rekening'}
							</button>
						</div>
					</div>
				{/key}
			</div>

			<div class="notice-box">
				<strong>Petunjuk Transfer:</strong>
				<ol>
					<li>Transfer tepat sejumlah <strong>{formatRupiah(data.order.harga)}</strong> ke rekening di atas.</li>
					<li>Simpan bukti struk transfer ATM atau tangkapan layar m-Banking.</li>
					<li>Klik tombol <strong>"Kirim Bukti ke Meja Loket"</strong> setelah transfer selesai.</li>
				</ol>
			</div>
		</div>

		<!-- Right: Order Summary & Actions -->
		<div class="card summary-card">
			<h2>Ringkasan Tagihan</h2>

			<div class="summary-list">
				<div class="summary-item">
					<span class="label">Nomor Resi</span>
					<strong class="resi-badge">{data.order.no_resi}</strong>
				</div>
				<div class="summary-item">
					<span class="label">Rute</span>
					<strong>{data.order.nm_kota_asal} &rarr; {data.order.nm_kota_tujuan}</strong>
				</div>
				<div class="summary-item">
					<span class="label">Jadwal</span>
					<span>{data.order.tgl_berangkat} ({data.order.jam_berangkat} WIB)</span>
				</div>
				<div class="summary-item">
					<span class="label">Armada</span>
					<span>{data.order.jenis_mobil} ({data.order.nomor_polisi})</span>
				</div>
				<div class="summary-item">
					<span class="label">Nomor Kursi</span>
					<span class="seat-badge">Kursi {data.order.nomor_kursi}</span>
				</div>
				<div class="summary-item total-item">
					<span class="label">Total Pembayaran</span>
					<strong class="total-price">{formatRupiah(data.order.harga)}</strong>
				</div>
			</div>

			<div class="action-stack">
				<a
					href="/member/pesanan/{data.order.id_pesan}/tiket?bank={selectedBank.name}"
					class="btn-slip"
				>
					Unduh Bukti Tagihan / Booking Slip
				</a>

				{#if data.order.status === 'Belum Bayar'}
					<Button variant="primary" onclick={() => (showModal = true)}>
						Kirim Bukti ke Meja Loket &rarr;
					</Button>
				{:else}
					<div class="status-already">
						Status saat ini: <strong>{data.order.status}</strong>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Modal Kirim Bukti Transfer -->
	{#if showModal}
		<div class="modal-overlay" transition:fade={{ duration: prefersReducedMotion ? 0 : 200 }}>
			<div
				class="modal-card"
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				transition:scale={{ duration: prefersReducedMotion ? 0 : 250, start: 0.95 }}
			>
				<div class="modal-header">
					<h3 id="modal-title">Kirim Bukti Pembayaran</h3>
					<button
						type="button"
						class="btn-close"
						onclick={() => (showModal = false)}
						aria-label="Tutup"
					>&times;</button>
				</div>

				<form onsubmit={handleSubmitProof}>
					<p class="modal-sub">
						Konfirmasi transfer untuk resi <strong>{data.order.no_resi}</strong> ke bank <strong>{selectedBank.name}</strong>.
					</p>

					<Input
						label="Nomor Rekening Pengirim"
						placeholder="Nomor rekening bank Anda"
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

					<div class="modal-actions">
						<Button
							type="button"
							variant="secondary"
							onclick={() => (showModal = false)}
							disabled={submitStatus === 'loading'}
						>
							Batal
						</Button>

						<button
							type="submit"
							class="btn-submit-loket"
							class:loading={submitStatus === 'loading'}
							class:success={submitStatus === 'success'}
							disabled={submitStatus !== 'idle'}
						>
							{#if submitStatus === 'loading'}
								<span class="spinner"></span>
								<span>Mengirim ke Loket...</span>
							{:else if submitStatus === 'success'}
								<span class="check-icon">&#10003;</span>
								<span>Terkirim!</span>
							{:else}
								<span>Kirim Sekarang</span>
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	{#if toastMsg}
		<Toast message={toastMsg} type={toastType} onclose={() => (toastMsg = '')} />
	{/if}
</div>

<style>
	.pay-page {
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
	.page-title h1 {
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
	.pay-grid {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: 1.5rem;
		align-items: start;
	}
	@media (max-width: 860px) {
		.pay-grid {
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
		font-size: 17px;
		font-weight: 600;
		margin: 0 0 0.5rem;
		color: var(--text);
	}
	.instruction {
		font-size: 14px;
		color: var(--text-muted);
		margin: 0 0 1rem;
	}
	.bank-tabs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}
	.bank-tab {
		flex: 1;
		min-width: 60px;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--text-muted);
		font-size: 14px;
		cursor: pointer;
		transition: all var(--transition-fast);
		font-family: inherit;
		text-align: center;
	}
	.bank-tab:hover {
		border-color: var(--accent);
		color: var(--text);
	}
	.bank-tab.active {
		background: var(--surface);
		border-color: var(--accent);
		color: var(--accent);
		box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
	}
	.bank-details-box {
		min-height: 110px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1.25rem;
		margin-bottom: 1.5rem;
	}
	.bank-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-muted);
		margin-bottom: 0.5rem;
	}
	.account-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.acc-label {
		font-size: 12px;
		color: var(--text-muted);
		display: block;
	}
	.acc-number {
		font-size: 20px;
		font-weight: 700;
		letter-spacing: 0.05em;
		color: var(--accent);
		font-family: monospace;
	}
	.acc-holder {
		font-size: 12px;
		color: var(--text-muted);
	}
	.btn-copy {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.45rem 0.85rem;
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.btn-copy:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.notice-box {
		background: rgba(37, 99, 235, 0.04);
		border: 1px solid rgba(37, 99, 235, 0.2);
		border-radius: var(--radius);
		padding: 1rem 1.25rem;
		font-size: 13px;
	}
	.notice-box ol {
		margin: 0.5rem 0 0;
		padding-left: 1.2rem;
		line-height: 1.6;
	}
	.summary-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 1.25rem 0;
	}
	.summary-item {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
	}
	.summary-item .label {
		color: var(--text-muted);
	}
	.resi-badge {
		font-family: monospace;
		background: var(--bg);
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid var(--border);
	}
	.seat-badge {
		background: var(--bg);
		padding: 2px 6px;
		border-radius: 4px;
	}
	.total-item {
		padding-top: 0.75rem;
		border-top: 1px solid var(--border);
		margin-top: 0.25rem;
	}
	.total-price {
		font-size: 18px;
		color: var(--accent);
	}
	.action-stack {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}
	.btn-slip {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.65rem 1rem;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		color: var(--text);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		transition: all var(--transition-fast);
		text-align: center;
	}
	.btn-slip:hover {
		background: var(--surface);
		border-color: var(--text-muted);
	}
	.status-already {
		text-align: center;
		padding: 0.75rem;
		background: var(--bg);
		border-radius: var(--radius);
		font-size: 13px;
		color: var(--text-muted);
	}
	/* Modal styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 1rem;
	}
	.modal-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.75rem;
		width: 100%;
		max-width: 440px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
	}
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.modal-header h3 {
		font-size: 18px;
		font-weight: 600;
		margin: 0;
		color: var(--text);
	}
	.btn-close {
		background: transparent;
		border: none;
		font-size: 22px;
		cursor: pointer;
		color: var(--text-muted);
		padding: 0;
		line-height: 1;
	}
	.modal-sub {
		font-size: 13px;
		color: var(--text-muted);
		margin-bottom: 1.25rem;
	}
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}
	.btn-submit-loket {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.55rem 1.1rem;
		border-radius: var(--radius);
		border: none;
		background: var(--accent);
		color: #ffffff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: background-color var(--transition-fast);
	}
	.btn-submit-loket:hover:not(:disabled) {
		background: var(--accent-hover);
	}
	.btn-submit-loket.loading {
		opacity: 0.8;
		cursor: wait;
	}
	.btn-submit-loket.success {
		background: var(--status-lunas);
	}
	.spinner {
		width: 14px;
		height: 14px;
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
</style>
