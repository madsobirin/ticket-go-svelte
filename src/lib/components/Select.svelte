<script>
	let {
		label = '',
		value = $bindable(''),
		options = [],
		error = '',
		id = undefined,
		required = false,
		placeholder = '-- Pilih --',
		children,
		...rest
	} = $props();

	const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 7) : undefined);
</script>

<div class="select-group">
	{#if label}
		<label for={selectId} class="label">
			{label}
			{#if required}<span class="req">*</span>{/if}
		</label>
	{/if}
	<select
		id={selectId}
		bind:value
		{required}
		class="select"
		class:has-error={!!error}
		{...rest}
	>
		{#if placeholder}
			<option value="" disabled selected={!value}>{placeholder}</option>
		{/if}
		{#if options.length > 0}
			{#each options as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		{:else if children}
			{@render children()}
		{/if}
	</select>
	{#if error}
		<span class="error-msg">{error}</span>
	{/if}
</div>

<style>
	.select-group {
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
	.select {
		padding: 0.5rem 0.75rem;
		font-size: 14px;
		font-family: inherit;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text);
		transition: border-color var(--transition-fast);
		width: 100%;
		cursor: pointer;
	}
	.select:focus {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
		border-color: var(--accent);
	}
	.select.has-error {
		border-color: var(--danger);
	}
	.error-msg {
		font-size: 12px;
		color: var(--danger);
	}
</style>
