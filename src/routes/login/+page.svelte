<script>
	import { page } from '$app/state';

	let identifier = $state('');
	let password = $state('');
	let errorMsg = $state('');
	let loading = $state(false);

	let successMsg = $derived(
		page.url.searchParams.get('registered') === '1'
			? 'Berhasil register, silakan login.'
			: ''
	);

	async function handleSubmit(e) {
		e.preventDefault();
		errorMsg = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ identifier, password })
			});

			const data = await res.json();

			if (!res.ok) {
				errorMsg = data?.error?.message ?? 'Login gagal';
				return;
			}

			// Redirect ke halaman sesuai role
			window.location.href = data.data.redirect;
		} catch {
			errorMsg = 'Terjadi kesalahan. Coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<main>
	<h1>Masuk</h1>

	{#if successMsg}
		<p class="success">{successMsg}</p>
	{/if}

	{#if errorMsg}
		<p class="error">{errorMsg}</p>
	{/if}

	<form onsubmit={handleSubmit}>
		<label>
			Email / Username
			<input type="text" bind:value={identifier} required autocomplete="username" />
		</label>

		<label>
			Password
			<input type="password" bind:value={password} required autocomplete="current-password" />
		</label>

		<button type="submit" disabled={loading}>
			{loading ? 'Memproses...' : 'Masuk'}
		</button>
	</form>

	<p>Belum punya akun? <a href="/register">Daftar di sini</a></p>
</main>

<style>
	main {
		max-width: 400px;
		margin: 4rem auto;
		padding: 2rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}
	input {
		padding: 0.5rem;
		font-size: 1rem;
	}
	button {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		cursor: pointer;
	}
	.error {
		color: #c00;
		background: #fee;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}
	.success {
		color: #080;
		background: #eafaf1;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}
</style>
