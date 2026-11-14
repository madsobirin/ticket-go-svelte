<script>
	import { onMount } from 'svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { data } = $props();

	// Bank state
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
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(selectedBank.accountNumber);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
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
				window.location.href = `/member/pesanan/${data.order.id_pesan}`;
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
		}).format(num || 0);
	}

	function formatTanggalIndo(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}

	function handlePrint() {
		window.print();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Instruksi Pembayaran - #{data.order.resi_pesan || data.order.id_pesan} | PT Ticket Go</title>
</svelte:head>

<div class="p-3 sm:p-5 lg:p-6 max-w-6xl mx-auto space-y-4 text-slate-800">
	<!-- Top Bar: Company Branding & Breadcrumb -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
		<div class="flex items-center gap-2.5">
			<!-- Official Logo -->
			<img src="/logo.png" alt="Ticket Go Logo" class="h-8 w-auto object-contain shrink-0" />
			<div>
				<div class="flex items-center gap-1.5">
					<span class="font-black text-slate-900 text-xs sm:text-sm tracking-tight uppercase">PT Ticket Go</span>
					<span class="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"></span>
				</div>
				<p class="text-[10px] text-slate-400">Portal Resmi Tiket &amp; Verifikasi Pembayaran Loket</p>
			</div>
		</div>

		<div class="flex items-center gap-2 self-start sm:self-auto text-xs">
			<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
				<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
				<span>{data.order.status || 'Belum Bayar'}</span>
			</span>
			<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
				#{data.order.resi_pesan || `PSN-${String(data.order.id_pesan).padStart(4, '0')}`}
			</span>
		</div>
	</div>

	<!-- Main 2-Column Compact 1-Page Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
		<!-- Left: Bank Accounts & Transfer Destination -->
		<div class="lg:col-span-6 space-y-3">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3.5">
				<!-- Header -->
				<div class="flex items-center justify-between pb-2 border-b border-slate-100">
					<div>
						<h2 class="text-xs sm:text-sm font-bold text-slate-900">Rekening Resmi Loket Travel</h2>
						<p class="text-[11px] text-slate-500 mt-0.5">Pilih salah satu bank tujuan transfer di bawah:</p>
					</div>
					<span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
						Akun Terverifikasi
					</span>
				</div>

				<!-- Bank Selector Grid (Compact 4-column) -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{#each data.banks as bank}
						{@const isSelected = selectedBank.id === bank.id}
						<button
							type="button"
							onclick={() => selectBank(bank)}
							class={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
								isSelected
									? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-100 shadow-xs'
									: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
							}`}
						>
							<span class="font-mono font-black text-xs">{bank.code || bank.name}</span>
							<span class="text-[10px] text-slate-500 truncate max-w-full font-medium">{bank.name}</span>
						</button>
					{/each}
				</div>

				<!-- Active Selected Bank Card -->
				<div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							{selectedBank.fullName}
						</span>
						<span class="text-[10px] text-slate-400 font-medium">
							{selectedBank.branch || 'Cab. Raden Intan Lampung'}
						</span>
					</div>

					<div class="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
						<div>
							<p class="text-[10px] text-slate-400">Nomor Rekening Tujuan:</p>
							<p class="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
								{selectedBank.accountNumber}
							</p>
						</div>

						<button
							type="button"
							onclick={copyAccount}
							class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition active:scale-95"
						>
							{#if copied}
								<svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span>Tersalin!</span>
							{:else}
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2" />
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" />
								</svg>
								<span>Salin Rekening</span>
							{/if}
						</button>
					</div>

					<div class="flex items-center justify-between text-xs text-slate-600 pt-0.5">
						<span>Atas Nama Penerima:</span>
						<strong class="text-slate-900 font-bold">{selectedBank.accountHolder}</strong>
					</div>
				</div>

				<!-- Quick Notice -->
				<div class="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start gap-2.5 text-xs text-purple-950">
					<svg class="w-4 h-4 text-purple-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p class="text-[11px] leading-relaxed text-slate-700">
						Setelah mentransfer via ATM / M-Banking, klik tombol <strong>"Kirim Bukti ke Meja Loket"</strong> untuk input nomor rekening Anda agar diverifikasi kasir.
					</p>
				</div>
			</div>
		</div>

		<!-- Right: Official Company Billing & Summary Card -->
		<div class="lg:col-span-6 space-y-3">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3.5">
				<!-- Company Header on Bill Card -->
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<div class="flex items-center gap-2">
						<div class="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
							TG
						</div>
						<div>
							<h2 class="text-xs sm:text-sm font-black text-slate-900 tracking-tight">Ringkasan Tagihan Tiket</h2>
							<p class="text-[10px] text-slate-400">PT Ticket Go</p>
						</div>
					</div>

					<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
						1 PENUMPANG
					</span>
				</div>

				<!-- Compact Ticket Info Grid -->
				<div class="space-y-2 text-xs">
					<div class="flex justify-between items-center py-1 border-b border-slate-50">
						<span class="text-slate-400">Rute Perjalanan</span>
						<strong class="text-slate-900 font-bold">
							{data.order.nm_kota_asal} → {data.order.nm_kota_tujuan}
						</strong>
					</div>

					<div class="flex justify-between items-center py-1 border-b border-slate-50">
						<span class="text-slate-400">Jadwal Keberangkatan</span>
						<span class="text-slate-800 font-semibold">
							{formatTanggalIndo(data.order.tgl_berangkat)} • {data.order.jam_berangkat} WIB
						</span>
					</div>

					<div class="flex justify-between items-center py-1 border-b border-slate-50">
						<span class="text-slate-400">Nomor Kursi</span>
						<span class="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono font-bold text-xs">
							Kursi #{data.order.nomor_kursi}
						</span>
					</div>

					<div class="flex justify-between items-center py-1 border-b border-slate-50">
						<span class="text-slate-400">Nama Penumpang</span>
						<span class="text-slate-800 font-semibold">{data.order.nama_member}</span>
					</div>

					<div class="flex justify-between items-center py-1 border-b border-slate-50">
						<span class="text-slate-400">Armada Travel</span>
						<span class="text-slate-800 font-semibold">
							{data.order.jenis_mobil} ({data.order.nomor_polisi})
						</span>
					</div>

					<div class="flex justify-between items-center py-1">
						<span class="text-slate-400">Biaya Layanan &amp; Asuransi</span>
						<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
							Gratis (Termasuk Jasa Raharja)
						</span>
					</div>
				</div>

				<!-- Total Transfer Banner -->
				<div class="bg-purple-50/80 rounded-xl p-3 border border-purple-100 flex items-center justify-between">
					<div>
						<p class="text-[10px] font-bold uppercase tracking-wider text-purple-700">Total Transfer Resmi</p>
						<p class="text-xl sm:text-2xl font-black text-purple-700 mt-0.5">
							{formatRupiah(data.order.harga)}
						</p>
					</div>

					<span class="px-2.5 py-1 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold">
						Pas Tanpa Kode Unik
					</span>
				</div>

				<!-- Action Buttons (Immediately visible without scroll) -->
				<div class="space-y-2 pt-1">
					<button
						type="button"
						onclick={() => (showModal = true)}
						class="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition hover:scale-[1.01] active:scale-[0.99]"
					>
						<span>Kirim Bukti ke Meja Loket</span>
						<svg class="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					</button>

					<div class="flex items-center justify-between gap-2 pt-1">
						<button
							type="button"
							onclick={handlePrint}
							class="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-medium transition text-center"
						>
							Unduh Slip Tagihan
						</button>
						<a
							href={`/member/pesanan/${data.order.id_pesan}`}
							class="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-medium transition text-center"
						>
							Cek Status Loket
						</a>
					</div>
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

			<div class="relative bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-5 sm:p-6 space-y-4 z-10">
				<!-- Header with Company Logo -->
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<div class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0">
							<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M8 6v6" /><path d="M16 6v6" /><path d="M4 6h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
								<circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
							</svg>
						</div>
						<div>
							<h3 class="text-sm font-bold text-slate-900">Kirim Bukti ke Meja Loket</h3>
							<p class="text-[10px] text-slate-400">PT Ticket Go • #{data.order.resi_pesan}</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (showModal = false)}
						class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
						aria-label="Tutup"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Form -->
				<form onsubmit={handleSubmitProof} class="space-y-3.5 text-xs">
					<div>
						<label for="no_rek" class="block font-semibold text-slate-700 mb-1">
							Nomor Rekening Pengirim <span class="text-rose-500">*</span>
						</label>
						<input
							id="no_rek"
							type="text"
							bind:value={noRek}
							required
							placeholder="Contoh: 1140029381029"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
						/>
						<p class="text-[10px] text-slate-400 mt-1">Masukkan nomor rekening bank yang Anda gunakan saat transfer.</p>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="tgl_transfer" class="block font-semibold text-slate-700 mb-1">
								Tanggal Transfer <span class="text-rose-500">*</span>
							</label>
							<input
								id="tgl_transfer"
								type="date"
								bind:value={tglTransfer}
								required
								class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
							/>
						</div>
						<div>
							<label for="jam_transfer" class="block font-semibold text-slate-700 mb-1">
								Jam Transfer <span class="text-rose-500">*</span>
							</label>
							<input
								id="jam_transfer"
								type="time"
								bind:value={jamTransfer}
								required
								class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
							/>
						</div>
					</div>

					<div class="pt-2 flex items-center justify-end gap-2">
						<button
							type="button"
							onclick={() => (showModal = false)}
							class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={submitStatus === 'loading'}
							class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
						>
							{#if submitStatus === 'loading'}
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
