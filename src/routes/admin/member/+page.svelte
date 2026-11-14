<script>
	import { onMount } from 'svelte';

	let memberList = $state([]);
	let loading = $state(true);
	let errorMsg = $state('');
	let successMsg = $state('');

	// Search & Gender Filter
	let searchQuery = $state('');
	let filterGender = $state('');

	// Form & Modal state
	let showModal = $state(false);
	let editingId = $state(null);
	let nama = $state('');
	let alamat = $state('');
	let telepon = $state('');
	let jenKelamin = $state('L');
	let username = $state('');
	let password = $state('');
	let formLoading = $state(false);

	onMount(() => {
		loadMembers();
	});

	async function loadMembers() {
		loading = true;
		errorMsg = '';
		try {
			const res = await fetch('/api/admin/member');
			const json = await res.json();
			if (res.ok) {
				memberList = json.data;
			} else {
				errorMsg = json.error?.message ?? 'Gagal memuat data member';
			}
		} catch {
			errorMsg = 'Gagal menghubungi server';
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		editingId = null;
		nama = '';
		alamat = '';
		telepon = '';
		jenKelamin = 'L';
		username = '';
		password = '';
		errorMsg = '';
		successMsg = '';
		showModal = true;
	}

	function startEdit(item) {
		editingId = item.id_member;
		nama = item.nama;
		alamat = item.alamat;
		telepon = item.telepon;
		jenKelamin = item.jen_kelamin;
		username = item.username;
		password = ''; // Kosongkan jika tidak ingin mengubah password
		errorMsg = '';
		successMsg = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingId = null;
		errorMsg = '';
	}

	async function handleSubmit(e) {
		e.preventDefault();
		formLoading = true;
		errorMsg = '';
		successMsg = '';

		const payload = {
			nama: nama.trim(),
			alamat: alamat.trim(),
			telepon: telepon.trim(),
			jen_kelamin: jenKelamin,
			username: username.trim(),
			password: password.trim()
		};

		try {
			let res;
			if (editingId) {
				res = await fetch(`/api/admin/member/${editingId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			} else {
				res = await fetch('/api/admin/member', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			}

			const json = await res.json();
			if (res.ok) {
				successMsg = editingId ? 'Data member berhasil diperbarui' : 'Member baru berhasil didaftarkan';
				closeModal();
				await loadMembers();
				setTimeout(() => (successMsg = ''), 3000);
			} else {
				errorMsg = json.error?.message ?? 'Gagal menyimpan data member';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan jaringan saat menyimpan member';
		} finally {
			formLoading = false;
		}
	}

	async function handleDelete(id, namaMember) {
		if (!confirm(`Hapus akun member "${namaMember}"? Pastikan member tidak memiliki transaksi aktif.`)) {
			return;
		}

		try {
			const res = await fetch(`/api/admin/member/${id}`, { method: 'DELETE' });
			if (res.ok) {
				// Hapus realtime dari state lokal seketika
				memberList = memberList.filter((m) => m.id_member !== id);
				successMsg = `Member ${namaMember} berhasil dihapus`;
				errorMsg = '';
				await loadMembers();
				setTimeout(() => (successMsg = ''), 3000);
			} else {
				const json = await res.json().catch(() => ({}));
				errorMsg = json.error?.message ?? 'Gagal menghapus member';
			}
		} catch {
			errorMsg = 'Terjadi kesalahan jaringan saat menghapus member';
		}
	}

	// Filtered list
	const filteredList = $derived(
		memberList.filter((item) => {
			const text = `${item.nama} ${item.username} ${item.telepon} ${item.alamat}`.toLowerCase();
			const matchesSearch = !searchQuery.trim() || text.includes(searchQuery.toLowerCase());
			const matchesGender = !filterGender || item.jen_kelamin === filterGender;
			return matchesSearch && matchesGender;
		})
	);
</script>

<svelte:head>
	<title>Kelola Data Member | Ticket Go Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
	<!-- Top Breadcrumb & Status Bar -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<span>Portal Operasional</span>
			<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" stroke-width="2" />
			</svg>
			<span class="text-slate-900 font-semibold">Kelola Data Member</span>
		</div>

		<div class="flex items-center gap-2.5">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
				<span class="w-2 h-2 rounded-full bg-purple-600"></span>
				<span>{memberList.length} Akun Member Terdaftar</span>
			</span>
			<button
				type="button"
				onclick={loadMembers}
				class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				<span>Segarkan</span>
			</button>
		</div>
	</div>

	<!-- Page Header -->
	<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
		<div class="space-y-1">
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
				Manajemen Data Member &amp; Penumpang
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 max-w-2xl">
				Kelola akun pengguna, nomor kontak WhatsApp, data domisili, dan pantau riwayat keaktifan pesanan tiket travel antarkota.
			</p>
		</div>

		<div class="flex items-center flex-wrap gap-2.5 shrink-0">
			<button
				type="button"
				onclick={openCreateModal}
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke-width="2" />
					<line x1="12" y1="8" x2="12" y2="16" stroke-width="2" />
					<line x1="8" y1="12" x2="16" y2="12" stroke-width="2" />
				</svg>
				<span>+ Registrasi Member Baru</span>
			</button>
		</div>
	</div>

	<!-- Alert Messages -->
	{#if successMsg}
		<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				<span>{successMsg}</span>
			</div>
			<button type="button" aria-label="Tutup pesan" onclick={() => (successMsg = '')} class="text-emerald-600 hover:text-emerald-800">×</button>
		</div>
	{/if}

	{#if errorMsg && !showModal}
		<div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke-width="2" />
					<line x1="12" y1="8" x2="12" y2="12" stroke-width="2" />
					<line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" />
				</svg>
				<span>{errorMsg}</span>
			</div>
			<button type="button" aria-label="Tutup pesan" onclick={() => (errorMsg = '')} class="text-rose-600 hover:text-rose-800">×</button>
		</div>
	{/if}

	<!-- Search & Filter Bar -->
	<div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
		<div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
			<div class="md:col-span-8 relative">
				<svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="11" cy="11" r="8" stroke-width="2" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari nama member, username, nomor HP/WA, atau alamat..."
					class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
				/>
			</div>

			<div class="md:col-span-4">
				<select
					bind:value={filterGender}
					aria-label="Filter jenis kelamin"
					class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
				>
					<option value="">Semua Jenis Kelamin</option>
					<option value="L">Laki-Laki</option>
					<option value="P">Perempuan</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Member List Table -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
		<div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
				<h2 class="text-sm font-bold text-slate-900">Daftar Member Terdaftar</h2>
			</div>
			<span class="text-xs text-slate-400 font-mono">Total {filteredList.length} Akun</span>
		</div>

		{#if loading}
			<div class="py-16 text-center text-slate-400 text-xs space-y-2">
				<div class="inline-block w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
				<p>Memuat data member...</p>
			</div>
		{:else if filteredList.length === 0}
			<div class="p-12 text-center text-slate-400 text-xs space-y-3">
				<svg class="w-10 h-10 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
				<p class="font-medium">Tidak ada member yang cocok dengan filter.</p>
				<button
					type="button"
					onclick={openCreateModal}
					class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold"
				>
					+ Daftarkan Member Baru
				</button>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
							<th class="p-3.5">Member &amp; Akun</th>
							<th class="p-3.5">Kontak &amp; Gender</th>
							<th class="p-3.5">Alamat Domisili</th>
							<th class="p-3.5 text-center">Riwayat Pesanan</th>
							<th class="p-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 text-xs">
						{#each filteredList as item (item.id_member)}
							<tr class="hover:bg-slate-50/80 transition-colors">
								<td class="p-3.5">
									<div class="flex items-center gap-3">
										<div class="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-100">
											{item.nama.slice(0, 2).toUpperCase()}
										</div>
										<div>
											<div class="font-bold text-slate-900">{item.nama}</div>
											<span class="font-mono text-[11px] text-slate-400">@{item.username}</span>
										</div>
									</div>
								</td>

								<td class="p-3.5">
									<div class="font-mono font-bold text-slate-800">{item.telepon}</div>
									<span class={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
										item.jen_kelamin === 'L' 
											? 'bg-blue-50 text-blue-700 border border-blue-100' 
											: 'bg-rose-50 text-rose-700 border border-rose-100'
									}`}>
										{item.jen_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
									</span>
								</td>

								<td class="p-3.5 max-w-xs">
									<p class="text-slate-600 truncate">{item.alamat || '-'}</p>
								</td>

								<td class="p-3.5 text-center font-mono">
									<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
										{item.pesanan_lunas || 0} / {item.total_pesanan || 0} Trip
									</span>
								</td>

								<td class="p-3.5 text-right">
									<div class="inline-flex items-center gap-1.5">
										<button
											type="button"
											onclick={() => startEdit(item)}
											class="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
										>
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
											<span>Edit</span>
										</button>

										<button
											type="button"
											onclick={() => handleDelete(item.id_member, item.nama)}
											class="px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200 inline-flex items-center gap-1 transition"
										>
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
											<span>Hapus</span>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Modal Create / Edit Member -->
{#if showModal}
	<div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
			<div class="flex items-center justify-between pb-2 border-b border-slate-100">
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
					<h3 class="text-base font-bold text-slate-900">
						{editingId ? 'Edit Data Member' : 'Registrasi Member Baru'}
					</h3>
				</div>
				<button
					type="button"
					aria-label="Tutup form modal"
					onclick={closeModal}
					class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{#if errorMsg}
				<div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
					<div class="flex items-center gap-2">
						<svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<circle cx="12" cy="12" r="10" stroke-width="2" />
							<line x1="12" y1="8" x2="12" y2="12" stroke-width="2" />
							<line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" />
						</svg>
						<span>{errorMsg}</span>
					</div>
					<button type="button" aria-label="Tutup pesan error" onclick={() => (errorMsg = '')} class="text-rose-600 hover:text-rose-800 font-bold text-sm leading-none">×</button>
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-3 text-xs">
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="form-nama" class="block text-slate-600 font-semibold mb-1">Nama Lengkap</label>
						<input
							id="form-nama"
							type="text"
							bind:value={nama}
							required
							placeholder="Nama penumpang"
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
						/>
					</div>

					<div>
						<label for="form-wa" class="block text-slate-600 font-semibold mb-1">Nomor Telepon / WhatsApp</label>
						<input
							id="form-wa"
							type="tel"
							bind:value={telepon}
							required
							placeholder="08xxxxxxxxxx"
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="form-gender" class="block text-slate-600 font-semibold mb-1">Jenis Kelamin</label>
						<select
							id="form-gender"
							bind:value={jenKelamin}
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
						>
							<option value="L">Laki-Laki</option>
							<option value="P">Perempuan</option>
						</select>
					</div>

					<div>
						<label for="form-username" class="block text-slate-600 font-semibold mb-1">Username Login</label>
						<input
							id="form-username"
							type="text"
							bind:value={username}
							required
							placeholder="username_member"
							class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
						/>
					</div>
				</div>

				<div>
					<label for="form-password" class="block text-slate-600 font-semibold mb-1">
						{editingId ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi (Minimal 6 karakter)'}
					</label>
					<input
						id="form-password"
						type="password"
						bind:value={password}
						placeholder={editingId ? '••••••••' : 'Password akun'}
						required={!editingId}
						minlength={editingId ? 0 : 6}
						class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
					/>
				</div>

				<div>
					<label for="form-alamat" class="block text-slate-600 font-semibold mb-1">Alamat Domisili</label>
					<textarea
						id="form-alamat"
						bind:value={alamat}
						rows="2"
						required
						placeholder="Alamat lengkap penumpang"
						class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
					></textarea>
				</div>

				<div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
					<button
						type="button"
						onclick={closeModal}
						class="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={formLoading}
						class="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition disabled:opacity-50"
					>
						{formLoading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Daftarkan Member'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
