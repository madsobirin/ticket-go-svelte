<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let { data } = $props();

	const order = $derived(data.order);

	onMount(() => {
		if (typeof window !== 'undefined' && page.url.searchParams.get('print') === '1') {
			setTimeout(() => {
				window.print();
			}, 300);
		}
	});

	function handlePrint() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num || 0);
	}

	function formatTanggalLengkap(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date);
	}

	const printDate = new Date().toLocaleString('id-ID', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
</script>

<svelte:head>
	<title>E-Tiket Resmi #{order.no_resi || order.resi_pesan} | PT Ticket Go</title>
</svelte:head>

<div class="ticket-outer p-4 sm:p-6 lg:p-8 max-w-5xl xl:max-w-6xl mx-auto space-y-6 text-slate-800 antialiased">
	<!-- Top Action Navigation Bar (Hidden in Print / PDF Export) -->
	<div class="no-print space-y-3">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
			<div class="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap overflow-x-auto">
				<a href="/member/pesanan" class="hover:text-purple-600 font-medium transition flex items-center gap-1">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					<span>Daftar Pesanan</span>
				</a>
				<span class="text-slate-300">&gt;</span>
				<a href={`/member/pesanan/${order.id_pesan}`} class="hover:text-purple-600 transition">Detail #{order.id_pesan}</a>
				<span class="text-slate-300">&gt;</span>
				<span class="text-slate-900 font-semibold">E-Tiket Resmi (A5)</span>
			</div>

			<div class="flex items-center gap-2 flex-wrap">
				<a
					href={`/member/pesanan/${order.id_pesan}`}
					class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
				>
					<svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					<span>Kembali ke Detail</span>
				</a>

				<button
					type="button"
					onclick={handlePrint}
					class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition active:scale-95"
				>
					<svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
					</svg>
					<span>Cetak Tiket</span>
				</button>

				<button
					type="button"
					onclick={handlePrint}
					class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition active:scale-95"
				>
					<svg class="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
					</svg>
					<span>Simpan PDF (Ukuran A5)</span>
				</button>
			</div>
		</div>

		<!-- PDF Guidance Notice -->
		<div class="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-950 flex items-start gap-2.5">
			<svg class="w-4 h-4 text-purple-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<p class="leading-relaxed">
				<strong>Tips Simpan PDF:</strong> Pada dialog browser, pilih Tujuan <strong>Save as PDF</strong>, centang opsi <strong>Print backgrounds (Grafik latar belakang)</strong>, dan pilih ukuran kertas <strong>A5</strong> (atau A4) agar warna resmi tiket tampil utuh.
			</p>
		</div>
	</div>

	<!-- Printable Official A5 Ticket Slip Container -->
	<div class="ticket-a5-slip bg-white rounded-2xl border-2 border-slate-900 shadow-md p-5 sm:p-7 space-y-3.5 sm:space-y-4 relative overflow-hidden">
		<!-- Watermark Background Seal (Screen only, hidden in print) -->
		<div class="print:hidden absolute -right-8 -bottom-8 pointer-events-none opacity-[0.035] select-none font-black text-9xl text-slate-900 tracking-widest uppercase">
			LUNAS
		</div>

		<!-- 1. Corporate Header with Official Logo (DIV instead of HEADER to prevent print selector collisions) -->
		<div class="slip-header-official flex items-start justify-between gap-3 pb-3 border-b-2 border-slate-900">
			<div class="flex items-center gap-3">
				<!-- Official Brand Logo -->
				<img src="/logo.png" alt="Ticket Go Logo" class="h-10 sm:h-11 w-auto object-contain shrink-0" />
				<div>
					<div class="flex items-center gap-1.5">
						<h1 class="font-black text-sm sm:text-base text-slate-900 uppercase tracking-tight">PT TICKET GO</h1>
						<span class="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"></span>
					</div>
					<p class="text-[11px] text-slate-600 font-semibold leading-tight mt-0.5">
						Layanan Reservasi &amp; Angkutan Resmi Antarkota Antarprovinsi
					</p>
					<p class="text-[9px] text-slate-400 font-mono mt-0.5">
						SK Izin Operasional Dishub No. SK.551/TGO/2026 • Hotline: 0812-7890-1234
					</p>
				</div>
			</div>

			<div class="text-right shrink-0">
				<span class="inline-block px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-mono font-black uppercase tracking-wider border border-purple-200">
					BOARDING PASS
				</span>
				<p class="text-base sm:text-lg font-mono font-black text-slate-900 tracking-wider mt-0.5">
					{order.no_resi || order.resi_pesan}
				</p>
				<p class="text-[9px] text-slate-400 font-medium">Kode Tiket Resmi</p>
			</div>
		</div>

		<!-- 2. Status Banner & Official Seal -->
		<div class="status-banner-box flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
			<div class="flex items-center gap-2.5">
				<div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
					✓
				</div>
				<div>
					<div class="flex items-center gap-1.5">
						<span class="font-black text-xs sm:text-sm text-slate-900 uppercase">
							{order.status === 'Lunas' ? 'LUNAS — TERVERIFIKASI MEJA LOKET' : 'DALAM PROSES VERIFIKASI'}
						</span>
						{#if order.status === 'Lunas'}
							<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
								SAH &amp; VALID
							</span>
						{/if}
					</div>
					<p class="text-[10px] text-slate-600">
						Tiket elektronik resmi ini sah sebagai tanda masuk penumpang armada tanpa perlu ditukar tiket fisik.
					</p>
				</div>
			</div>

			<div class="text-right shrink-0 font-mono text-[9px] border-l sm:border-l-0 sm:border-slate-300 sm:pl-3">
				<span class="text-slate-400 block">Validasi Kasir Loket:</span>
				<strong class="text-emerald-700 font-bold">MUTASI BANK VALID</strong>
			</div>
		</div>

		<!-- Perforation Dashed Cut Line -->
		<div class="relative py-1 my-0.5">
			<div class="border-t-2 border-dashed border-slate-300"></div>
			<div class="absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-3 text-[9px] text-slate-400 font-mono select-none">
				✂ - - - - - - potong di sini jika diperlukan - - - - - - ✂
			</div>
		</div>

		<!-- 3. Main Manifest & Passenger Data Grid -->
		<div class="ticket-print-grid grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-start">
			<!-- Route & Journey Details (Left 7 Cols) -->
			<div class="md:col-span-7 space-y-2.5">
				<!-- Route Card -->
				<div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
					<div class="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
						<span>Rute Perjalanan Resmi</span>
						<span class="text-purple-700 font-semibold font-mono">Via Tol Trans-Sumatera</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<div>
							<p class="text-base sm:text-lg font-black text-slate-900 leading-tight">{order.nm_kota_asal}</p>
							<p class="text-[10px] text-slate-500 mt-0.5">Terminal / Pool Asal</p>
						</div>
						<div class="flex flex-col items-center px-3">
							<svg class="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
							</svg>
							<span class="text-[8px] font-mono text-slate-400">Langsung</span>
						</div>
						<div class="text-right">
							<p class="text-base sm:text-lg font-black text-slate-900 leading-tight">{order.nm_kota_tujuan}</p>
							<p class="text-[10px] text-slate-500 mt-0.5">Kota Tujuan Akhir</p>
						</div>
					</div>
				</div>

				<!-- Schedule & Fleet Subgrid -->
				<div class="ticket-subgrid grid grid-cols-2 gap-2.5 text-xs">
					<div class="p-2.5 rounded-xl border border-slate-200 bg-white">
						<span class="text-[9px] font-bold text-slate-400 uppercase block">Jadwal Keberangkatan</span>
						<strong class="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block">{order.jam_berangkat} WIB</strong>
						<span class="text-[10px] text-slate-600 block truncate mt-0.5">{formatTanggalLengkap(order.tgl_berangkat)}</span>
					</div>

					<div class="p-2.5 rounded-xl border border-slate-200 bg-white">
						<span class="text-[9px] font-bold text-slate-400 uppercase block">Armada Minibus</span>
						<strong class="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block truncate">{order.jenis_mobil}</strong>
						<span class="text-[10px] font-mono font-bold text-slate-700 block mt-0.5">{order.nomor_polisi}</span>
					</div>
				</div>

				<!-- Passenger Data -->
				<div class="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
					<div class="flex justify-between items-center">
						<span class="text-[10px] text-slate-400">Nama Penumpang:</span>
						<strong class="text-slate-900 font-bold">{order.nama_member}</strong>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-[10px] text-slate-400">Kontak WhatsApp:</span>
						<span class="font-mono text-slate-800 font-semibold">{order.telepon_member}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-[10px] text-slate-400">Rekening Pengirim:</span>
						<span class="font-mono text-slate-800">{order.no_rek || '-'}</span>
					</div>
				</div>
			</div>

			<!-- Seat & Barcode Box (Right 5 Cols) -->
			<div class="md:col-span-5 space-y-2.5">
				<!-- Big Seat Callout Box -->
				<div class="seat-callout p-3 rounded-xl bg-slate-900 text-white text-center space-y-0.5 border-2 border-slate-900 shadow-xs">
					<p class="text-[9px] uppercase font-bold tracking-widest text-purple-300">Nomor Kursi Armada</p>
					<p class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white leading-none py-1">
						KURSI {order.nomor_kursi}
					</p>
					<p class="text-[9px] text-slate-300 font-medium">Tempat duduk terdaftar resmi di manifest</p>
				</div>

				<!-- Total Price Callout -->
				<div class="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
					<div>
						<span class="text-[9px] font-bold text-slate-400 uppercase block">Tarif Tiket Resmi</span>
						<strong class="text-xs sm:text-sm font-black text-purple-700">{formatRupiah(order.harga)}</strong>
					</div>
					<span class="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
						Lunas + Asuransi
					</span>
				</div>

				<!-- Barcode & QR Code Section -->
				<div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2.5">
					<div class="space-y-0.5 flex-1 overflow-hidden">
						<!-- Scalable SVG Barcode -->
						<svg viewBox="0 0 140 28" class="w-full h-6 sm:h-7" preserveAspectRatio="none">
							<g fill="#0f172a">
								<rect x="0" y="0" width="3" height="28" />
								<rect x="5" y="0" width="1" height="28" />
								<rect x="8" y="0" width="2" height="28" />
								<rect x="12" y="0" width="1" height="28" />
								<rect x="15" y="0" width="3" height="28" />
								<rect x="20" y="0" width="2" height="28" />
								<rect x="24" y="0" width="1" height="28" />
								<rect x="27" y="0" width="4" height="28" />
								<rect x="33" y="0" width="1" height="28" />
								<rect x="36" y="0" width="2" height="28" />
								<rect x="40" y="0" width="3" height="28" />
								<rect x="45" y="0" width="1" height="28" />
								<rect x="48" y="0" width="2" height="28" />
								<rect x="52" y="0" width="4" height="28" />
								<rect x="58" y="0" width="1" height="28" />
								<rect x="61" y="0" width="3" height="28" />
								<rect x="66" y="0" width="1" height="28" />
								<rect x="69" y="0" width="2" height="28" />
								<rect x="73" y="0" width="3" height="28" />
								<rect x="78" y="0" width="1" height="28" />
								<rect x="81" y="0" width="4" height="28" />
								<rect x="87" y="0" width="2" height="28" />
								<rect x="91" y="0" width="1" height="28" />
								<rect x="94" y="0" width="3" height="28" />
								<rect x="99" y="0" width="2" height="28" />
								<rect x="103" y="0" width="1" height="28" />
								<rect x="106" y="0" width="4" height="28" />
								<rect x="112" y="0" width="2" height="28" />
								<rect x="116" y="0" width="1" height="28" />
								<rect x="119" y="0" width="3" height="28" />
								<rect x="124" y="0" width="1" height="28" />
								<rect x="127" y="0" width="2" height="28" />
								<rect x="131" y="0" width="3" height="28" />
								<rect x="136" y="0" width="2" height="28" />
							</g>
						</svg>
						<p class="font-mono text-[8px] sm:text-[9px] text-slate-600 tracking-wider text-center font-bold">
							*{order.no_resi || order.resi_pesan}*
						</p>
					</div>

					<!-- QR Code Scalable Vector -->
					<div class="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-slate-300 rounded p-1 flex items-center justify-center shrink-0 shadow-2xs">
						<svg class="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
							<path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 2h2v4h-2v-4zm2 2h2v2h-2v-2zm2 2h4v2h-4v-2zm-6 2h4v2h-4v-2zm6-6h2v2h-2v-2z" />
						</svg>
					</div>
				</div>
			</div>
		</div>

		<!-- 4. Footer Legal Notice & Security Rules (DIV instead of FOOTER) -->
		<div class="slip-footer-official pt-2.5 sm:pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-slate-500">
			<div class="space-y-0.5 max-w-lg">
				<p>• Harap tiba di titik penjemputan terminal/pool 15 menit sebelum jam keberangkatan ({order.jam_berangkat} WIB).</p>
				<p>• Tiket sah mencakup perlindungan asuransi kecelakaan Jasa Raharja dan bagasi maksimum 15 kg.</p>
			</div>

			<div class="text-right shrink-0 font-mono text-[8px] sm:text-[9px] text-slate-400">
				<p>Sistem Tiket Resmi • PT Ticket Go</p>
				<p>Cetak: {printDate} WIB</p>
			</div>
		</div>
	</div>
</div>

<style>
	/* Strict A5 Paper Configuration for Print & PDF Export */
	@page {
		size: A5 portrait;
		margin: 6mm;
	}

	@media print {
		/* Enforce color printing & background graphics */
		:global(html),
		:global(body) {
			background: #ffffff !important;
			color: #0f172a !important;
			margin: 0 !important;
			padding: 0 !important;
			width: 100% !important;
			height: auto !important;
			min-height: 0 !important;
			overflow: visible !important;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		/* Hide chrome navigation and non-printable elements ONLY */
		.no-print,
		:global(.no-print) {
			display: none !important;
		}

		:global(main) {
			display: block !important;
			padding: 0 !important;
			margin: 0 !important;
			min-height: 0 !important;
			height: auto !important;
		}

		.ticket-outer {
			display: block !important;
			padding: 0 !important;
			margin: 0 !important;
			max-width: 100% !important;
			width: 100% !important;
		}

		.ticket-a5-slip {
			display: block !important;
			border: 1.5px solid #0f172a !important;
			box-shadow: none !important;
			border-radius: 6px !important;
			padding: 4mm 5mm !important;
			margin: 0 auto !important;
			width: 100% !important;
			max-width: 100% !important;
			page-break-inside: avoid !important;
			break-inside: avoid !important;
			page-break-after: avoid !important;
		}

		/* Force 2-column layout in print despite narrow A5 paper width */
		.ticket-print-grid {
			display: grid !important;
			grid-template-columns: 7fr 5fr !important;
			gap: 3mm !important;
		}

		.ticket-subgrid {
			display: grid !important;
			grid-template-columns: 1fr 1fr !important;
			gap: 2mm !important;
		}

		.seat-callout {
			background: #0f172a !important;
			color: #ffffff !important;
			border: 2px solid #0f172a !important;
		}

		.seat-callout p {
			color: #ffffff !important;
		}

		.status-banner-box {
			border: 1.5px solid #059669 !important;
			background: #ecfdf5 !important;
		}
	}
</style>
