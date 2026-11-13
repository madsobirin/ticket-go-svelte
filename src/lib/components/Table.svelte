<script>
	let { children } = $props();
</script>

<div class="table-container">
	<table class="table">
		{#if children}
			{@render children()}
		{/if}
	</table>
</div>

<style>
	.table-container {
		width: 100%;
		overflow-x: auto;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 14px;
	}
	:global(.table th) {
		background: var(--bg);
		color: var(--text-muted);
		font-weight: 600;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		text-transform: uppercase;
		font-size: 12px;
		letter-spacing: 0.05em;
	}
	:global(.table td) {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		color: var(--text);
	}
	:global(.table tr:last-child td) {
		border-bottom: none;
	}
	:global(.table tr:hover td) {
		background-color: rgba(0, 0, 0, 0.02);
	}
	@media (prefers-color-scheme: dark) {
		:global(.table tr:hover td) {
			background-color: rgba(255, 255, 255, 0.03);
		}
	}
</style>
