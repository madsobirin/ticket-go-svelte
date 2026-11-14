<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
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

	const sisaKursi = $derived(Math.max(0, 5 - data.bookedSeats.length));

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
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num);
	}

	function formatTanggalIndo(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date);
	}

	function getEstimasiTiba(jamStr) {
		if (!jamStr) return '09:15';
		const parts = jamStr.split(':');
		const h = parseInt(parts[0], 10) || 0;
		const m = parseInt(parts[1], 10) || 0;
		const date = new Date();
		date.setHours(h + 1, m + 15, 0);
		return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	}
</script>

{#snippet seatBox(num, sublabel)}
	{@const isTaken = data.bookedSeats.includes(num)}
	{@const isSelected = selectedSeats.includes(num)}
	<div class="flex flex-col items-center justify-center">
		<button
			type="button"
			disabled={isTaken}
			aria-pressed={isSelected}
			onclick={() => toggleSeat(num)}
			class={`w-20 h-22 rounded-2xl flex flex-col items-center justify-center p-2 transition-all ${
				isTaken
					? 'bg-slate-200/70 border border-slate-300 text-slate-400 cursor-not-allowed'
					: isSelected
						? 'bg-slate-900 border-2 border-purple-600 text-white shadow-md ring-2 ring-purple-600/30 scale-105'
						: 'bg-white border-2 border-slate-200 hover:border-purple-400 text-slate-800 shadow-2xs hover:scale-102 cursor-pointer'
			}`}
		>
			<span class="text-xs font-extrabold mb-1">0{num}</span>
			{#if isTaken}
				<svg class="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="text-[10px] font-medium text-slate-400 mt-1">Terisi</span>
			{:else if isSelected}
				<div class="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="3"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<span class="text-[10px] font-semibold text-purple-300 mt-1">Dipilih</span>
			{:else}
				<svg
					class="w-5 h-5 text-purple-600"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						d="M4 18v3M20 18v3M5 14h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2zM6 14v4M18 14v4"
					/>
				</svg>
				<span class="text-[10px] font-bold text-purple-600 mt-1">Tersedia</span>
			{/if}
		</button>
		<span class="text-[11px] text-slate-500 mt-1.5 font-medium">{sublabel}</span>
	</div>
{/snippet}

<svelte:head>
	<title>Pilih Kursi - {data.jadwal.nm_kota_asal} ke {data.jadwal.nm_kota_tujuan}</title>
</svelte:head>

<div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Breadcrumbs & Top Navigation -->
	<div class="flex items-center gap-2 text-xs font-medium text-slate-500">
		<a href="/member" class="hover:text-purple-600 transition flex items-center gap-1">
			<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			<span>Cari Perjalanan</span>
		</a>
		<span class="text-slate-300">/</span>
		<span class="text-slate-900 font-semibold">Pilih Kursi</span>
	</div>

	<!-- Header Row -->
	<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
		<div>
			<h1
				class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5"
			>
				<span>{data.jadwal.nm_kota_asal}</span>
				<svg
					class="w-5 h-5 text-purple-600 shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M14 5l7 7m0 0l-7 7m7-7H3"
					/>
				</svg>
				<span>{data.jadwal.nm_kota_tujuan}</span>
			</h1>
			<p class="text-xs md:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
				<span>{data.jadwal.jenis_mobil} ({data.jadwal.nomor_polisi})</span>
				<span class="text-slate-300">•</span>
				<span>{formatTanggalIndo(data.jadwal.tgl_berangkat)}</span>
				<span class="text-slate-300">•</span>
				<span class="font-bold text-slate-800">{data.jadwal.jam_berangkat} WIB</span>
			</p>
		</div>

		<div
			class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-800 shrink-0 self-start md:self-auto"
		>
			<span class="w-2 h-2 rounded-full bg-purple-600"></span>
			<span>Sisa {sisaKursi} Kursi Tersedia</span>
		</div>
	</div>

	<!-- 2-Column Grid Layout: Cabin and Summary -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left: Seat Cabin Card -->
		<div class="lg:col-span-7 space-y-6">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
				<!-- Header of Cabin Card -->
				<div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
					<div class="flex items-center gap-3">
						<div
							class="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0"
						>
							<svg
								class="w-5 h-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									d="M4 18v3M20 18v3M5 14h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2zM6 14v4M18 14v4"
								/>
							</svg>
						</div>
						<div>
							<h2 class="text-base font-bold text-slate-900">Pilih Posisi Kursi</h2>
							<p class="text-xs text-slate-500">
								Klik kursi yang ingin Anda tempati untuk perjalanan ini
							</p>
						</div>
					</div>

					<span
						class="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 uppercase"
					>
						{data.jadwal.jenis_mobil?.split(' ')[0] || 'AVANZA'} 6-SEAT
					</span>
				</div>

				<!-- Vehicle Cabin Visual -->
				<!-- Vehicle Cabin Visual: 2D Bus -->
				<div class="max-w-lg mx-auto rounded-3xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
					<!-- Direction Label -->
					<div class="text-center mb-4">
						<span
							class="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500"
						>
							<span class="w-6 h-px bg-slate-300"></span>
							Tampak Atas Kendaraan
							<span class="w-6 h-px bg-slate-300"></span>
						</span>
					</div>

					<!-- Bus Wrapper -->
					<div class="relative mx-auto max-w-[400px] px-5">
						<!-- Roda Kiri -->
						<div
							class="absolute z-0 left-1 top-[24%] w-3 h-14 rounded-full bg-slate-700 shadow-md"
						></div>
						<div
							class="absolute z-0 left-1 bottom-[22%] w-3 h-14 rounded-full bg-slate-700 shadow-md"
						></div>

						<!-- Roda Kanan -->
						<div
							class="absolute z-0 right-1 top-[24%] w-3 h-14 rounded-full bg-slate-700 shadow-md"
						></div>
						<div
							class="absolute z-0 right-1 bottom-[22%] w-3 h-14 rounded-full bg-slate-700 shadow-md"
						></div>

						<!-- Body Bus -->
						<div
							class="relative z-10 overflow-hidden rounded-[3.2rem_3.2rem_2rem_2rem] border-[5px] border-slate-300 bg-gradient-to-b from-slate-100 via-white to-slate-100 shadow-lg"
						>
							<!-- Kaca Depan -->
							<div
								class="mx-3 mt-3 h-14 rounded-[2rem_2rem_0.8rem_0.8rem] border-2 border-slate-400 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden"
							>
								<div class="absolute top-0 left-6 right-6 h-px bg-white/20"></div>

								<div class="flex items-center gap-2 text-white">
									<svg
										class="w-4 h-4 text-purple-300"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											d="M12 19V5m0 0L6 11m6-6 6 6"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									<span class="text-[10px] font-bold tracking-[0.18em]"> DEPAN / ARAH JALAN </span>
								</div>

								<div class="absolute bottom-1 left-8 right-8 h-1 rounded-full bg-white/10"></div>
							</div>

							<!-- Interior Bus -->
							<div class="relative px-3 sm:px-5 py-5">
								<!-- Baris Depan -->
								<div class="grid grid-cols-2 gap-4 items-end px-2">
									<!-- Penumpang Depan Kiri -->
									{@render seatBox(1, 'Depan Kiri')}

									<!-- Sopir Sebelah Kanan -->
									<div class="flex flex-col items-center justify-center">
										<!-- Setir -->
										<div class="mb-1 flex flex-col items-center">
											<svg
												class="w-7 h-7 text-slate-600"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="1.8"
											>
												<circle cx="12" cy="12" r="9" />
												<circle cx="12" cy="12" r="3" />
												<path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
											</svg>
										</div>

										<!-- Kursi Sopir -->
										<div
											class="w-20 h-[88px] rounded-2xl border border-slate-300 bg-slate-200/90 flex flex-col items-center justify-center shadow-inner"
										>
											<svg
												class="w-6 h-6 text-slate-500 mb-1"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="1.8"
											>
												<rect x="4" y="3" width="16" height="18" rx="4" />
												<path d="M7 8h10M7 15h10" />
											</svg>
											<span class="text-[11px] font-extrabold tracking-wider text-slate-600">
												SOPIR
											</span>
										</div>

										<span class="text-[10px] text-slate-400 mt-1.5 font-medium"> Area Kemudi </span>
									</div>
								</div>

								<!-- Pemisah Baris Tengah -->
								<div class="flex items-center gap-3 my-5">
									<div class="h-px bg-slate-200 flex-1"></div>
									<span
										class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase"
									>
										Baris Tengah
									</span>
									<div class="h-px bg-slate-200 flex-1"></div>
								</div>

								<!-- Baris Tengah -->
								<div class="grid grid-cols-[1fr_24px_1fr] gap-2 items-center px-1">
									<!-- Kiri -->
									{@render seatBox(3, 'Tengah Kiri')}

									<!-- Jalur Tengah -->
									<div class="flex items-center justify-center">
										<div class="h-12 w-1 rounded-full bg-slate-200"></div>
									</div>

									<!-- Kanan -->
									{@render seatBox(2, 'Tengah Kanan')}
								</div>

								<!-- Pemisah Baris Belakang -->
								<div class="flex items-center gap-3 my-5">
									<div class="h-px bg-slate-200 flex-1"></div>
									<span
										class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase"
									>
										Baris Belakang
									</span>
									<div class="h-px bg-slate-200 flex-1"></div>
								</div>

								<!-- Baris Belakang -->
								<div class="grid grid-cols-[1fr_24px_1fr] gap-2 items-center px-1">
									<!-- Kiri -->
									{@render seatBox(5, 'Belakang Kiri')}

									<!-- Area Tengah -->
									<div class="flex items-center justify-center">
										<svg
											class="w-5 h-5 text-slate-300"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.8"
										>
											<rect x="5" y="7" width="14" height="14" rx="2" />
											<path d="M9 7V5a3 3 0 0 1 6 0v2" />
										</svg>
									</div>

									<!-- Kanan -->
									{@render seatBox(4, 'Belakang Kanan')}
								</div>
							</div>

							<!-- Kaca Belakang -->
							<div
								class="mx-5 mb-3 h-4 rounded-b-xl border border-slate-300 bg-slate-200 flex items-center justify-center"
							>
								<span class="text-[8px] font-bold tracking-[0.2em] text-slate-400"> REAR </span>
							</div>
						</div>
					</div>

					<!-- Legend -->
					<div
						class="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 mt-6 pt-4 border-t border-slate-200 text-xs"
					>
						<div class="flex items-center gap-1.5 text-slate-600">
							<span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
							<span>Tersedia</span>
						</div>

						<div class="flex items-center gap-1.5 text-slate-800 font-medium">
							<span
								class="w-3.5 h-3.5 rounded bg-slate-900 text-white flex items-center justify-center text-[9px]"
								>✓</span
							>
							<span>Dipilih</span>
						</div>

						<div class="flex items-center gap-1.5 text-slate-400">
							<span
								class="w-3.5 h-3.5 rounded bg-slate-200 text-slate-500 flex items-center justify-center text-[9px]"
								>×</span
							>
							<span>Sudah Terisi</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Luggage Policy Banner -->
			<div
				class="bg-purple-50/70 rounded-2xl border border-purple-100 p-4.5 flex items-start gap-3.5"
			>
				<div
					class="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5"
				>
					<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
				</div>
				<div>
					<h3 class="text-xs font-bold text-slate-900">Kebijakan Bagasi & Fasilitas Perjalanan</h3>
					<p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
						Maksimal 1 koper kabin + 1 tas ransel per kursi. Mobil dilengkapi fasilitas Full AC,
						musik santai, dan colokan charger smartphone pada baris tengah.
					</p>
				</div>
			</div>
		</div>

		<!-- Right: Booking Summary Card -->
		<div class="lg:col-span-5">
			<div
				class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 sticky top-6"
			>
				<!-- Summary Header -->
				<div class="flex items-center justify-between pb-4 border-b border-slate-100">
					<div class="flex items-center gap-2.5">
						<div
							class="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center"
						>
							<svg
								class="w-4.5 h-4.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="2" y="6" width="20" height="12" rx="2" />
								<circle cx="12" cy="12" r="2" />
								<path d="M6 12h.01M18 12h.01" />
							</svg>
						</div>
						<h2 class="text-base font-bold text-slate-900">Ringkasan Pemesanan</h2>
					</div>

					<span
						class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700"
					>
						Eksekutif
					</span>
				</div>

				<!-- Trip Detail Rows -->
				<div class="space-y-3.5 text-xs">
					<div>
						<p class="text-[11px] text-slate-400 font-medium">Rute Perjalanan</p>
						<p class="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
							<span>{data.jadwal.nm_kota_asal}</span>
							<span class="text-purple-600">→</span>
							<span>{data.jadwal.nm_kota_tujuan}</span>
						</p>
					</div>

					<div class="flex justify-between items-baseline gap-2 pt-1">
						<div>
							<p class="text-[11px] text-slate-400 font-medium">Jadwal Keberangkatan</p>
							<p class="font-semibold text-slate-800 mt-0.5">
								{formatTanggalIndo(data.jadwal.tgl_berangkat)} •
								<strong>{data.jadwal.jam_berangkat} WIB</strong>
							</p>
						</div>
						<div class="text-right">
							<p class="text-[11px] text-slate-400 font-medium">Estimasi Tiba</p>
							<p class="font-semibold text-slate-800 mt-0.5">
								~{getEstimasiTiba(data.jadwal.jam_berangkat)} WIB
							</p>
						</div>
					</div>

					<div class="pt-1">
						<p class="text-[11px] text-slate-400 font-medium mb-1">Kendaraan & Nopol</p>
						<div class="flex items-center gap-2">
							<span class="font-semibold text-slate-800">{data.jadwal.jenis_mobil}</span>
							<span class="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-600">
								{data.jadwal.nomor_polisi}
							</span>
						</div>
					</div>

					<!-- Selected Seats Badges -->
					<div class="pt-2">
						<p class="text-[11px] text-slate-400 font-medium mb-1.5">Nomor Kursi Dipilih</p>
						{#if selectedSeats.length === 0}
							<p class="text-slate-400 italic">Belum ada kursi dipilih</p>
						{:else}
							<div class="flex flex-wrap gap-1.5">
								{#each selectedSeats as s}
									<span
										class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-2xs"
									>
										<svg
											class="w-3 h-3 text-purple-400"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M4 18v3M20 18v3M5 14h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2zM6 14v4M18 14v4"
											/>
										</svg>
										Kursi 0{s}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<!-- Pricing Line Breakdown -->
				<div class="pt-4 border-t border-dashed border-slate-200 space-y-2 text-xs">
					<div class="flex justify-between items-center text-slate-600">
						<span>Tarif Tiket ({selectedSeats.length}x {formatRupiah(data.jadwal.harga)})</span>
						<span class="font-semibold text-slate-900"
							>{formatRupiah(selectedSeats.length * data.jadwal.harga)}</span
						>
					</div>
					<div class="flex justify-between items-center text-slate-600">
						<span>Biaya Layanan & Asuransi</span>
						<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700"
							>Gratis</span
						>
					</div>
					<div class="flex justify-between items-center text-slate-600">
						<span>Diskon Member</span>
						<span class="text-slate-400">- Rp 0</span>
					</div>
				</div>

				<!-- Total Price Row -->
				<div class="pt-3 border-t border-slate-200 flex items-center justify-between">
					<div>
						<p class="text-[11px] text-slate-400 font-medium">Total Tarif</p>
						<p class="text-xs font-semibold text-slate-700">{selectedSeats.length} Kursi Dipilih</p>
					</div>
					<div class="text-right">
						<p class="text-2xl font-extrabold text-purple-700">
							{formatRupiah(Math.round($animatedPrice))}
						</p>
					</div>
				</div>

				<!-- Order Button -->
				<button
					type="button"
					disabled={selectedSeats.length === 0 || loading}
					onclick={handleBooking}
					class="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition hover:scale-[1.01] active:scale-[0.99]"
				>
					{#if loading}
						<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
							></path>
						</svg>
						<span>Memproses Pesanan...</span>
					{:else}
						<span>Pesan Sekarang</span>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							/>
						</svg>
					{/if}
				</button>

				<!-- Security Hint -->
				<div
					class="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<rect x="3" y="11" width="18" height="11" rx="2" stroke-width="2" />
						<path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2" />
					</svg>
					<span>Pembayaran dapat ditransfer setelah kursi terkonfirmasi.</span>
				</div>
			</div>
		</div>
	</div>

	{#if toastMsg}
		<Toast message={toastMsg} type={toastType} onclose={() => (toastMsg = '')} />
	{/if}
</div>
