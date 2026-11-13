<script>
	let {
		status = 'Belum Bayar',
		...rest
	} = $props();

	function getStatusClass(s) {
		if (s === 'Lunas') return 'badge-lunas';
		if (s === 'Dalam Proses') return 'badge-proses';
		return 'badge-belum';
	}
</script>

<span class="badge {getStatusClass(status)}" {...rest}>
	<span class="status-dot"></span>
	<span class="status-text">{status}</span>
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 12px;
		font-weight: 600;
		padding: 3px 9px;
		border-radius: 20px;
		width: fit-content;
		letter-spacing: 0.02em;
	}
	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: currentColor;
	}
	.badge-belum {
		background-color: rgba(115, 115, 115, 0.12);
		color: var(--status-belum-bayar);
	}
	.badge-proses {
		background-color: rgba(202, 138, 4, 0.12);
		color: var(--status-dalam-proses);
	}
	.badge-lunas {
		background-color: rgba(22, 163, 74, 0.12);
		color: var(--status-lunas);
	}
</style>
