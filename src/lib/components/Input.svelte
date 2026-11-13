<script>
	let {
		label = '',
		value = $bindable(''),
		error = '',
		type = 'text',
		id = undefined,
		required = false,
		placeholder = '',
		...rest
	} = $props();

	const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 7) : undefined);
</script>

<div class="input-group">
	{#if label}
		<label for={inputId} class="label">
			{label}
			{#if required}<span class="req">*</span>{/if}
		</label>
	{/if}
	<input
		{type}
		id={inputId}
		bind:value
		{required}
		{placeholder}
		class="input"
		class:has-error={!!error}
		{...rest}
	/>
	{#if error}
		<span class="error-msg">{error}</span>
	{/if}
</div>

<style>
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
		width: 100%;
	}
	.label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}
	.req {
		color: var(--danger);
		margin-left: 0.2rem;
	}
	.input {
		padding: 0.5rem 0.75rem;
		font-size: 14px;
		font-family: inherit;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text);
		transition: border-color var(--transition-fast);
		width: 100%;
	}
	.input:focus {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
		border-color: var(--accent);
	}
	.input.has-error {
		border-color: var(--danger);
	}
	.error-msg {
		font-size: 12px;
		color: var(--danger);
	}
</style>
