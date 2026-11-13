<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import Button from '$lib/components/Button.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { data } = $props();

	let selectedSeats = $state([]);
	let loading = $state(false);
	let toastMsg = $state('');
	let toastType = $state('success');

	const animatedPrice = tweened(0, {
		duration: 300,
		easing: cubicOut
	});

	$effect(() => {
		animatedPrice.set(selectedSeats.length * data.jadwal.harga);
	});

	function toggleSeat(seatNum) {
		if (data.bookedSeats.includes(seatNum)) return;

		if (selectedSeats.includes(seatNum)) {
			selectedSeats = selectedSeats.filter((s) => s !== seatNum);
		} else {
			if (selectedSeats.length >= 5) {
				toastMsg = 'Maksimal 5 kursi per pemesanan';
				toastType = 'error';
				return;
			}
			selectedSeats = [...selectedSeats, seatNum];
		}
	}

	async function handleBooking() {
		if (selectedSeats.length === 0) {
			toastMsg = 'Silakan pilih minimal 1 kursi';
			toastType = 'error';
			return;
		}

		loading = true;
		toastMsg = '';

		try {
			const res = await fetch('/api/member/pesan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id_jadwal: data.jadwal.id_jadwal,
					nomor_kursi: selectedSeats
				})
			});

			const json = await res.json();
			if (!res.ok) {
				toastMsg = json.error?.message ?? 'Pemesanan gagal';
				toastType = 'error';
				return;
			}

			toastMsg = 'Pemesanan berhasil! Mengarahkan ke pembayaran...';
			toastType = 'success';
			setTimeout(() => {
				window.location.href = json.data.redirect || '/member/pesanan';
			}, 700);
		} catch {
			toastMsg = 'Terjadi kesalahan sistem';
			toastType = 'error';
		} finally {
			loading = false;
		}
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<div class="booking-page">
	<a href="/member" class="back-link">&larr; Kembali ke Pencarian</a>

	<div class="booking-grid">
		<!-- Seat Selection Panel -->
		<div class="card seat-panel">
			<h2>Pilih Kursi</h2>
			<p class="subtitle">Klik kursi yang ingin Anda pesan</p>

			<div class="van-layout">
				<div class="windshield">Depan / Kaca Depan</div>

				<!-- Front Row -->
				<div class="seat-row">
					<div class="seat driver" aria-disabled="true">
						<span class="seat-num">Sopir</span>
					</div>
					<button
						type="button"
						class="seat"
						class:taken={data.bookedSeats.includes(1)}
						class:selected={selectedSeats.includes(1)}
						disabled={data.bookedSeats.includes(1)}
						aria-pressed={selectedSeats.includes(1)}
						onclick={() => toggleSeat(1)}
					>
						<span class="seat-num">1</span>
						<span class="seat-status">{data.bookedSeats.includes(1) ? 'Terisi' : 'Tersedia'}</span>
					</button>
				</div>

				<!-- Middle Row -->
				<div class="seat-row">
					<button
						type="button"
						class="seat"
						class:taken={data.bookedSeats.includes(2)}
						class:selected={selectedSeats.includes(2)}
						disabled={data.bookedSeats.includes(2)}
						aria-pressed={selectedSeats.includes(2)}
						onclick={() => toggleSeat(2)}
					>
						<span class="seat-num">2</span>
						<span class="seat-status">{data.bookedSeats.includes(2) ? 'Terisi' : 'Tersedia'}</span>
					</button>
					<button
						type="button"
						class="seat"
						class:taken={data.bookedSeats.includes(3)}
						class:selected={selectedSeats.includes(3)}
						disabled={data.bookedSeats.includes(3)}
						aria-pressed={selectedSeats.includes(3)}
						onclick={() => toggleSeat(3)}
					>
						<span class="seat-num">3</span>
						<span class="seat-status">{data.bookedSeats.includes(3) ? 'Terisi' : 'Tersedia'}</span>
					</button>
				</div>

				<!-- Back Row -->
				<div class="seat-row">
					<button
						type="button"
						class="seat"
						class:taken={data.bookedSeats.includes(4)}
						class:selected={selectedSeats.includes(4)}
						disabled={data.bookedSeats.includes(4)}
						aria-pressed={selectedSeats.includes(4)}
						onclick={() => toggleSeat(4)}
					>
						<span class="seat-num">4</span>
						<span class="seat-status">{data.bookedSeats.includes(4) ? 'Terisi' : 'Tersedia'}</span>
					</button>
					<button
						type="button"
						class="seat"
						class:taken={data.bookedSeats.includes(5)}
						class:selected={selectedSeats.includes(5)}
						disabled={data.bookedSeats.includes(5)}
						aria-pressed={selectedSeats.includes(5)}
						onclick={() => toggleSeat(5)}
					>
						<span class="seat-num">5</span>
						<span class="seat-status">{data.bookedSeats.includes(5) ? 'Terisi' : 'Tersedia'}</span>
					</button>
				</div>
			</div>

			<!-- Legend -->
			<div class="seat-legend">
				<div class="legend-item"><span class="legend-box available"></span> Tersedia</div>
				<div class="legend-item"><span class="legend-box selected"></span> Dipilih</div>
				<div class="legend-item"><span class="legend-box taken"></span> Terisi</div>
			</div>
		</div>

		<!-- Summary Panel -->
		<div class="card summary-panel">
			<h2>Detail Perjalanan</h2>

			<div class="trip-details">
				<div class="detail-row">
					<span class="label">Rute</span>
					<strong class="value">{data.jadwal.nm_kota_asal} &rarr; {data.jadwal.nm_kota_tujuan}</strong>
				</div>
				<div class="detail-row">
					<span class="label">Tanggal</span>
					<span class="value">{data.jadwal.tgl_berangkat}</span>
				</div>
				<div class="detail-row">
					<span class="label">Jam</span>
					<span class="value">{data.jadwal.jam_berangkat} WIB</span>
				</div>
				<div class="detail-row">
					<span class="label">Armada</span>
					<span class="value">{data.jadwal.jenis_mobil} ({data.jadwal.nomor_polisi})</span>
				</div>
				<div class="detail-row">
					<span class="label">Harga per Kursi</span>
					<span class="value">{formatRupiah(data.jadwal.harga)}</span>
				</div>
			</div>

			<div class="selection-summary">
				<div class="summary-line">
					<span>Kursi Dipilih:</span>
					<strong>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Belum ada'}</strong>
				</div>
				<div class="summary-line total-line">
					<span>Total Pembayaran:</span>
					<strong class="total-price">{formatRupiah(Math.round($animatedPrice))}</strong>
				</div>
			</div>

			<Button
				variant="primary"
				disabled={selectedSeats.length === 0 || loading}
				onclick={handleBooking}
			>
				{loading ? 'Memproses Pesanan...' : 'Pesan Sekarang'}
			</Button>
		</div>
	</div>

	{#if toastMsg}
		<Toast message={toastMsg} type={toastType} onclose={() => (toastMsg = '')} />
	{/if}
</div>

<style>
	.booking-page {
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
	.booking-grid {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: 1.5rem;
		align-items: start;
	}
	@media (max-width: 800px) {
		.booking-grid {
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
		font-size: 18px;
		font-weight: 600;
		margin: 0;
		color: var(--text);
	}
	.subtitle {
		font-size: 14px;
		color: var(--text-muted);
		margin: 0.25rem 0 1.5rem;
	}
	.van-layout {
		max-width: 280px;
		margin: 0 auto;
		background: var(--bg);
		border: 2px dashed var(--border);
		border-radius: 20px;
		padding: 1.5rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.windshield {
		text-align: center;
		font-size: 12px;
		color: var(--text-muted);
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}
	.seat-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.seat {
		flex: 1;
		min-height: 64px;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-family: inherit;
		transition: transform var(--transition-fast), background-color var(--transition-fast), border-color var(--transition-fast);
	}
	.seat:hover:not(:disabled) {
		transform: scale(1.05);
		border-color: var(--accent);
	}
	.seat.driver {
		background: transparent;
		border: 1px dashed var(--border);
		color: var(--text-muted);
		cursor: default;
	}
	.seat.taken {
		background-color: var(--seat-taken);
		color: var(--text-muted);
		cursor: not-allowed;
		border-color: transparent;
	}
	.seat.selected {
		background-color: var(--accent);
		color: #ffffff;
		border-color: var(--accent);
	}
	.seat-num {
		font-weight: 600;
		font-size: 15px;
	}
	.seat-status {
		font-size: 11px;
		opacity: 0.8;
	}
	.seat-legend {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-top: 1.5rem;
		font-size: 13px;
		color: var(--text-muted);
	}
	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.legend-box {
		width: 14px;
		height: 14px;
		border-radius: 3px;
		border: 1px solid var(--border);
	}
	.legend-box.available {
		background: var(--surface);
	}
	.legend-box.selected {
		background: var(--accent);
		border-color: var(--accent);
	}
	.legend-box.taken {
		background: var(--seat-taken);
		border-color: transparent;
	}
	.trip-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 1.25rem 0;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--border);
	}
	.detail-row {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
	}
	.detail-row .label {
		color: var(--text-muted);
	}
	.selection-summary {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.summary-line {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
	}
	.total-line {
		font-size: 16px;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
	}
	.total-price {
		font-size: 18px;
		color: var(--accent);
	}
</style>
