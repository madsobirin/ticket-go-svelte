<script>
	let {
		width = '100%',
		height = '20px',
		radius = 'var(--radius)',
		count = 1
	} = $props();
</script>

<div class="skeleton-group">
	{#each Array(count) as _, i}
		<div
			class="skeleton"
			style="width: {width}; height: {height}; border-radius: {radius};"
		></div>
	{/each}
</div>

<style>
	.skeleton-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}
	.skeleton {
		background: linear-gradient(
			90deg,
			var(--border) 25%,
			rgba(255, 255, 255, 0.4) 50%,
			var(--border) 75%
		);
		background-size: 200% 100%;
		animation: pulse 1.5s infinite ease-in-out;
	}
	@media (prefers-color-scheme: dark) {
		.skeleton {
			background: linear-gradient(
				90deg,
				var(--border) 25%,
				rgba(255, 255, 255, 0.05) 50%,
				var(--border) 75%
			);
			background-size: 200% 100%;
		}
	}
	@keyframes pulse {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.skeleton {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
