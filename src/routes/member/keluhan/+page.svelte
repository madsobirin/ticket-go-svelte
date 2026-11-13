<script>
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { data } = $props();
	let keluhanList = $state(data.keluhanList);

	$effect(() => {
		keluhanList = data.keluhanList;
	});

	let jKeluhan = $state('');
	let dKeluhan = $state('');
	let submitting = $state(false);
	let errorMsg = $state('');
	let toastMsg = $state('');
	let toastType = $state('success');

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

<div class="keluhan-page">
	<div class="page-header">
		<h1>Layanan Keluhan Pelanggan</h1>
		<p class="subtitle">Sampaikan saran, keluhan, atau kendala Anda seputar layanan perjalanan travel kami.</p>
	</div>

	<div class="grid-container">
		<!-- Form Pengiriman Keluhan -->
		<div class="card form-card">
			<h2>Kirim Keluhan Baru</h2>

			{#if errorMsg}
				<div class="alert alert-danger" role="alert">{errorMsg}</div>
			{/if}

			<form onsubmit={handleSubmit} class="keluhan-form">
				<div class="form-group">
					<label for="j_keluhan">Jenis Keluhan <span class="req">*</span></label>
					<Input
						id="j_keluhan"
						placeholder="Misal: Armada, Sopir, Jadwal (maks 20 karakter)"
						maxlength="20"
						bind:value={jKeluhan}
						disabled={submitting}
					/>
					<div class="char-count">{jKeluhan.length}/20 karakter</div>
				</div>

				<div class="form-group">
					<label for="d_keluhan">Deskripsi Keluhan <span class="req">*</span></label>
					<textarea
						id="d_keluhan"
						class="textarea"
						rows="4"
						placeholder="Tuliskan secara ringkas kendala yang Anda alami (maks 200 karakter)..."
						maxlength="200"
						bind:value={dKeluhan}
						disabled={submitting}
					></textarea>
					<div class="char-count">{dKeluhan.length}/200 karakter</div>
				</div>

				<div class="form-actions">
					<Button type="submit" variant="primary" disabled={submitting}>
						{#if submitting}
							<span>Mengirim...</span>
						{:else}
							<span>Kirim Keluhan</span>
						{/if}
					</Button>
				</div>
			</form>
		</div>

		<!-- Riwayat Keluhan Member -->
		<div class="card history-card">
			<h2>Riwayat Keluhan Anda</h2>

			{#if keluhanList.length === 0}
				<div class="empty-state">
					<p>Belum ada keluhan yang Anda kirimkan.</p>
				</div>
			{:else}
				<div class="history-list">
					{#each keluhanList as item (item.id_keluhan)}
						<div class="history-item">
							<div class="item-header">
								<span class="badge-jenis">{item.j_keluhan}</span>
								<span class="item-id">#ID {item.id_keluhan}</span>
							</div>
							<p class="item-desc">{item.d_keluhan}</p>
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

<style>
	.keluhan-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.page-header h1 {
		margin: 0 0 var(--space-1) 0;
		font-size: 1.5rem;
		color: var(--text-dark);
	}

	.subtitle {
		margin: 0;
		color: var(--text-muted);
		font-size: 14px;
	}

	.grid-container {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-4);
	}

	@media (min-width: 800px) {
		.grid-container {
			grid-template-columns: 1.1fr 0.9fr;
		}
	}

	.card {
		background-color: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: var(--space-4);
		box-shadow: var(--shadow-sm);
	}

	.card h2 {
		margin-top: 0;
		margin-bottom: var(--space-3);
		font-size: 1.15rem;
		color: var(--text-dark);
		border-bottom: 1px solid var(--border);
		padding-bottom: var(--space-2);
	}

	.alert {
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius);
		font-size: 13px;
		margin-bottom: var(--space-3);
	}

	.alert-danger {
		background-color: #fee2e2;
		color: #991b1b;
		border: 1px solid #f87171;
	}

	.keluhan-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.form-group label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-dark);
	}

	.req {
		color: var(--danger);
	}

	.textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-family: inherit;
		font-size: 14px;
		color: var(--text-dark);
		background-color: var(--surface);
		resize: vertical;
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
		box-sizing: border-box;
	}

	.textarea:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
	}

	.char-count {
		font-size: 12px;
		color: var(--text-muted);
		text-align: right;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: var(--space-2);
	}

	.empty-state {
		padding: var(--space-4);
		text-align: center;
		color: var(--text-muted);
		font-size: 14px;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-height: 450px;
		overflow-y: auto;
	}

	.history-item {
		background-color: var(--surface-alt);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: var(--space-3);
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-1);
	}

	.badge-jenis {
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
		background-color: #eff6ff;
		padding: 2px 8px;
		border-radius: var(--radius);
		border: 1px solid #bfdbfe;
	}

	.item-id {
		font-size: 12px;
		color: var(--text-muted);
		font-family: monospace;
	}

	.item-desc {
		margin: var(--space-1) 0 0 0;
		font-size: 14px;
		color: var(--text-dark);
		line-height: 1.4;
		word-break: break-word;
	}
</style>
