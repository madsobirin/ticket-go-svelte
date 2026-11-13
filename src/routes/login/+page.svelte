<script>
	import { page } from '$app/state';

	let identifier = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let errorMsg = $state('');
	let loading = $state(false);

	let successMsg = $derived(
		page.url.searchParams.get('registered') === '1'
			? 'Berhasil mendaftar akun! Silakan masuk dengan akun baru Anda.'
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
				errorMsg = data?.error?.message ?? 'Email/Username atau kata sandi tidak valid';
				return;
			}

			// Redirect ke halaman sesuai role (member, operator, atau admin)
			window.location.href = data.data.redirect;
		} catch {
			errorMsg = 'Terjadi kesalahan koneksi. Silakan coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="page-wrapper">
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

		<!-- Main Login Area -->
		<main class="main-content">
			<div class="login-card">
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
				<h1 class="card-title">Masuk</h1>
				<p class="card-subtitle">Masuk untuk melanjutkan pemesanan</p>

				{#if successMsg}
					<div class="alert-success" role="status">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="16"
							height="16"
						>
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
							<polyline points="22 4 12 14.01 9 11.01" />
						</svg>
						<span>{successMsg}</span>
					</div>
				{/if}

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

				<!-- Login Form -->
				<form onsubmit={handleSubmit} class="form-container">
					<!-- Identifier (Email atau Username) -->
					<div class="field-group">
						<label for="identifier" class="field-label">Email atau Username</label>
						<div class="input-wrapper">
							<input
								id="identifier"
								type="text"
								class="input-pill"
								placeholder="Masukkan email atau username"
								bind:value={identifier}
								required
								autocomplete="username"
								disabled={loading}
							/>
						</div>
					</div>

					<!-- Password -->
					<div class="field-group">
						<div class="label-row">
							<label for="password" class="field-label">Password</label>
							<a
								href="#lupa-sandi"
								onclick={(e) => {
									e.preventDefault();
									alert('Silakan hubungi operator loket untuk bantuan pemulihan akun.');
								}}
								class="link-forgot"
							>
								Lupa sandi?
							</a>
						</div>
						<div class="input-wrapper">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								class="input-pill input-password"
								placeholder="Masukkan password"
								bind:value={password}
								required
								autocomplete="current-password"
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
								<span>Memproses...</span>
							{:else}
								<span>Masuk</span>
								<span class="arrow">&rarr;</span>
							{/if}
						</button>
					</div>
				</form>

				<!-- Switch to Register -->
				<div class="card-footer-switch">
					<span>Belum punya akun?</span>
					<a href="/register" class="link-register">Daftar</a>
				</div>
			</div>
		</main>
	</div>
</div>

<style>
	/* Full clean white canvas outer */
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
		padding: 1.5rem 2rem;
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
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem 3.5rem 1rem;
		background-color: #ffffff;
	}

	/* Centered Card */
	.login-card {
		width: 100%;
		max-width: 440px;
		background-color: #ffffff;
		border-radius: 1.75rem;
		padding: 2.25rem 2.25rem 1.75rem 2.25rem;
		border: 1px solid #eef2f6;
		box-shadow:
			0 10px 30px -5px rgba(0, 0, 0, 0.05),
			0 0 1px 1px rgba(0, 0, 0, 0.03);
		box-sizing: border-box;
	}

	/* Card Brand Header */
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

	/* Alerts */
	.alert-success {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: #f0fdf4;
		color: #166534;
		border: 1px solid #bbf7d0;
		border-radius: 0.75rem;
		padding: 0.65rem 0.85rem;
		font-size: 13px;
		margin-bottom: 1.25rem;
	}

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
		gap: 1.15rem;
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

	.link-forgot {
		font-size: 12px;
		font-weight: 600;
		color: #4f46e5;
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.link-forgot:hover {
		color: #3730a3;
		text-decoration: underline;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-pill {
		width: 100%;
		background-color: #f1f4f9;
		border: 1px solid transparent;
		border-radius: 12px;
		padding: 0.75rem 1rem;
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

	.link-register {
		font-weight: 700;
		color: #0f172a;
		text-decoration: none;
	}

	.link-register:hover {
		text-decoration: underline;
	}

	/* Meta Transit Badge under card */
	.sub-transit-meta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2rem;
		font-family: monospace;
		font-size: 11px;
		font-weight: 600;
		color: #64748b;
		letter-spacing: 1px;
	}

	.meta-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: #22c55e;
		display: inline-block;
	}

	/* Bottom Footer */
	.bottom-footer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 2rem;
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
