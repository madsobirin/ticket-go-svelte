<script>
	let { data } = $props();

	function handlePrint() {
		window.print();
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Booking Slip #{data.order.no_resi} - Travel Lampung</title>
</svelte:head>

<div class="ticket-page">
	<div class="action-bar no-print">
		<a href="/member/pesanan/{data.order.id_pesan}/bayar" class="back-link">&larr; Kembali ke Pembayaran</a>
		<div class="btn-group">
			<button class="btn btn-secondary" onclick={handlePrint}>
				&#128438; Cetak
			</button>
			<button class="btn btn-primary" onclick={handlePrint}>
				&#128190; Simpan PDF (A5)
			</button>
		</div>
	</div>

	<!-- Printable A5 Slip Container -->
	<div class="ticket-slip" id="printable-slip">
		<header class="slip-header">
			<div class="header-left">
				<h1 class="company-name">TRAVEL ANTARKOTA LAMPUNG</h1>
				<p class="company-sub">Layanan Angkutan Resmi Antarkota Dalam Provinsi</p>
			</div>
			<div class="header-right">
				<div class="slip-title">BOOKING SLIP</div>
				<div class="slip-resi">{data.order.no_resi}</div>
			</div>
		</header>

		<div class="slip-divider"></div>

		<section class="slip-grid">
			<div class="slip-field">
				<span class="field-label">Nama Penumpang</span>
				<strong class="field-val">{data.order.nama_member}</strong>
			</div>
			<div class="slip-field">
				<span class="field-label">Status Pesanan</span>
				<span class="status-tag status-{data.order.status === 'Lunas' ? 'lunas' : data.order.status === 'Dalam Proses' ? 'proses' : 'belum'}">
					{data.order.status}
				</span>
			</div>
			<div class="slip-field full">
				<span class="field-label">Rute Perjalanan</span>
				<strong class="field-val highlight">{data.order.nm_kota_asal} &rarr; {data.order.nm_kota_tujuan}</strong>
			</div>
			<div class="slip-field">
				<span class="field-label">Tanggal Berangkat</span>
				<strong class="field-val">{data.order.tgl_berangkat}</strong>
			</div>
			<div class="slip-field">
				<span class="field-label">Jam Keberangkatan</span>
				<strong class="field-val">{data.order.jam_berangkat} WIB</strong>
			</div>
			<div class="slip-field">
				<span class="field-label">Armada Travel</span>
				<span class="field-val">{data.order.jenis_mobil} ({data.order.nomor_polisi})</span>
			</div>
			<div class="slip-field">
				<span class="field-label">Nomor Kursi</span>
				<strong class="field-val seat-box">Kursi {data.order.nomor_kursi}</strong>
			</div>
			<div class="slip-field full bank-field">
				<span class="field-label">Rekening Pembayaran Tujuan</span>
				<span class="field-val">{data.bank.fullName} ({data.bank.accountNumber}) a.n. {data.bank.accountHolder}</span>
			</div>
		</section>

		<div class="slip-divider"></div>

		<footer class="slip-footer">
			<div class="total-block">
				<span class="total-label">Total Tagihan:</span>
				<strong class="total-amount">{formatRupiah(data.order.harga)}</strong>
			</div>
			<div class="notes-block">
				<p>Harap tunjukkan bukti booking slip ini kepada petugas loket saat keberangkatan.</p>
				<p class="timestamp">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
			</div>
		</footer>
	</div>
</div>

<style>
	@page {
		size: A5;
		margin: 10mm;
	}

	.ticket-page {
		max-width: 650px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.action-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.back-link {
		color: var(--text-muted);
		text-decoration: none;
		font-size: 14px;
	}

	.back-link:hover {
		color: var(--text);
	}

	.btn-group {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		border-radius: var(--radius);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		border: 1px solid transparent;
		transition: all var(--transition-fast);
	}

	.btn-primary {
		background: var(--accent);
		color: #ffffff;
	}

	.btn-primary:hover {
		background: var(--accent-hover);
	}

	.btn-secondary {
		background: var(--surface);
		border-color: var(--border);
		color: var(--text);
	}

	.btn-secondary:hover {
		border-color: var(--text-muted);
	}

	/* Ticket Slip Styling */
	.ticket-slip {
		background: #ffffff;
		color: #111111;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 2rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
	}

	.slip-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.company-name {
		font-size: 15px;
		font-weight: 700;
		margin: 0;
		color: #111111;
		letter-spacing: 0.05em;
	}

	.company-sub {
		font-size: 11px;
		color: #666666;
		margin: 0.2rem 0 0;
	}

	.header-right {
		text-align: right;
	}

	.slip-title {
		font-size: 12px;
		font-weight: 700;
		color: #2563EB;
		letter-spacing: 0.08em;
	}

	.slip-resi {
		font-family: monospace;
		font-size: 16px;
		font-weight: 700;
		color: #111111;
	}

	.slip-divider {
		height: 1px;
		background: #E5E5E5;
		margin: 1.25rem 0;
	}

	.slip-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.slip-field {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.slip-field.full {
		grid-column: span 2;
	}

	.field-label {
		font-size: 11px;
		color: #777777;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.field-val {
		font-size: 14px;
		color: #111111;
	}

	.field-val.highlight {
		font-size: 17px;
		color: #2563EB;
	}

	.seat-box {
		display: inline-block;
		background: #F4F4F5;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 13px;
		width: fit-content;
	}

	.status-tag {
		display: inline-block;
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 12px;
		width: fit-content;
	}

	.status-tag.status-belum {
		background: #F4F4F5;
		color: #71717A;
	}

	.status-tag.status-proses {
		background: #FEF9C3;
		color: #A16207;
	}

	.status-tag.status-lunas {
		background: #DCFCE7;
		color: #15803D;
	}

	.slip-footer {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.total-block {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #F8FAFC;
		border: 1px solid #E2E8F0;
		border-radius: 8px;
		padding: 0.75rem 1rem;
	}

	.total-label {
		font-size: 14px;
		font-weight: 600;
		color: #334155;
	}

	.total-amount {
		font-size: 18px;
		font-weight: 700;
		color: #2563EB;
	}

	.notes-block p {
		margin: 0;
		font-size: 11px;
		color: #777777;
		line-height: 1.4;
	}

	.notes-block .timestamp {
		margin-top: 0.25rem;
		font-style: italic;
	}

	/* Print styles */
	@media print {
		.no-print {
			display: none !important;
		}

		:global(body) {
			background: #ffffff !important;
			color: #000000 !important;
		}

		:global(.member-header), :global(header), :global(nav) {
			display: none !important;
		}

		.ticket-page {
			max-width: 100% !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		.ticket-slip {
			border: 1px solid #CCCCCC !important;
			box-shadow: none !important;
			padding: 15mm !important;
			width: 100% !important;
		}
	}
</style>
