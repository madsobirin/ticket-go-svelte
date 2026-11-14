import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:5173';

async function testAdminDashboardUI() {
	console.log('=== TEST ADMIN OPERATIONAL DASHBOARD UI ===');

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

	// 3. Assert UI components matching Stitch mockup
	assert.ok(html.includes('Shift Pagi: 06:00 - 14:00 WIB'), 'Harus ada badge shift');
	assert.ok(html.includes('Terminal Rajabasa • Gate Sentral A1'), 'Harus ada gate terminal sentral');
	assert.ok(html.includes('Selamat Pagi'), 'Harus ada greeting selamat pagi');
	assert.ok(html.includes('Export Manifest'), 'Harus ada tombol Export Manifest');
	assert.ok(html.includes('Shift Aktif: Loket 1'), 'Harus ada status shift loket 1');
	assert.ok(html.includes('Input Tiket Loket (Walk-in)'), 'Harus ada tombol input walk-in');

	// 4. Assert 4 Bento Metrics Cards
	assert.ok(html.includes('Total Penumpang Hari Ini'), 'Harus ada Card Total Penumpang');
	assert.ok(html.includes('Menunggu Verifikasi'), 'Harus ada Card Menunggu Verifikasi');
	assert.ok(html.includes('Armada Aktif Tol'), 'Harus ada Card Armada Aktif Tol');
	assert.ok(html.includes('Pendapatan Bruto Hari Ini'), 'Harus ada Card Pendapatan Bruto');

	// 5. Assert Verification Queue & Table
	assert.ok(html.includes('Antrean Verifikasi Bukti Pembayaran'), 'Harus ada seksi antrean verifikasi');
	assert.ok(html.includes('Jadwal Keberangkatan Armada Terdekat'), 'Harus ada tabel armada terdekat');

	// 6. Assert Right Widgets
	assert.ok(html.includes('Meja Loket Fisik'), 'Harus ada widget Meja Loket Fisik');
	assert.ok(html.includes('Kondisi Lintasan Tol'), 'Harus ada widget Kondisi Lintasan Tol');
	assert.ok(html.includes('Tol Natar - Bakauheni'), 'Harus ada lintasan Tol Natar - Bakauheni');
	assert.ok(html.includes('Pintasan Cepat Admin'), 'Harus ada Pintasan Cepat Admin');

	console.log('[PASS] Semua elemen UI Dashboard Operasional Admin tervalidasi!');
}

testAdminDashboardUI().catch((err) => {
	console.error('[FAIL]', err);
	process.exit(1);
});
