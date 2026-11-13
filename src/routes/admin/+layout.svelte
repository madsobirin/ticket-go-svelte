<script>
	let { data, children } = $props();

	async function logout() {
		await fetch('/api/auth/logout', { method: 'DELETE' });
		window.location.href = '/login';
	}
</script>

<div class="admin-layout">
	<header class="admin-header">
		<div class="header-inner">
			<div class="brand">
				<span class="badge">ADMIN</span>
				<span class="title">Tiket Travel</span>
			</div>
			<nav class="nav">
				<a href="/admin">Dashboard</a>
				<a href="/admin/kendaraan">Kendaraan</a>
				<a href="/admin/jadwal">Jadwal</a>
				<a href="/admin/keluhan">Keluhan</a>
				<button class="logout-btn" onclick={logout}>Keluar</button>
			</nav>
		</div>
	</header>

	<main class="admin-content">
		{#if children}
			{@render children()}
		{/if}
	</main>
</div>

<style>
	.admin-layout {
		min-height: 100vh;
		background-color: var(--bg);
	}
	.admin-header {
		background-color: var(--surface);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.header-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.75rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
	}
	.badge {
		font-size: 11px;
		background-color: var(--accent);
		color: #ffffff;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		letter-spacing: 0.05em;
	}
	.title {
		font-size: 16px;
		color: var(--text);
	}
	.nav {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}
	.nav a {
		color: var(--text-muted);
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
		transition: color var(--transition-fast);
	}
	.nav a:hover {
		color: var(--text);
	}
	.logout-btn {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-muted);
		padding: 0.35rem 0.75rem;
		border-radius: var(--radius);
		font-size: 13px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.logout-btn:hover {
		color: var(--danger);
		border-color: var(--danger);
	}
	.admin-content {
		max-width: 1200px;
		margin: 2rem auto;
		padding: 0 1.5rem;
	}
</style>
