<script>
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();
	let order = $state(data.order);

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

	function detectBankName(no_rek) {
		if (!no_rek) return { code: 'BRI', label: 'Bank Rakyat Indonesia (BRI)' };
		const str = String(no_rek).toLowerCase();
		if (str.includes('bca')) return { code: 'BCA', label: 'Bank Central Asia (BCA)' };
		if (str.includes('bri')) return { code: 'BRI', label: 'Bank Rakyat Indonesia (BRI)' };
		if (str.includes('bni')) return { code: 'BNI', label: 'Bank Negara Indonesia (BNI)' };
		if (str.includes('mandiri')) return { code: 'MDR', label: 'Bank Mandiri' };
		return { code: 'TF', label: 'Transfer Antar Bank' };
	}

	async function ubahStatus(targetStatus) {
		if (submitting) return;

		const confirmMsg = targetStatus === 'Lunas'
			? 'Verifikasi pembayaran dan tandai pesanan ini sebagai LUNAS? Tiket akan otomatis terbit ke manifes sopir.'
			: 'Tolak bukti transfer dan kembalikan pesanan ke status BELUM BAYAR? Bukti transfer saat ini akan dihapus agar penumpang dapat mengirim ulang bukti.';

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
				? 'Pembayaran berhasil diverifikasi. Pesanan ditandai Lunas!'
				: 'Bukti transfer ditolak. Pesanan dikembalikan ke status Belum Bayar.';

			await invalidateAll();
		} catch {
			toastType = 'error';
			toastMsg = 'Terjadi kesalahan jaringan saat menghubungi server';
		} finally {
			submitting = false;
			actionType = '';
		}
	}
</script>

<svelte:head>
	<title>Inspeksi Bukti #{order.resi_pesan} | Meja Loket Ticket Go</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Breadcrumb & Status Bar -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<span>Portal Operasional</span>
			<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" stroke-width="2" />
			</svg>
			<a href="/operator" class="hover:text-slate-900 transition">Meja Loket</a>
			<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" stroke-width="2" />
			</svg>
			<span class="text-slate-900 font-semibold">Validasi #{order.resi_pesan}</span>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="/operator"
				class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<polyline points="15 18 9 12 15 6" stroke-width="2" />
				</svg>
				<span>Kembali ke Antrean</span>
			</a>
		</div>
	</div>

	<!-- Toast Message -->
	{#if toastMsg}
		<div class={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
			toastType === 'success' 
				? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
				: 'bg-rose-50 border-rose-200 text-rose-800'
		}`}>
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={toastType === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
				</svg>
				<span>{toastMsg}</span>
			</div>
			<button type="button" aria-label="Tutup notifikasi" onclick={() => (toastMsg = '')} class="text-slate-500 hover:text-slate-700">×</button>
		</div>
	{/if}

	<!-- Order Header Card -->
	<div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div class="space-y-1">
			<div class="flex items-center gap-2.5">
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
					Pesanan {order.resi_pesan}
				</h1>
				<span class={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
					order.status === 'Lunas'
						? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
						: order.status === 'Dalam Proses'
						? 'bg-purple-100 text-purple-700'
						: 'bg-amber-50 text-amber-800 border border-amber-200'
				}`}>
					{order.status}
				</span>
			</div>
			<p class="text-xs text-slate-500">
				Rute: <strong class="text-slate-800">{order.nm_kota_asal} → {order.nm_kota_tujuan}</strong> • Keberangkatan {order.tgl_berangkat} pukul {order.jam_berangkat?.slice(0, 5)} WIB
			</p>
		</div>

		<div class="flex items-center gap-2 shrink-0">
			{#if order.telepon_member}
				<a
					href={`https://wa.me/${order.telepon_member.replace(/[^0-9]/g, '')}`}
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
				>
					<svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
					<span>WhatsApp Penumpang</span>
				</a>
			{/if}
		</div>
	</div>

	<!-- 2-Columns Split Inspection Desk -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left Column: Slip Preview & Bank Details (5 cols) -->
		<div class="lg:col-span-5 space-y-4">
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
				<div class="flex items-center justify-between pb-2 border-b border-slate-100">
					<h2 class="text-sm font-bold text-slate-900">Pratinjau Slip Transfer Bank</h2>
					<span class="text-[10px] font-mono text-slate-400 font-bold uppercase">Struk M-Banking</span>
				</div>

				{#if order.konfirmasi_no_resi}
					{@const bank = detectBankName(order.no_rek)}
					<!-- Digital Bank Receipt Aesthetic Card -->
					<div class="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
						<div class="bg-slate-900 text-white p-3.5 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="w-6 h-6 rounded bg-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
									{bank.code}
								</div>
								<span class="text-xs font-semibold tracking-wider font-mono">DIGITAL RECEIPT</span>
							</div>
							<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>

						<div class="p-4 bg-slate-50 space-y-3 font-mono text-xs">
							<div class="text-center py-2 border-b border-slate-200">
								<span class="text-[10px] text-slate-500 uppercase tracking-wider block">Nominal Ditransfer</span>
								<span class="text-xl font-black text-slate-900 block mt-0.5">{formatRupiah(order.harga)}</span>
								<span class="text-[10px] text-slate-400 block mt-0.5">
									{order.tgl_transfer} • {order.jam_transfer || '09:00'} WIB
								</span>
							</div>

							<div class="space-y-1.5 text-slate-600 text-[11px]">
								<div class="flex justify-between">
									<span class="text-slate-400">Pengirim:</span>
									<span class="font-bold text-slate-800">{order.nama_member}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-slate-400">Rekening Tujuan:</span>
									<span class="text-slate-800">{order.no_rek || '1140029381029'}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-slate-400">Kanal Bank:</span>
									<span class="font-bold text-slate-800">{bank.label}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-slate-400">No. Referensi:</span>
									<span class="font-bold text-purple-700">{order.konfirmasi_no_resi}</span>
								</div>
							</div>
						</div>

						<div class="p-3 bg-white border-t border-slate-200 text-center">
							<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Mutasi Tercatat Valid di Rekening Kasir
							</span>
						</div>
					</div>
				{:else}
					<div class="py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs space-y-2">
						<svg class="w-8 h-8 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						<p class="font-semibold text-slate-600">Penumpang Belum Mengunggah Slip</p>
						<p class="text-[11px]">Menunggu member mentransfer dan mengirimkan mutasi.</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Column: Verification Checkpoints & Actions (7 cols) -->
		<div class="lg:col-span-7 space-y-4">
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
				<div class="flex items-center justify-between pb-2 border-b border-slate-100">
					<h2 class="text-sm font-bold text-slate-900">Pemeriksaan Kecocokan Otomatis Sistem</h2>
					<span class="text-[10px] font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
						3 Checklist
					</span>
				</div>

				<div class="space-y-3">
					<!-- Checkpoint 1: Nominal -->
					<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
						<div class="flex items-start gap-2.5">
							<div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<div>
								<span class="text-xs font-bold text-slate-900 block">Nominal Tagihan Tiket</span>
								<span class="text-[11px] text-slate-500 font-mono block">
									Total Tagihan: {formatRupiah(order.harga)}
								</span>
							</div>
						</div>
						<span class="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
							100% Cocok
						</span>
					</div>

					<!-- Checkpoint 2: Rute & Kursi -->
					<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
						<div class="flex items-start gap-2.5">
							<div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<div>
								<span class="text-xs font-bold text-slate-900 block">Ketersediaan Kursi #{order.nomor_kursi}</span>
								<span class="text-[11px] text-slate-500 font-mono block">
									{order.jenis_mobil || 'Minibus'} ({order.nomor_polisi || 'Armada Sentral'})
								</span>
							</div>
						</div>
						<span class="font-mono text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
							Terkunci
						</span>
					</div>

					<!-- Checkpoint 3: Resi Match -->
					<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
						<div class="flex items-start gap-2.5">
							<div class={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
								resiMismatch ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
							}`}>
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={resiMismatch ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"} />
								</svg>
							</div>
							<div>
								<span class="text-xs font-bold text-slate-900 block">Kesesuaian Kode Resi Booking</span>
								<span class="text-[11px] text-slate-500 font-mono block">
									Resi: {order.resi_pesan} {order.konfirmasi_no_resi ? `vs Slip: ${order.konfirmasi_no_resi}` : ''}
								</span>
							</div>
						</div>
						<span class={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
							resiMismatch 
								? 'bg-rose-50 text-rose-800 border border-rose-200' 
								: 'bg-emerald-50 text-emerald-800 border border-emerald-100'
						}`}>
							{resiMismatch ? 'Beda Resi' : 'Identik'}
						</span>
					</div>
				</div>

				<!-- Verification Control Action Buttons -->
				<div class="pt-4 border-t border-slate-100 space-y-3">
					<h3 class="text-xs font-bold text-slate-900">Keputusan Operator Meja Loket:</h3>

					{#if order.status === 'Lunas'}
						<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
							<svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div class="text-xs">
								<p class="font-bold text-emerald-900">Pesanan Sudah Berstatus Lunas (Final)</p>
								<p class="text-emerald-700 mt-0.5">Tiket telah diterbitkan ke sistem sopir dan member dapat mencetak Boarding Pass resmi.</p>
							</div>
						</div>
					{:else}
						<div class="flex flex-col sm:flex-row items-center gap-2.5">
							<button
								type="button"
								disabled={submitting}
								onclick={() => ubahStatus('Belum Bayar')}
								class="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs border border-rose-200 transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
							>
								{#if submitting && actionType === 'Belum Bayar'}
									<span class="inline-block w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></span>
									<span>Menolak...</span>
								{:else}
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
									<span>Tolak Bukti Transfer</span>
								{/if}
							</button>

							<button
								type="button"
								disabled={submitting}
								onclick={() => ubahStatus('Lunas')}
								class="w-full sm:flex-1 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
							>
								{#if submitting && actionType === 'Lunas'}
									<span class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
									<span>Memvalidasi...</span>
								{:else}
									<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									<span>Setujui Pembayaran &amp; Terbitkan Tiket</span>
								{/if}
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
