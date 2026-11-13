<script>
	let { data } = $props();

	async function logout() {
		await fetch('/api/auth/logout', { method: 'DELETE' });
		window.location.href = '/login';
	}
</script>

<nav>
	<strong>Admin</strong>
	<a href="/admin">Dashboard</a>
	<a href="/admin/kendaraan">Kendaraan</a>
	<a href="/admin/jadwal">Jadwal</a>
	<a href="/admin/keluhan">Keluhan</a>
	<button onclick={logout}>Keluar</button>
</nav>

<slot />
