<script>
	let { data, children } = $props();

	async function logout() {
		await fetch('/api/auth/logout', { method: 'DELETE' });
		window.location.href = '/login';
	}
</script>

<div class="member-layout">
	<header class="member-header">
		<div class="header-inner">
			<div class="brand">
				<a href="/member" class="logo-link">
					<span class="logo-dot"></span>
					<span class="title">Travel Lampung</span>
				</a>
			</div>
			<nav class="nav">
				<a href="/member">Cari Jadwal</a>
				<a href="/member/pesanan">Pesanan Saya</a>
				<button class="logout-btn" onclick={logout}>Keluar</button>
			</nav>
		</div>
	</header>

	<main class="member-content">
		{#if children}
			{@render children()}
		{/if}
	</main>
</div>

<style>
	.member-layout {
		min-height: 100vh;
		background-color: var(--bg);
	}
	.member-header {
		background-color: var(--surface);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.header-inner {
		max-width: 960px;
		margin: 0 auto;
		padding: 0.75rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.logo-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--text);
		font-weight: 600;
	}
	.logo-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--accent);
	}
	.title {
		font-size: 16px;
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
	.member-content {
		max-width: 960px;
		margin: 2rem auto;
		padding: 0 1.5rem;
	}
</style>
