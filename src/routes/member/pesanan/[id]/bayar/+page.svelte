<script>
	import { onMount } from 'svelte';
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

	function selectBank(bank) {
		selectedBank = bank;
	}

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
		if (!noRek.trim()) {
			toastMsg = 'Nomor rekening pengirim wajib diisi';
			toastType = 'error';
			return;
		}

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

	function handlePrint() {
		window.print();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Pembayaran Tiket - #{data.order.resi_pesan || data.order.id_pesan}</title>
</svelte:head>

<div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Breadcrumbs & Status Badges -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<div class="flex items-center gap-2 text-xs font-medium text-slate-500">
			<a href="/member" class="hover:text-purple-600 transition">Cari Perjalanan</a>
			<span class="text-slate-300">&gt;</span>
			<a href={`/member/jadwal/${data.order.id_jadwal}`} class="hover:text-purple-600 transition">Pilih Kursi</a>
			<span class="text-slate-300">&gt;</span>
			<span class="text-slate-900 font-semibold">Pembayaran</span>
		</div>

		<div class="flex items-center gap-2 self-start sm:self-auto">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
				<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
				{data.order.status || 'Belum Bayar'}
			</span>
			<span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-bold">
				#{data.order.resi_pesan || `PSN-${String(data.order.id_pesan).padStart(4, '0')}`}
			</span>
		</div>
	</div>

	<!-- Title Section -->
	<div>
		<h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
			Instruksi &amp; Rekening Pembayaran
		</h1>
		<p class="text-xs md:text-sm text-slate-500 mt-1">
			Pilih bank tujuan untuk mentransfer biaya tiket perjalanan Anda.
		</p>
	</div>

	<!-- 2-Column Grid Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left Column: Bank Selection & Instructions -->
		<div class="lg:col-span-7 space-y-4">
			<!-- Section Title -->
			<div class="flex items-center justify-between pb-1">
				<div>
					<h2 class="text-sm font-bold text-slate-900">Pilihan Rekening Bank Tujuan</h2>
					<p class="text-[11px] text-slate-500 mt-0.5">Transfer manual melalui ATM, Mobile Banking, atau Internet Banking.</p>
				</div>
				<div class="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
					<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
					<span>Loket Resmi</span>
				</div>
			</div>

			<!-- Bank Cards List -->
			<div class="space-y-3">
				{#each data.banks as bank}
					{@const isSelected = selectedBank.id === bank.id}
					{#if isSelected}
						<!-- Active Bank Card -->
						<div class="bg-white rounded-2xl border-2 border-purple-500 p-5 shadow-xs transition-all">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3.5">
									<div class="w-14 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-mono font-black text-xs text-slate-800 uppercase tracking-wider">
										{bank.code || bank.name}
									</div>
									<div>
										<h3 class="text-sm font-bold text-slate-900">{bank.fullName}</h3>
										<p class="text-xs text-slate-500 mt-0.5">{bank.subtext || 'Transfer Antar-Bank / Virtual Account Loket'}</p>
									</div>
								</div>

								<span class="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-2xs">
									Dipilih
								</span>
							</div>

							<!-- Account Details Inside Card -->
							<div class="bg-slate-50/90 rounded-xl p-4 mt-4 border border-slate-100 space-y-3">
								<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
									<div>
										<p class="text-[11px] text-slate-400 font-medium">Nomor Rekening Tujuan:</p>
										<p class="text-2xl font-mono font-black text-slate-900 tracking-wider mt-0.5">
											{bank.accountNumber}
										</p>
									</div>

									<button
										type="button"
										onclick={copyAccount}
										class="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95"
									>
										{#if copied}
											<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
											<span class="text-emerald-700">Tersalin!</span>
										{:else}
											<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2" />
												<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" />
											</svg>
											<span>Salin No. Rekening</span>
										{/if}
									</button>
								</div>

								<div class="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
									<div class="flex items-center gap-1.5">
										<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
										</svg>
										<span>a.n. <strong>{bank.accountHolder}</strong></span>
									</div>
									<span class="text-[11px] text-slate-400 font-medium">{bank.branch || 'Cab. Raden Intan, B. Lampung'}</span>
								</div>

								<p class="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
									<span class="text-purple-600 font-bold">ℹ</span>
									<span>Pastikan nama penerima sesuai sebelum konfirmasi transfer.</span>
								</p>
							</div>
						</div>
					{:else}
						<!-- Inactive Bank Card -->
						<button
							type="button"
							onclick={() => selectBank(bank)}
							class="w-full bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-4 transition-all text-left flex items-center justify-between group shadow-2xs"
						>
							<div class="flex items-center gap-3.5">
								<div class="w-14 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-600 uppercase tracking-wider group-hover:bg-slate-100 transition">
									{bank.code || bank.name}
								</div>
								<div>
									<h3 class="text-sm font-bold text-slate-800 group-hover:text-slate-900">{bank.fullName}</h3>
									<p class="text-xs text-slate-400 mt-0.5">{bank.subtext || 'Transfer Antar-Bank'}</p>
								</div>
							</div>

							<div class="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-slate-300 bg-slate-50"></div>
						</button>
					{/if}
				{/each}
			</div>

			<!-- Notice Box below Banks -->
			<div class="bg-white rounded-2xl border border-slate-200 p-4.5 flex items-start gap-3.5 shadow-2xs">
				<div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
					<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
				</div>
				<div>
					<h3 class="text-xs font-bold text-slate-900">Instruksi Pembayaran Manual Loket</h3>
					<p class="text-[11px] text-slate-500 mt-1 leading-relaxed">
						Pembayaran dilakukan manual melalui transfer rekening ke kasir operasional resmi. Tidak ada integrasi gateway pihak ketiga. Setelah transfer, simpan struk fisik atau tangkapan layar bukti bayar untuk dikirimkan ke loket.
					</p>
				</div>
			</div>
		</div>

		<!-- Right Column: Ringkasan Tagihan & Support -->
		<div class="lg:col-span-5 space-y-4">
			<!-- Ringkasan Tagihan Card -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 sticky top-6">
				<!-- Header -->
				<div class="flex items-center justify-between pb-4 border-b border-slate-100">
					<div class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
							<svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="6" width="20" height="12" rx="2" />
								<circle cx="12" cy="12" r="2" />
								<path d="M6 12h.01M18 12h.01" />
							</svg>
						</div>
						<h2 class="text-base font-bold text-slate-900">Ringkasan Tagihan</h2>
					</div>

					<span class="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
						TIKET-1X
					</span>
				</div>

				<!-- Detail Rows -->
				<div class="space-y-3.5 text-xs">
					<div class="flex justify-between items-baseline gap-2">
						<span class="text-slate-400 font-medium">Rute Perjalanan</span>
						<span class="font-bold text-slate-800 text-right">
							{data.order.nm_kota_asal} → {data.order.nm_kota_tujuan}
						</span>
					</div>

					<div class="flex justify-between items-baseline gap-2">
						<span class="text-slate-400 font-medium">Jadwal</span>
						<span class="font-semibold text-slate-800 text-right">
							{formatTanggalIndo(data.order.tgl_berangkat)} • {data.order.jam_berangkat} WIB
						</span>
					</div>

					<div class="flex justify-between items-center gap-2">
						<span class="text-slate-400 font-medium">Nomor Kursi</span>
						<span class="px-3 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-xs shadow-2xs">
							Kursi {data.order.nomor_kursi}
						</span>
					</div>

					<div class="flex justify-between items-baseline gap-2">
						<span class="text-slate-400 font-medium">Nama Penumpang</span>
						<span class="font-semibold text-slate-800 text-right">{data.order.nama_member}</span>
					</div>

					<div class="flex justify-between items-baseline gap-2">
						<span class="text-slate-400 font-medium">Kendaraan</span>
						<span class="font-semibold text-slate-800 text-right">
							{data.order.jenis_mobil} ({data.order.nomor_polisi})
						</span>
					</div>

					<div class="flex justify-between items-baseline gap-2 pt-1 border-t border-slate-100">
						<span class="text-slate-500 font-medium">Tarif Tiket (1x)</span>
						<span class="font-semibold text-slate-900">{formatRupiah(data.order.harga)}</span>
					</div>

					<div class="flex justify-between items-center gap-2">
						<span class="text-slate-500 font-medium">Biaya Layanan Loket</span>
						<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Gratis</span>
					</div>
				</div>

				<!-- Total Transfer Box -->
				<div class="bg-purple-50/60 rounded-xl p-4 border border-purple-100 space-y-1">
					<p class="text-[11px] font-bold uppercase tracking-wider text-purple-700">Total Transfer</p>
					<p class="text-3xl font-extrabold text-purple-700">
						{formatRupiah(data.order.harga)}
					</p>
					<p class="text-[11px] text-slate-500 pt-1">
						Transfer tepat hingga rupiah terakhir untuk mempermudah verifikasi loket.
					</p>
				</div>

				<!-- Actions -->
				<div class="space-y-2.5 pt-1">
					<button
						type="button"
						onclick={() => (showModal = true)}
						class="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition hover:scale-[1.01] active:scale-[0.99]"
					>
						<span>Kirim Bukti ke Meja Loket</span>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					</button>

					<button
						type="button"
						onclick={handlePrint}
						class="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs shadow-2xs transition"
					>
						<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span>Unduh Bukti Tagihan / Booking Slip</span>
					</button>

					<div class="text-center pt-1">
						<a
							href={`/member/pesanan/${data.order.id_pesan}`}
							class="text-xs text-slate-400 hover:text-slate-700 transition"
						>
							&larr; Kembali ke Detail Pesanan
						</a>
					</div>
				</div>
			</div>

			<!-- Support Box -->
			<div class="bg-white rounded-2xl border border-slate-200 p-4.5 flex items-center gap-3.5 shadow-2xs">
				<div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
					<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
					</svg>
				</div>
				<div>
					<h3 class="text-xs font-bold text-slate-900">Kendala saat transfer?</h3>
					<p class="text-[11px] text-slate-500 mt-0.5">
						Hubungi loket di <strong>0812-7890-1234</strong> (WhatsApp / Telepon).
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Modal: Kirim Bukti Transfer -->
	{#if showModal}
		<div
			class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
		>
			<button
				type="button"
				tabindex="0"
				class="absolute inset-0 w-full h-full cursor-default bg-transparent border-none"
				onclick={() => (showModal = false)}
				aria-label="Tutup modal"
			></button>

			<div class="relative bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-6 space-y-5 z-10">
				<!-- Header -->
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<div>
						<h3 class="text-base font-bold text-slate-900">Kirim Bukti ke Meja Loket</h3>
						<p class="text-xs text-slate-500 mt-0.5">Lengkapi data verifikasi transfer untuk pesanan #{data.order.resi_pesan}</p>
					</div>
					<button
						type="button"
						onclick={() => (showModal = false)}
						class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
						aria-label="Tutup"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Form -->
				<form onsubmit={handleSubmitProof} class="space-y-4">
					<div>
						<label for="no_rek" class="block text-xs font-semibold text-slate-700 mb-1.5">
							Nomor Rekening Pengirim
						</label>
						<input
							id="no_rek"
							type="text"
							bind:value={noRek}
							required
							placeholder="Contoh: 1234567890"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
						/>
						<p class="text-[11px] text-slate-400 mt-1">Nomor rekening yang Anda gunakan saat mentransfer.</p>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="tgl_transfer" class="block text-xs font-semibold text-slate-700 mb-1.5">
								Tanggal Transfer
							</label>
							<input
								id="tgl_transfer"
								type="date"
								bind:value={tglTransfer}
								required
								class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
							/>
						</div>
						<div>
							<label for="jam_transfer" class="block text-xs font-semibold text-slate-700 mb-1.5">
								Jam Transfer
							</label>
							<input
								id="jam_transfer"
								type="time"
								bind:value={jamTransfer}
								required
								class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
							/>
						</div>
					</div>

					<div class="pt-3 flex items-center justify-end gap-2.5">
						<button
							type="button"
							onclick={() => (showModal = false)}
							class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={submitStatus === 'loading'}
							class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition hover:scale-102 active:scale-98 flex items-center gap-2"
						>
							{#if submitStatus === 'loading'}
								<svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
								</svg>
								<span>Mengirim...</span>
							{:else}
								<span>Kirim Bukti Sekarang</span>
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
								</svg>
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
