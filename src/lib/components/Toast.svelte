<script>
	import { fly, fade } from 'svelte/transition';

	let {
		message = '',
		type = 'success', // 'success' | 'error' | 'info'
		duration = 3000,
		onclose = undefined
	} = $props();

	let visible = $state(true);

	$effect(() => {
		if (duration > 0 && message) {
			const timer = setTimeout(() => {
				visible = false;
				if (onclose) onclose();
			}, duration);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if visible && message}
	<div
		class="toast-wrapper"
		role="status"
		aria-live="polite"
		transition:fly={{ y: 20, duration: 250 }}
	>
		<div class="toast toast-{type}">
			<span class="message">{message}</span>
			{#if onclose}
				<button class="close-btn" onclick={() => { visible = false; onclose(); }} aria-label="Tutup">&times;</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.toast-wrapper {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		max-width: 90vw;
	}
	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.25rem;
		border-radius: var(--radius);
		font-size: 14px;
		font-weight: 500;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	.toast-success {
		background-color: var(--status-lunas);
		color: #ffffff;
	}
	.toast-error {
		background-color: var(--danger);
		color: #ffffff;
	}
	.toast-info {
		background-color: var(--accent);
		color: #ffffff;
	}
	.close-btn {
		background: transparent;
		border: none;
		color: inherit;
		font-size: 18px;
		cursor: pointer;
		line-height: 1;
		padding: 0;
	}
</style>
