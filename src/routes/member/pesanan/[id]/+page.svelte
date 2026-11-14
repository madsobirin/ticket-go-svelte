<script>
	let { data } = $props();

	const order = $derived(data.order);

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num || 0);
	}

	function formatHariTanggal(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date);
	}
</script>

<svelte:head>
	<title>Detail &amp; Verifikasi Pesanan #{order.resi_pesan || order.id_pesan} | Ticket Go</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Breadcrumb Navigation -->
	<div
		class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100"
	>
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<a href="/" class="hover:text-purple-600 transition">Portal Member</a>
			<span class="text-slate-300">&gt;</span>
			<a href="/member/pesanan" class="hover:text-purple-600 transition">Pesanan Saya</a>
			<span class="text-slate-300">&gt;</span>
			<span class="text-slate-900 font-semibold">Detail &amp; Status Verifikasi</span>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="/member/pesanan"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				<span>Daftar Pesanan</span>
			</a>
		</div>
	</div>

	<!-- Page Header -->
	<div
		class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs"
	>
		<div class="space-y-1">
			<div class="flex items-center gap-2.5 flex-wrap">
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
					Verifikasi &amp; Detail Tiket
				</h1>
				<span
					class="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-mono font-bold border border-purple-100"
				>
					#{order.resi_pesan || `PSN-${String(order.id_pesan).padStart(4, '0')}`}
				</span>
			</div>
			<p class="text-xs sm:text-sm text-slate-500">
				Pantau proses pengecekan bukti pembayaran oleh petugas kasir loket dan detail manifest
				keberangkatan armada.
			</p>
		</div>

		<div>
			{#if order.status === 'Lunas'}
				<span
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
				>
					<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
					<span>Terkonfirmasi Meja Loket (Lunas)</span>
				</span>
			{:else if order.status === 'Dalam Proses'}
				<span
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 animate-pulse"
				>
					<span class="w-2 h-2 rounded-full bg-amber-500"></span>
					<span>Menunggu Verifikasi Loket</span>
				</span>
			{:else}
				<span
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
				>
					<span class="w-2 h-2 rounded-full bg-slate-400"></span>
					<span>Menunggu Pembayaran</span>
				</span>
			{/if}
		</div>
	</div>

	<!-- Status Stepper Timeline Tracker -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
		<div class="flex items-center justify-between border-b border-slate-100 pb-3">
			<h2 class="text-xs font-bold uppercase tracking-wider text-slate-500">Status Alur Tiket</h2>
			<span class="text-xs text-slate-400">Sistem Tiket Terintegrasi</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<!-- Step 1 -->
			<div
				class="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-3"
			>
				<div
					class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
				>
					✓
				</div>
				<div>
					<p class="text-xs font-bold text-slate-900">Reservasi Kursi</p>
					<p class="text-[11px] text-slate-500 mt-0.5">Kursi #{order.nomor_kursi} terkunci</p>
					<span class="text-[10px] font-semibold text-emerald-700 mt-1 inline-block">Selesai</span>
				</div>
			</div>

			<!-- Step 2 -->
			<div
				class={`p-3.5 rounded-xl border flex items-start gap-3 ${
					order.status === 'Dalam Proses' || order.status === 'Lunas'
						? 'border-emerald-100 bg-emerald-50/50'
						: 'border-slate-200 bg-slate-50/50'
				}`}
			>
				<div
					class={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
						order.status === 'Dalam Proses' || order.status === 'Lunas'
							? 'bg-emerald-600 text-white'
							: 'bg-slate-300 text-slate-600'
					}`}
				>
					{order.status === 'Dalam Proses' || order.status === 'Lunas' ? '✓' : '2'}
				</div>
				<div>
					<p class="text-xs font-bold text-slate-900">Kirim Bukti Transfer</p>
					<p class="text-[11px] text-slate-500 mt-0.5">
						{order.no_rek ? `Rek: ${order.no_rek}` : 'Belum diunggah'}
					</p>
					<span
						class={`text-[10px] font-semibold mt-1 inline-block ${
							order.status === 'Dalam Proses' || order.status === 'Lunas'
								? 'text-emerald-700'
								: 'text-slate-400'
						}`}
					>
						{order.status === 'Dalam Proses' || order.status === 'Lunas' ? 'Terkirim' : 'Menunggu'}
					</span>
				</div>
			</div>

			<!-- Step 3 -->
			<div
				class={`p-3.5 rounded-xl border flex items-start gap-3 ${
					order.status === 'Lunas'
						? 'border-emerald-100 bg-emerald-50/50'
						: order.status === 'Dalam Proses'
							? 'border-amber-200 bg-amber-50/60 ring-2 ring-amber-100'
							: 'border-slate-200 bg-slate-50/50'
				}`}
			>
				<div
					class={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
						order.status === 'Lunas'
							? 'bg-emerald-600 text-white'
							: order.status === 'Dalam Proses'
								? 'bg-amber-500 text-white animate-pulse'
								: 'bg-slate-300 text-slate-600'
					}`}
				>
					{order.status === 'Lunas' ? '✓' : '3'}
				</div>
				<div>
					<p class="text-xs font-bold text-slate-900">Verifikasi Kasir Loket</p>
					<p class="text-[11px] text-slate-500 mt-0.5">
						{order.status === 'Lunas'
							? 'Validasi mutasi sukses'
							: order.status === 'Dalam Proses'
								? 'Petugas sedang mencocokkan'
								: 'Menunggu transfer'}
					</p>
					<span
						class={`text-[10px] font-semibold mt-1 inline-block ${
							order.status === 'Lunas'
								? 'text-emerald-700'
								: order.status === 'Dalam Proses'
									? 'text-amber-700 font-bold'
									: 'text-slate-400'
						}`}
					>
						{order.status === 'Lunas'
							? 'Selesai'
							: order.status === 'Dalam Proses'
								? 'Sedang Diverifikasi'
								: 'Antre'}
					</span>
				</div>
			</div>

			<!-- Step 4 -->
			<div
				class={`p-3.5 rounded-xl border flex items-start gap-3 ${
					order.status === 'Lunas'
						? 'border-emerald-100 bg-emerald-50/50'
						: 'border-slate-200 bg-slate-50/50'
				}`}
			>
				<div
					class={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
						order.status === 'Lunas' ? 'bg-purple-600 text-white' : 'bg-slate-300 text-slate-600'
					}`}
				>
					{order.status === 'Lunas' ? '✓' : '4'}
				</div>
				<div>
					<p class="text-xs font-bold text-slate-900">E-Tiket Terbit</p>
					<p class="text-[11px] text-slate-500 mt-0.5">Siap cetak &amp; naik travel</p>
					<span
						class={`text-[10px] font-semibold mt-1 inline-block ${
							order.status === 'Lunas' ? 'text-purple-700 font-bold' : 'text-slate-400'
						}`}
					>
						{order.status === 'Lunas' ? 'Siap Digunakan' : 'Menunggu Verifikasi'}
					</span>
				</div>
			</div>
		</div>

		<!-- Status Description Alert Banner -->
		{#if order.status === 'Dalam Proses'}
			<div
				class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3"
			>
				<div
					class="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5"
				>
					⏳
				</div>
				<div class="space-y-1">
					<p class="font-bold text-slate-900">Bukti Pembayaran Sedang Diverifikasi Meja Loket</p>
					<p class="text-slate-600 leading-relaxed">
						Bukti transfer dari rekening <strong>{order.no_rek || 'Pengirim'}</strong> telah berhasil
						diterima sistem. Petugas kasir loket sedang mencocokkan nominal transfer dengan mutasi bank
						resmi. Estimasi pengecekan 5–15 menit.
					</p>
				</div>
			</div>
		{:else if order.status === 'Lunas'}
			<div
				class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3"
			>
				<div
					class="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5"
				>
					✓
				</div>
				<div class="space-y-1">
					<p class="font-bold text-slate-900">Pembayaran Resmi Telah Diverifikasi</p>
					<p class="text-slate-600 leading-relaxed">
						Kursi perjalanan Anda telah sah terdaftar. Anda dapat langsung mengunduh tiket
						elektronik resmi atau mencetak slip keberangkatan.
					</p>
				</div>
			</div>
		{:else}
			<div
				class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs flex items-start gap-3"
			>
				<div
					class="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5"
				>
					!
				</div>
				<div class="space-y-1">
					<p class="font-bold text-slate-900">Menunggu Pembayaran</p>
					<p class="text-slate-600 leading-relaxed">
						Silakan lakukan transfer ke salah satu rekening resmi travel dan kirimkan konfirmasi
						bukti transfer sebelum jadwal keberangkatan.
					</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- 2-Column Main Info Section -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left: Travel & Journey Details -->
		<div class="lg:col-span-7 space-y-6">
			<!-- Journey Card -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
				<div class="flex items-center justify-between border-b border-slate-100 pb-3">
					<div class="flex items-center gap-2">
						<svg
							class="w-4 h-4 text-purple-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<h2 class="text-sm font-bold text-slate-900">Informasi Rute &amp; Jadwal</h2>
					</div>
					<span
						class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-100"
					>
						Via Jalan Tol Trans-Sumatera
					</span>
				</div>

				<div
					class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
				>
					<div>
						<p class="text-[11px] font-semibold text-slate-400 uppercase">
							Kota Asal (Titik Jemput)
						</p>
						<p class="text-base sm:text-lg font-black text-slate-900 mt-0.5">
							{order.nm_kota_asal}
						</p>
						<p class="text-[11px] text-slate-500">Terminal / Pool Keberangkatan</p>
					</div>

					<div class="flex flex-col items-center px-4">
						<svg
							class="w-5 h-5 text-purple-600"
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
						<span class="text-[10px] text-slate-400 mt-1 font-mono">Reguler</span>
					</div>

					<div class="text-right">
						<p class="text-[11px] font-semibold text-slate-400 uppercase">Kota Tujuan</p>
						<p class="text-base sm:text-lg font-black text-slate-900 mt-0.5">
							{order.nm_kota_tujuan}
						</p>
						<p class="text-[11px] text-slate-500">Titik Pengantaran</p>
					</div>
				</div>

				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
					<div class="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
						<p class="text-[10px] font-semibold text-slate-400 uppercase">Jadwal Keberangkatan</p>
						<p class="text-xs font-bold text-slate-900 mt-1">{order.jam_berangkat} WIB</p>
						<p class="text-[11px] text-slate-500 mt-0.5">
							{formatHariTanggal(order.tgl_berangkat)}
						</p>
					</div>

					<div class="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
						<p class="text-[10px] font-semibold text-slate-400 uppercase">Armada Minibus</p>
						<p class="text-xs font-bold text-slate-900 mt-1">{order.jenis_mobil}</p>
						<p class="text-[11px] text-slate-500 font-mono mt-0.5">{order.nomor_polisi}</p>
					</div>

					<div
						class="p-3 rounded-xl border border-purple-100 bg-purple-50/40 col-span-2 sm:col-span-1"
					>
						<p class="text-[10px] font-semibold text-purple-600 uppercase">Nomor Kursi</p>
						<p class="text-xs font-black text-purple-900 mt-1">Kursi #{order.nomor_kursi}</p>
						<p class="text-[11px] text-purple-600 mt-0.5">Dekat Jendela</p>
					</div>
				</div>
			</div>

			<!-- Passenger & Payment Proof Data -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
				<div class="flex items-center justify-between border-b border-slate-100 pb-3">
					<div class="flex items-center gap-2">
						<svg
							class="w-4 h-4 text-purple-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<h2 class="text-sm font-bold text-slate-900">Data Penumpang &amp; Konfirmasi</h2>
					</div>
					<span class="text-xs text-slate-400">Data Resmi</span>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
					<div>
						<p class="text-[11px] text-slate-400">Nama Lengkap Penumpang</p>
						<p class="text-xs font-bold text-slate-900 mt-0.5">{order.nama_member}</p>
					</div>

					<div>
						<p class="text-[11px] text-slate-400">Nomor Kontak WhatsApp</p>
						<p class="text-xs font-bold text-slate-900 font-mono mt-0.5">{order.telepon_member}</p>
					</div>

					<div>
						<p class="text-[11px] text-slate-400">Nomor Rekening Pengirim</p>
						<p class="text-xs font-bold text-slate-900 font-mono mt-0.5">
							{order.no_rek ? order.no_rek : '- Belum diisi -'}
						</p>
					</div>

					<div>
						<p class="text-[11px] text-slate-400">Waktu Pengiriman Bukti</p>
						<p class="text-xs font-bold text-slate-900 mt-0.5">
							{order.tgl_transfer ? `${order.tgl_transfer} • ${order.jam_transfer || ''} WIB` : '-'}
						</p>
					</div>

					<div
						class="sm:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs"
					>
						<span class="text-slate-500">Nomor Resi / Referensi Tiket</span>
						<span class="font-mono font-bold text-slate-900">
							{order.no_resi || order.resi_pesan}
						</span>
					</div>
				</div>
			</div>

			{#if order.status === 'Lunas'}
				<!-- Official Boarding Pass Ready Callout -->
				<div class="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div class="space-y-1">
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold tracking-wider uppercase border border-purple-400/30">
								E-Tiket Diterbitkan
							</span>
							<span class="text-xs text-slate-400 font-mono">#{order.no_resi || order.resi_pesan}</span>
						</div>
						<p class="text-sm font-bold text-white">Tiket Siap Digunakan untuk Naik Armada</p>
						<p class="text-xs text-slate-400">
							Kursi #{order.nomor_kursi} • {order.nm_kota_asal} → {order.nm_kota_tujuan} ({order.jam_berangkat} WIB)
						</p>
					</div>

					<a
						href={`/member/pesanan/${order.id_pesan}/tiket`}
						class="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs shrink-0"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
						<span>Buka Slip A5</span>
					</a>
				</div>
			{/if}
		</div>

		<!-- Right: Billing Summary & Action Box -->
		<div class="lg:col-span-5 space-y-4">
			<!-- Billing Card -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
				<h2 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
					Rincian Tarif &amp; Tagihan
				</h2>

				<div class="space-y-2.5 text-xs">
					<div class="flex items-center justify-between text-slate-600">
						<span>Tarif Tiket Resmi</span>
						<span class="font-semibold text-slate-900">{formatRupiah(order.harga)}</span>
					</div>
					<div class="flex items-center justify-between text-slate-600">
						<span>Biaya Penanganan Loket</span>
						<span class="text-emerald-700 font-semibold">Gratis (Rp 0)</span>
					</div>
					<div class="flex items-center justify-between text-slate-600">
						<span>Asuransi Jasa Raharja</span>
						<span class="text-emerald-700 font-semibold">Termasuk Resmi</span>
					</div>

					<div
						class="pt-3 border-t border-dashed border-slate-200 flex items-baseline justify-between"
					>
						<div>
							<p class="text-xs font-bold text-slate-900">Total Pembayaran</p>
							<p class="text-[10px] text-slate-400">1 Kursi Penumpang</p>
						</div>
						<p class="text-xl font-black text-purple-700">{formatRupiah(order.harga)}</p>
					</div>
				</div>

				<!-- Action Buttons based on Status -->
				<div class="pt-2 space-y-2.5">
					{#if order.status === 'Lunas'}
						<a
							href={`/member/pesanan/${order.id_pesan}/tiket`}
							class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
							<span>Buka &amp; Cetak E-Tiket Resmi (A5)</span>
						</a>

						<a
							href={`/member/pesanan/${order.id_pesan}/tiket?print=1`}
							class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition"
						>
							<svg class="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
							</svg>
							<span>Cetak Slip / Simpan PDF (A5)</span>
						</a>
					{:else if order.status === 'Dalam Proses'}
						<a
							href={`/member/pesanan/${order.id_pesan}/bayar`}
							class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition"
						>
							<svg
								class="w-4 h-4 text-slate-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
								/>
							</svg>
							<span>Unggah Ulang Bukti Transfer</span>
						</a>
					{:else}
						<a
							href={`/member/pesanan/${order.id_pesan}/bayar`}
							class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
							<span>Kirim Bukti Pembayaran</span>
						</a>
					{/if}

					<a
						href="https://wa.me/"
						target="_blank"
						rel="noreferrer"
						class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
					>
						<svg
							class="w-4 h-4 text-emerald-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
						<span>Bantuan Loket Kasir (WhatsApp)</span>
					</a>
				</div>
			</div>

			<!-- Customer Guarantee Notice -->
			<div
				class="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 space-y-1.5"
			>
				<div class="flex items-center gap-2 font-bold text-purple-950">
					<svg
						class="w-4 h-4 text-purple-600 shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
					<span>Jaminan Keberangkatan &amp; Kursi</span>
				</div>
				<p class="text-[11px] text-purple-800 leading-relaxed">
					Setelah verifikasi selesai, kursi tidak akan dialihkan ke penumpang lain. Harap tiba di
					titik penjemputan 15 menit sebelum armada berangkat.
				</p>
			</div>
		</div>
	</div>
</div>
