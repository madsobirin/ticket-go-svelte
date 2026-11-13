<script>
	let nama = $state('');
	let alamat = $state('');
	let telepon = $state('');
	let jen_kelamin = $state('L');
	let username = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let errorMsg = $state('');
	let usernameError = $state('');
	let loading = $state(false);

	async function handleSubmit(e) {
		e.preventDefault();
		errorMsg = '';
		usernameError = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nama, alamat, telepon, jen_kelamin, username, password })
			});

			const data = await res.json();

			if (!res.ok) {
				if (data?.error?.code === 'USERNAME_TAKEN') {
					usernameError = data.error.message || 'Username sudah digunakan, coba variasi lain';
				} else {
					errorMsg = data?.error?.message ?? 'Pendaftaran gagal';
				}
				return;
			}

			// Berhasil, arahkan ke login dengan notifikasi sukses
			window.location.href = data.data.redirect || '/login?registered=1';
		} catch {
			errorMsg = 'Terjadi kesalahan koneksi. Coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="page-wrapper">
	<!-- Canvas Card Container -->
	<div class="canvas-container">
		<!-- Top Navigation Header -->
		<header class="top-nav">
			<div class="brand-left">
				<div class="brand-icon">
					<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
						<path
							d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"
						/>
					</svg>
				</div>
				<span class="brand-name">Ticket Go</span>
			</div>
		</header>

		<!-- Main Card Content -->
		<main class="main-content">
			<div class="register-card">
				<!-- Card Top Brand Badge -->
				<div class="card-brand-header">
					<div class="card-brand-left">
						<div class="mini-logo">
							<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
								<path
									d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"
								/>
							</svg>
						</div>
						<span class="card-brand-text">Ticket Go</span>
						<span class="dot-indicator"></span>
					</div>
				</div>

				<!-- Headings -->
				<h1 class="card-title">Buat Akun</h1>
				<p class="card-subtitle">Untuk memesan tiket perjalanan</p>

				{#if errorMsg}
					<div class="alert-error" role="alert">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="16"
							height="16"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
						<span>{errorMsg}</span>
					</div>
				{/if}

				<!-- Register Form -->
				<form onsubmit={handleSubmit} class="form-container">
					<!-- 1. Nama Lengkap -->
					<div class="field-group">
						<label for="nama" class="field-label">Nama Lengkap</label>
						<div class="input-wrapper">
							<span class="input-icon">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									width="18"
									height="18"
								>
									<rect x="3" y="4" width="18" height="16" rx="2" />
									<circle cx="9" cy="10" r="2" />
									<line x1="15" y1="8" x2="17" y2="8" />
									<line x1="15" y1="12" x2="17" y2="12" />
									<line x1="7" y1="16" x2="17" y2="16" />
								</svg>
							</span>
							<input
								id="nama"
								type="text"
								class="input-pill"
								placeholder="Nama lengkap sesuai KTP"
								bind:value={nama}
								required
								maxlength="100"
								disabled={loading}
							/>
						</div>
					</div>

					<!-- 2. Alamat -->
					<div class="field-group">
						<label for="alamat" class="field-label">Alamat</label>
						<div class="input-wrapper">
							<span class="input-icon">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									width="18"
									height="18"
								>
									<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
									<circle cx="12" cy="10" r="3" />
								</svg>
							</span>
							<input
								id="alamat"
								type="text"
								class="input-pill"
								placeholder="Alamat domisili di Lampung / kota asal"
								bind:value={alamat}
								required
								maxlength="100"
								disabled={loading}
							/>
						</div>
					</div>

					<!-- 3. Nomor Telepon -->
					<div class="field-group">
						<div class="label-row">
							<label for="telepon" class="field-label">Nomor Telepon</label>
							<span class="hint-badge">WhatsApp aktif</span>
						</div>
						<div class="input-wrapper">
							<span class="input-icon">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									width="18"
									height="18"
								>
									<path
										d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
									/>
								</svg>
							</span>
							<input
								id="telepon"
								type="tel"
								class="input-pill"
								placeholder="08xxxxxxxxxx"
								bind:value={telepon}
								required
								maxlength="20"
								disabled={loading}
							/>
						</div>
					</div>

					<!-- 4. Jenis Kelamin (Segmented Pill) -->
					<div class="field-group">
						<label class="field-label" for="jk-label" id="jk-label">Jenis Kelamin</label>
						<div class="segmented-control" role="radiogroup" aria-labelledby="jk-label">
							<button
								type="button"
								class="segment-btn"
								class:active={jen_kelamin === 'L'}
								onclick={() => (jen_kelamin = 'L')}
								disabled={loading}
								aria-checked={jen_kelamin === 'L'}
								role="radio"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.2"
									width="16"
									height="16"
								>
									<circle cx="10" cy="14" r="5" />
									<path d="M19 5l-5.4 5.4" />
									<path d="M19 5h-5" />
									<path d="M19 5v5" />
								</svg>
								<span>Laki-laki</span>
							</button>

							<button
								type="button"
								class="segment-btn"
								class:active={jen_kelamin === 'P'}
								onclick={() => (jen_kelamin = 'P')}
								disabled={loading}
								aria-checked={jen_kelamin === 'P'}
								role="radio"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.2"
									width="16"
									height="16"
								>
									<circle cx="12" cy="9" r="5" />
									<path d="M12 14v7" />
									<path d="M9 18h6" />
								</svg>
								<span>Perempuan</span>
							</button>
						</div>
					</div>

					<!-- 5. Username -->
					<div class="field-group">
						<label for="username" class="field-label">Username</label>
						<div class="input-wrapper">
							<span class="input-icon">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									width="18"
									height="18"
								>
									<circle cx="12" cy="12" r="4" />
									<path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
								</svg>
							</span>
							<input
								id="username"
								type="text"
								class="input-pill"
								class:input-has-error={usernameError}
								placeholder="lampung_user"
								bind:value={username}
								oninput={() => (usernameError = '')}
								required
								maxlength="20"
								autocomplete="username"
								disabled={loading}
							/>
						</div>
						{#if usernameError}
							<div class="field-error">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									width="14"
									height="14"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="12" y1="8" x2="12" y2="12" />
									<line x1="12" y1="16" x2="12.01" y2="16" />
								</svg>
								<span>{usernameError}</span>
							</div>
						{/if}
					</div>

					<!-- 6. Password -->
					<div class="field-group">
						<label for="password" class="field-label">Password</label>
						<div class="input-wrapper">
							<span class="input-icon">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									width="18"
									height="18"
								>
									<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
									<path d="M7 11V7a5 5 0 0 1 10 0v4" />
								</svg>
							</span>
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								class="input-pill input-password"
								placeholder="Minimal 8 karakter"
								bind:value={password}
								required
								minlength="6"
								autocomplete="new-password"
								disabled={loading}
							/>
							<button
								type="button"
								class="password-toggle"
								onclick={() => (showPassword = !showPassword)}
								tabindex="-1"
								aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
							>
								{#if showPassword}
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										width="18"
										height="18"
									>
										<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
										<path
											d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
										/>
										<path
											d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
										/>
										<line x1="2" x2="22" y1="2" y2="22" />
									</svg>
								{:else}
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										width="18"
										height="18"
									>
										<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
								{/if}
							</button>
						</div>
					</div>

					<!-- Submit Button -->
					<div class="submit-wrapper">
						<button type="submit" class="btn-submit" disabled={loading}>
							{#if loading}
								<span class="spinner" aria-hidden="true"></span>
								<span>Mendaftarkan...</span>
							{:else}
								<span>Daftar</span>
								<span class="arrow">&rarr;</span>
							{/if}
						</button>
					</div>
				</form>

				<!-- Switch to Login -->
				<div class="card-footer-switch">
					<span>Sudah punya akun?</span>
					<a href="/login" class="link-login">Masuk</a>
				</div>
			</div>
		</main>
	</div>
</div>

<style>
	/* Background canvas outer */
	.page-wrapper {
		min-height: 100vh;
		background-color: #ffffff;
		display: flex;
		flex-direction: column;
		padding: 0;
		box-sizing: border-box;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}

	.canvas-container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		background-color: #ffffff;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	/* Top Nav */
	.top-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2.5rem;
		background-color: transparent;
	}

	.brand-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.brand-icon {
		width: 32px;
		height: 32px;
		background-color: #000000;
		color: #ffffff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.brand-name {
		font-size: 15px;
		font-weight: 700;
		color: #1a1a1a;
		letter-spacing: -0.2px;
	}

	.trust-badge {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 12px;
		font-weight: 600;
		color: #15803d;
	}

	/* Main Content Area */
	.main-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem 1rem 3rem 1rem;
	}

	/* Centered Card */
	.register-card {
		width: 100%;
		max-width: 480px;
		background-color: #ffffff;
		border-radius: 1.75rem;
		padding: 2.25rem 2.25rem 1.75rem 2.25rem;
		border: 1px solid #eef2f6;
		box-shadow:
			0 10px 30px -5px rgba(0, 0, 0, 0.06),
			0 0 1px 1px rgba(0, 0, 0, 0.03);
		box-sizing: border-box;
	}

	/* Card Brand Tag */
	.card-brand-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
	}

	.card-brand-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mini-logo {
		width: 24px;
		height: 24px;
		background-color: #000000;
		color: #ffffff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card-brand-text {
		font-size: 13px;
		font-weight: 700;
		color: #111827;
	}

	.dot-indicator {
		width: 6px;
		height: 6px;
		background-color: #7c3aed;
		border-radius: 50%;
		display: inline-block;
	}

	.version-badge {
		font-size: 11px;
		font-family: monospace;
		font-weight: 600;
		color: #6b7280;
		background-color: #f3f4f6;
		padding: 2px 8px;
		border-radius: 9999px;
		letter-spacing: 0.5px;
	}

	/* Headings */
	.card-title {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		color: #0f172a;
		letter-spacing: -0.5px;
	}

	.card-subtitle {
		margin: 0.25rem 0 1.5rem 0;
		font-size: 13.5px;
		color: #64748b;
	}

	/* Alert */
	.alert-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: #fef2f2;
		color: #991b1b;
		border: 1px solid #fecaca;
		border-radius: 0.75rem;
		padding: 0.65rem 0.85rem;
		font-size: 13px;
		margin-bottom: 1.25rem;
	}

	/* Form */
	.form-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.field-label {
		font-size: 13px;
		font-weight: 600;
		color: #1e293b;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.hint-badge {
		font-size: 11px;
		font-family: monospace;
		color: #475569;
		background-color: #f1f5f9;
		padding: 1px 6px;
		border-radius: 4px;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 14px;
		color: #64748b;
		display: flex;
		align-items: center;
		pointer-events: none;
	}

	.input-pill {
		width: 100%;
		background-color: #f1f4f9;
		border: 1px solid transparent;
		border-radius: 12px;
		padding: 0.75rem 1rem 0.75rem 2.6rem;
		font-size: 13.5px;
		color: #0f172a;
		font-family: inherit;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
		box-sizing: border-box;
	}

	.input-pill::placeholder {
		color: #94a3b8;
		font-size: 13px;
	}

	.input-pill:focus {
		outline: none;
		background-color: #ffffff;
		border-color: #0f172a;
		box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
	}

	.input-pill:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.input-has-error {
		background-color: #fef2f2 !important;
		border-color: #f87171 !important;
	}

	.field-error {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		color: #dc2626;
		font-size: 12px;
		margin-top: 0.25rem;
		font-weight: 500;
	}

	.input-password {
		padding-right: 2.8rem;
	}

	.password-toggle {
		position: absolute;
		right: 12px;
		background: none;
		border: none;
		color: #64748b;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}

	.password-toggle:hover {
		color: #0f172a;
	}

	/* Segmented Control for Gender */
	.segmented-control {
		display: flex;
		gap: 0.6rem;
		background-color: transparent;
	}

	.segment-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		border: 1px solid transparent;
		background-color: #f1f4f9;
		color: #334155;
		font-size: 13.5px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: inherit;
	}

	.segment-btn:hover:not(.active):not(:disabled) {
		background-color: #e2e8f0;
	}

	.segment-btn.active {
		background-color: #000000;
		color: #ffffff;
	}

	.segment-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Submit Button */
	.submit-wrapper {
		margin-top: 0.5rem;
	}

	.btn-submit {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background-color: #000000;
		color: #ffffff;
		border: none;
		border-radius: 14px;
		padding: 0.85rem 1.25rem;
		font-size: 14.5px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			transform 0.1s ease;
		font-family: inherit;
	}

	.btn-submit:hover:not(:disabled) {
		background-color: #262626;
	}

	.btn-submit:active:not(:disabled) {
		transform: scale(0.99);
	}

	.btn-submit:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.arrow {
		font-size: 16px;
		transition: transform 0.15s ease;
	}

	.btn-submit:hover .arrow {
		transform: translateX(3px);
	}

	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: #ffffff;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Switcher Link */
	.card-footer-switch {
		margin-top: 1.25rem;
		text-align: center;
		font-size: 13px;
		color: #475569;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
	}

	.link-login {
		font-weight: 700;
		color: #0f172a;
		text-decoration: none;
	}

	.link-login:hover {
		text-decoration: underline;
	}

	/* Trust Notice */
	.security-guarantee {
		margin-top: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		font-size: 11.5px;
		color: #64748b;
	}

	/* Bottom Footer */
	.bottom-footer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 2.5rem;
		font-size: 12px;
		color: #64748b;
		border-top: 1px solid #edf0f4;
	}

	@media (min-width: 768px) {
		.bottom-footer {
			flex-direction: row;
		}
	}

	.footer-links {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.footer-links a {
		color: #64748b;
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.footer-links a:hover {
		color: #0f172a;
	}
</style>
