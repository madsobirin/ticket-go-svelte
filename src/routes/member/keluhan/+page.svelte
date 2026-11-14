<script>
	import { invalidateAll } from '$app/navigation';
	import Toast from '$lib/components/Toast.svelte';

	let { data } = $props();
	let keluhanList = $derived(data.keluhanList || []);

	let jKeluhan = $state('');
	let dKeluhan = $state('');
	let submitting = $state(false);
	let errorMsg = $state('');
	let toastMsg = $state('');
	let toastType = $state('success');

	const quickCategories = [
		'Pelayanan Sopir',
		'Kondisi Armada',
		'Jadwal Terlambat',
		'Fasilitas AC/Kursi',
		'Loket & Tiket'
	];

	function pickCategory(cat) {
		jKeluhan = cat.slice(0, 20);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		errorMsg = '';

		if (!jKeluhan.trim()) {
			errorMsg = 'Jenis keluhan wajib diisi';
			return;
		}
		if (jKeluhan.trim().length > 20) {
			errorMsg = 'Jenis keluhan maksimal 20 karakter';
			return;
		}
		if (!dKeluhan.trim()) {
			errorMsg = 'Deskripsi keluhan wajib diisi';
			return;
		}
		if (dKeluhan.trim().length > 200) {
			errorMsg = 'Deskripsi keluhan maksimal 200 karakter';
			return;
		}

		submitting = true;
		try {
			const res = await fetch('/api/member/keluhan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					j_keluhan: jKeluhan.trim(),
					d_keluhan: dKeluhan.trim()
				})
			});

			const json = await res.json();
			if (!res.ok) {
				toastType = 'error';
				toastMsg = json.error?.message || 'Gagal mengirim keluhan';
				return;
			}

			toastType = 'success';
			toastMsg = 'Keluhan Anda berhasil dikirim ke pengelola travel.';
			jKeluhan = '';
			dKeluhan = '';
			await invalidateAll();
		} catch {
			toastType = 'error';
			toastMsg = 'Gagal menghubungi server';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Layanan Keluhan Pelanggan | Ticket Go</title>
</svelte:head>

<div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 antialiased">
	<!-- Top Navigation Breadcrumb & Support Info -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<div class="flex items-center gap-2 text-xs font-medium text-slate-500">
			<a href="/member" class="hover:text-purple-600 transition flex items-center gap-1">
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
				</svg>
				<span>Beranda</span>
			</a>
			<span class="text-slate-300">/</span>
			<span class="text-slate-900 font-semibold">Layanan Keluhan Pelanggan</span>
		</div>

		<div class="flex items-center gap-2 self-start sm:self-auto">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600">
				<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
				<span>Layanan Pengaduan Cepat:</span>
				<strong class="text-slate-800">0812-7890-1234</strong>
			</div>
		</div>
	</div>

	<!-- Page Title Header -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div class="space-y-1">
			<div class="flex items-center gap-2.5 flex-wrap">
				<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
					Kotak Saran &amp; Keluhan
				</h1>
				<span class="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
					Customer Care Resmi
				</span>
			</div>
			<p class="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
				Sampaikan saran, keluhan armada, sopir, atau kendala fasilitas perjalanan Anda. Tim pengawas operasional PT Ticket Go siap menindaklanjuti.
			</p>
		</div>

		<div class="flex items-center gap-2 shrink-0">
			<span class="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
				Total Keluhan: <strong class="text-slate-900">{keluhanList.length}</strong>
			</span>
		</div>
	</div>

	<!-- Main 2-Column Content Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left: Form Kirim Keluhan Baru (7 Cols) -->
		<div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
			<div class="border-b border-slate-100 pb-3 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</div>
					<div>
						<h2 class="text-base font-bold text-slate-900">Formulir Pengaduan Pelanggan</h2>
						<p class="text-xs text-slate-500">Isi data kendala Anda secara singkat dan jelas</p>
					</div>
				</div>
			</div>

			{#if errorMsg}
				<div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
					<svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke-width="2" />
						<line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round" />
						<circle cx="12" cy="16" r="1" fill="currentColor" />
					</svg>
					<span>{errorMsg}</span>
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-4">
				<!-- Jenis Keluhan -->
				<div class="space-y-1.5">
					<label for="j_keluhan" class="text-xs font-bold text-slate-800 block">
						Kategori / Jenis Keluhan <span class="text-rose-500">*</span>
					</label>

					<!-- Quick Category Chips -->
					<div class="flex flex-wrap gap-1.5 pb-1">
						{#each quickCategories as cat}
							<button
								type="button"
								onclick={() => pickCategory(cat)}
								class={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
									jKeluhan === cat
										? 'bg-purple-600 text-white border-purple-600 shadow-xs'
										: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
								}`}
							>
								{cat}
							</button>
						{/each}
					</div>

					<input
						id="j_keluhan"
						type="text"
						maxlength="20"
						bind:value={jKeluhan}
						disabled={submitting}
						placeholder="Misal: Armada, Sopir, Jadwal (maks 20 karakter)"
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
					/>
					<div class="flex justify-end text-[11px] text-slate-400">
						<span>{jKeluhan.length}/20 karakter</span>
					</div>
				</div>

				<!-- Deskripsi Keluhan -->
				<div class="space-y-1.5">
					<label for="d_keluhan" class="text-xs font-bold text-slate-800 block">
						Uraian Kendala / Saran <span class="text-rose-500">*</span>
					</label>
					<textarea
						id="d_keluhan"
						rows="4"
						maxlength="200"
						bind:value={dKeluhan}
						disabled={submitting}
						placeholder="Tuliskan secara ringkas kendala atau ketidaknyamanan yang Anda alami (maks 200 karakter)..."
						class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition resize-none"
					></textarea>
					<div class="flex justify-between items-center text-[11px] text-slate-400">
						<span>Saran Anda membantu peningkatan mutu layanan armada kami.</span>
						<span>{dKeluhan.length}/200 karakter</span>
					</div>
				</div>

				<!-- Submit Button -->
				<div class="pt-2 flex items-center justify-end">
					<button
						type="submit"
						disabled={submitting}
						class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer"
					>
						{#if submitting}
							<span class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
							<span>Mengirim Keluhan...</span>
						{:else}
							<svg class="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
							</svg>
							<span>Kirim Keluhan ke Pengelola</span>
						{/if}
					</button>
				</div>
			</form>
		</div>

		<!-- Right: Riwayat Keluhan Member (5 Cols) -->
		<div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
			<div class="border-b border-slate-100 pb-3 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
					<h2 class="text-base font-bold text-slate-900">Riwayat Keluhan Anda</h2>
				</div>
				<span class="text-xs text-slate-400 font-mono">Daftar Arsip</span>
			</div>

			{#if keluhanList.length === 0}
				<div class="p-8 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
					<div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<div>
						<p class="text-sm font-bold text-slate-800">Belum Ada Riwayat Keluhan</p>
						<p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
							Anda belum pernah mengirimkan keluhan. Setiap masukan yang Anda kirimkan akan tersimpan di sini.
						</p>
					</div>
				</div>
			{:else}
				<div class="space-y-3 max-h-[520px] overflow-y-auto pr-1">
					{#each keluhanList as item (item.id_keluhan)}
						<div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2 hover:border-slate-300 transition">
							<div class="flex items-center justify-between gap-2">
								<span class="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
									{item.j_keluhan}
								</span>
								<span class="font-mono text-[11px] text-slate-400 font-bold">
									#ID {item.id_keluhan}
								</span>
							</div>

							<p class="text-xs sm:text-sm text-slate-800 leading-relaxed break-words">
								{item.d_keluhan}
							</p>

							<div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
								<span class="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
									<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
									Diterima Pengawas Travel
								</span>
								<span class="text-slate-400 font-medium">Status: Dicatat</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

{#if toastMsg}
	<Toast
		message={toastMsg}
		type={toastType}
		duration={3500}
		onclose={() => (toastMsg = '')}
	/>
{/if}
