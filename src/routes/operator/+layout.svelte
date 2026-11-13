<script>
	let { data } = $props();

	async function logout() {
		await fetch('/api/auth/logout', { method: 'DELETE' });
		window.location.href = '/login';
	}
</script>

<nav>
	<strong>Operator Loket</strong>
	<a href="/operator">Pesanan</a>
	<button onclick={logout}>Keluar</button>
</nav>

<slot />
