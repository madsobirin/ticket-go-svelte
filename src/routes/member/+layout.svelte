<script>
	let { data } = $props();

	async function logout() {
		await fetch('/api/auth/logout', { method: 'DELETE' });
		window.location.href = '/login';
	}
</script>

<nav>
	<strong>Tiket Travel</strong>
	<a href="/member">Cari Jadwal</a>
	<a href="/member/pesanan">Pesanan Saya</a>
	<button onclick={logout}>Keluar</button>
</nav>

<slot />
