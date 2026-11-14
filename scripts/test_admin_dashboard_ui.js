import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:5173';

async function testAdminDashboardUI() {
	console.log('=== TEST ADMIN OPERATIONAL DASHBOARD UI (STRICT USE CASE ALIGNMENT) ===');

	// 1. Login as Admin
	const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ identifier: 'test@team2travel.net', password: 'TheOne123@' })
	});
	assert.strictEqual(loginRes.status, 200, 'Admin login harus sukses');
	const rawCookie = loginRes.headers.get('set-cookie');
	assert.ok(rawCookie, 'Harus menerima session cookie');
	const cookie = rawCookie.split(';')[0];
	console.log('[PASS] Admin login sukses');

	// 2. Fetch /admin HTML
	const pageRes = await fetch(`${BASE_URL}/admin`, {
		headers: { Cookie: cookie }
	});
	assert.strictEqual(pageRes.status, 200, 'GET /admin harus status 200');
	const html = await pageRes.text();

	// 3. Verifikasi 5 Use Case Bento Cards & Sections
	assert.ok(html.includes('Data Member'), 'Harus ada metrik Data Member (Use Case 1)');
	assert.ok(html.includes('Jadwal &amp; Rute') || html.includes('Jadwal & Rute'), 'Harus ada metrik Jadwal & Rute (Use Case 2)');
	assert.ok(html.includes('Kota Master'), 'Harus ada metrik Kota Asal & Tujuan (Use Case 3)');
	assert.ok(html.includes('Kendaraan'), 'Harus ada metrik Kendaraan Armada (Use Case 4)');
	assert.ok(html.includes('Keluhan Saran'), 'Harus ada metrik Keluhan Pelanggan (Use Case 5)');

	// 4. Verifikasi Navigasi Sidebar dan Pintasan 5 Use Case
	assert.ok(html.includes('/admin/member'), 'Harus ada link ke /admin/member');
	assert.ok(html.includes('/admin/jadwal'), 'Harus ada link ke /admin/jadwal');
	assert.ok(html.includes('/admin/kota'), 'Harus ada link ke /admin/kota');
	assert.ok(html.includes('/admin/kendaraan'), 'Harus ada link ke /admin/kendaraan');
	assert.ok(html.includes('/admin/keluhan'), 'Harus ada link ke /admin/keluhan');

	// 5. Verifikasi FITUR NON-ADMIN TELAH DIHAPUS
	assert.ok(!html.includes('Antrean Verifikasi Bukti Pembayaran'), 'Antrean verifikasi loket harus DIHAPUS dari admin');
	assert.ok(!html.includes('Meja Loket Fisik'), 'Widget meja loket fisik harus DIHAPUS dari admin');
	assert.ok(!html.includes('Input Tiket Loket (Walk-in)'), 'Tombol walk-in ticketing loket harus DIHAPUS dari admin');
	assert.ok(!html.includes('href="/operator"'), 'Link ke /operator di sidebar harus DIHAPUS dari admin');

	console.log('[PASS] Dashboard Admin bersih dan selaras 100% dengan 5 Use Case Admin!');
}

testAdminDashboardUI().catch((err) => {
	console.error('[FAIL]', err);
	process.exit(1);
});
