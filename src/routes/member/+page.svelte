<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Select from '$lib/components/Select.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let kotaAsalList = $state([]);
	let kotaTujuanList = $state([]);
	let jadwalList = $state([]);

	let filterAsal = $state('');
	let filterTujuan = $state('');
	let filterTanggal = $state('');

	let loading = $state(true);
	let errorMsg = $state('');
	let prefersReducedMotion = $state(false);

	const todayDate = new Date().toISOString().split('T')[0];

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const handler = (e) => (prefersReducedMotion = e.matches);
		mq.addEventListener('change', handler);

		loadKota();
		loadJadwal();

		return () => mq.removeEventListener('change', handler);
	});

	async function loadKota() {
		try {
			const res = await fetch('/api/kota');
			const json = await res.json();
			if (res.ok) {
				kotaAsalList = json.data.kota_asal;
				kotaTujuanList = json.data.kota_tujuan;
			}
		} catch {
			// silent fallback
		}
	}

	async function loadJadwal() {
		loading = true;
		errorMsg = '';
		try {
			const params = new URLSearchParams();
			if (filterAsal) params.append('id_kota_asal', filterAsal);
			if (filterTujuan) params.append('id_kota_tujuan', filterTujuan);
			if (filterTanggal) params.append('tanggal', filterTanggal);

			const res = await fetch(`/api/member/jadwal?${params.toString()}`);
			const json = await res.json();
			if (res.ok) {
				jadwalList = json.data;
			} else {
				errorMsg = json.error?.message ?? 'Gagal memuat jadwal';
			}
		} catch {
			errorMsg = 'Gagal menghubungi server';
		} finally {
			loading = false;
		}
	}

	function handleSearch(e) {
		e.preventDefault();
		loadJadwal();
	}

	function resetFilter() {
		filterAsal = '';
		filterTujuan = '';
		filterTanggal = '';
		loadJadwal();
	}

	function formatRupiah(num) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<div class="search-page">
	<div class="hero">
		<h1>Pesan Tiket Travel Lampung</h1>
		<p class="subtitle">Temukan jadwal perjalanan antarkota dan pilih kursi favorit Anda</p>
	</div>

	<!-- Filter Box -->
	<div class="filter-card">
		<form onsubmit={handleSearch} class="filter-form">
			<div class="filter-grid">
				<Select
					label="Kota Asal"
					bind:value={filterAsal}
					placeholder="Semua Kota Asal"
					options={kotaAsalList.map((k) => ({ value: String(k.id_kota_asal), label: k.nm_kota_asal }))}
				/>
				<Select
					label="Kota Tujuan"
					bind:value={filterTujuan}
					placeholder="Semua Kota Tujuan"
					options={kotaTujuanList.map((k) => ({ value: String(k.id_kota_tujuan), label: k.nm_kota_tujuan }))}
				/>
				<Input
					label="Tanggal Berangkat"
					type="date"
					bind:value={filterTanggal}
					min={todayDate}
				/>
			</div>
			<div class="filter-actions">
				<Button type="submit" variant="primary">Cari Jadwal</Button>
				{#if filterAsal || filterTujuan || filterTanggal}
					<Button type="button" variant="secondary" onclick={resetFilter}>Reset</Button>
				{/if}
			</div>
		</form>
	</div>

	<!-- Jadwal List Section -->
	<section class="results-section">
		<h2>Jadwal Tersedia</h2>

		{#if errorMsg}
			<div class="alert alert-danger">{errorMsg}</div>
		{/if}

		{#if loading}
			<div class="skeleton-list">
				<Skeleton height="110px" count={3} />
			</div>
		{:else if jadwalList.length === 0}
			<div class="empty-card">
				<p>Tidak ada jadwal perjalanan yang ditemukan.</p>
				<small>Coba ubah tanggal atau kota pilihan Anda.</small>
			</div>
		{:else}
			<div class="schedule-grid">
				{#each jadwalList as item, i (item.id_jadwal)}
					<a
						href="/member/jadwal/{item.id_jadwal}"
						class="schedule-card"
						in:fly={{ y: 8, duration: prefersReducedMotion ? 0 : 250, delay: prefersReducedMotion ? 0 : Math.min(i * 40, 400) }}
					>
						<div class="route-info">
							<div class="cities">
								<span class="city origin">{item.nm_kota_asal}</span>
								<span class="arrow">&rarr;</span>
								<span class="city dest">{item.nm_kota_tujuan}</span>
							</div>
							<div class="vehicle-info">
								<span>{item.jenis_mobil}</span>
								<span class="dot">&bull;</span>
								<span>{item.nomor_polisi}</span>
							</div>
						</div>

						<div class="time-price">
							<div class="time-block">
								<div class="time">{item.jam_berangkat} WIB</div>
								<div class="date">{item.tgl_berangkat}</div>
							</div>
							<div class="price-block">
								<div class="price">{formatRupiah(item.harga)}</div>
								<span class="select-badge">Pilih Kursi</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.search-page {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.hero h1 {
		font-size: 28px;
		font-weight: 600;
		margin: 0;
		color: var(--text);
	}
	.subtitle {
		font-size: 15px;
		color: var(--text-muted);
		margin: 0.5rem 0 0;
	}
	.filter-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
	}
	.filter-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}
	.filter-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	.results-section h2 {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 1rem;
		color: var(--text);
	}
	.schedule-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.schedule-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
	}
	.schedule-card:hover {
		transform: translateY(-2px);
		border-color: var(--accent);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
	}
	@media (max-width: 680px) {
		.schedule-card {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
	}
	.cities {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 17px;
		font-weight: 600;
		color: var(--text);
	}
	.arrow {
		color: var(--accent);
	}
	.vehicle-info {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 13px;
		color: var(--text-muted);
		margin-top: 0.35rem;
	}
	.time-price {
		display: flex;
		align-items: center;
		gap: 2rem;
		text-align: right;
	}
	.time {
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
	}
	.date {
		font-size: 13px;
		color: var(--text-muted);
	}
	.price {
		font-size: 17px;
		font-weight: 600;
		color: var(--accent);
	}
	.select-badge {
		display: inline-block;
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
		background: rgba(37, 99, 235, 0.1);
		padding: 2px 8px;
		border-radius: var(--radius-sm);
		margin-top: 0.25rem;
	}
	.skeleton-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.empty-card {
		padding: 3rem 1.5rem;
		text-align: center;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--text-muted);
	}
	.alert-danger {
		background: #fee;
		color: var(--danger);
		padding: 0.75rem;
		border-radius: var(--radius);
		margin-bottom: 1rem;
	}
</style>
