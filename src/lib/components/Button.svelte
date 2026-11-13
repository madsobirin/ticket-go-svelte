<script>
	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		onclick,
		children,
		...rest
	} = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="btn btn-{variant}"
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		font-size: 14px;
		font-weight: 600;
		border-radius: var(--radius);
		border: 1px solid transparent;
		cursor: pointer;
		transition: background-color var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast);
		font-family: inherit;
	}
	.btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.btn-primary {
		background-color: var(--accent);
		color: #ffffff;
	}
	.btn-primary:hover:not(:disabled) {
		background-color: var(--accent-hover);
	}
	.btn-secondary {
		background-color: transparent;
		border-color: var(--border);
		color: var(--text);
	}
	.btn-secondary:hover:not(:disabled) {
		background-color: var(--surface);
		border-color: var(--text-muted);
	}
	.btn-danger {
		background-color: var(--danger);
		color: #ffffff;
	}
	.btn-danger:hover:not(:disabled) {
		background-color: var(--danger-hover);
	}
</style>
