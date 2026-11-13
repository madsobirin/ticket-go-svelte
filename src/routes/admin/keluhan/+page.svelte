<script>
	import Table from '$lib/components/Table.svelte';

	let { data } = $props();
	let keluhanList = $state(data.keluhanList);

	$effect(() => {
		keluhanList = data.keluhanList;
	});
</script>

<div class="admin-keluhan-page">
	<div class="page-header">
		<div>
			<h1>Daftar Keluhan Pelanggan</h1>
			<p class="subtitle">Pantau keluhan dan masukan yang dikirimkan oleh para member (mode hanya lihat).</p>
		</div>
	</div>

	{#if keluhanList.length === 0}
		<div class="empty-state">
			<p>Belum ada keluhan yang masuk dari member.</p>
		</div>
	{:else}
		<Table>
			<thead>
				<tr>
					<th>ID</th>
					<th>Nama Pelanggan</th>
					<th>No. Telepon</th>
					<th>Jenis Keluhan</th>
					<th>Deskripsi Keluhan</th>
				</tr>
			</thead>
			<tbody>
				{#each keluhanList as item (item.id_keluhan)}
					<tr>
						<td><span class="id-tag">#{item.id_keluhan}</span></td>
						<td><strong>{item.nama_member}</strong></td>
						<td><span class="phone-text">{item.telepon_member}</span></td>
						<td>
							<span class="badge-jenis">{item.j_keluhan}</span>
						</td>
						<td>
							<div class="desc-text">{item.d_keluhan}</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</Table>
	{/if}
</div>

<style>
	.admin-keluhan-page {
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

	.empty-state {
		background-color: var(--surface);
		border: 1px dashed var(--border);
		border-radius: var(--radius);
		padding: var(--space-6);
		text-align: center;
		color: var(--text-muted);
		font-size: 14px;
	}

	.id-tag {
		font-family: monospace;
		font-weight: 700;
		color: var(--text-muted);
		background-color: var(--surface-alt);
		padding: 2px 6px;
		border-radius: var(--radius);
		font-size: 12px;
	}

	.phone-text {
		color: var(--text-muted);
		font-size: 13px;
	}

	.badge-jenis {
		display: inline-block;
		font-size: 12px;
		font-weight: 600;
		color: #1e40af;
		background-color: #dbeafe;
		padding: 2px 8px;
		border-radius: var(--radius);
	}

	.desc-text {
		font-size: 14px;
		color: var(--text-dark);
		line-height: 1.4;
		max-width: 500px;
		word-break: break-word;
	}
</style>
