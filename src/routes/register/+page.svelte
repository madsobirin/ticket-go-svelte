<script>
	let nama = $state('');
	let alamat = $state('');
	let telepon = $state('');
	let jen_kelamin = $state('L');
	let username = $state('');
	let password = $state('');
	let errorMsg = $state('');
	let loading = $state(false);

	async function handleSubmit(e) {
		e.preventDefault();
		errorMsg = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nama, alamat, telepon, jen_kelamin, username, password })
			});

			const data = await res.json();

			if (!res.ok) {
				errorMsg = data?.error?.message ?? 'Pendaftaran gagal';
				return;
			}

			// Langsung redirect ke halaman member (sudah login)
			window.location.href = data.data.redirect;
		} catch {
			errorMsg = 'Terjadi kesalahan. Coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<main>
	<h1>Daftar Akun</h1>

	<form onsubmit={handleSubmit}>
		{#if errorMsg}
			<p class="error">{errorMsg}</p>
		{/if}

		<label>
			Nama Lengkap
			<input type="text" bind:value={nama} required maxlength="100" />
		</label>

		<label>
			Alamat
			<input type="text" bind:value={alamat} required maxlength="100" />
		</label>

		<label>
			Nomor Telepon
			<input type="tel" bind:value={telepon} required maxlength="20" />
		</label>

		<fieldset>
			<legend>Jenis Kelamin</legend>
			<label><input type="radio" bind:group={jen_kelamin} value="L" /> Laki-laki</label>
			<label><input type="radio" bind:group={jen_kelamin} value="P" /> Perempuan</label>
		</fieldset>

		<label>
			Username
			<input type="text" bind:value={username} required maxlength="20" autocomplete="username" />
		</label>

		<label>
			Password
			<input type="password" bind:value={password} required minlength="6" autocomplete="new-password" />
		</label>

		<button type="submit" disabled={loading}>
			{loading ? 'Memproses...' : 'Daftar'}
		</button>
	</form>

	<p>Sudah punya akun? <a href="/login">Masuk di sini</a></p>
</main>

<style>
	main {
		max-width: 440px;
		margin: 3rem auto;
		padding: 2rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}
	fieldset {
		margin-bottom: 1rem;
		border: 1px solid #ccc;
		padding: 0.5rem 1rem;
	}
	fieldset label {
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
	}
	input[type='text'],
	input[type='tel'],
	input[type='password'] {
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
		margin-bottom: 1rem;
	}
</style>
