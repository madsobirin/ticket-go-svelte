import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:5173';

async function testPesananSayaUI() {
	console.log('=== TEST PESANAN SAYA UI & API ===');

	// 1. Login as Member
	const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ identifier: 'buditest', password: 'budi123' })
	});
	assert.strictEqual(loginRes.status, 200, 'Member login harus sukses');
	const rawCookie = loginRes.headers.get('set-cookie');
	const cookie = rawCookie.split(';')[0];
	console.log('[PASS] Member login sukses');

	// 2. Fetch /api/member/pesanan
	const apiRes = await fetch(`${BASE_URL}/api/member/pesanan`, {
		headers: { Cookie: cookie }
	});
	assert.strictEqual(apiRes.status, 200, 'GET /api/member/pesanan harus status 200');
	const apiJson = await apiRes.json();
	console.log(`[PASS] Total pesanan member: ${apiJson.data.length}`);
	assert.ok(Array.isArray(apiJson.data), 'Data pesanan harus berupa array');

	// 3. Fetch /member/pesanan HTML
	const pageRes = await fetch(`${BASE_URL}/member/pesanan`, {
		headers: { Cookie: cookie }
	});
	assert.strictEqual(pageRes.status, 200, 'GET /member/pesanan harus status 200');
	const html = await pageRes.text();

	// 4. Assert UI components matching Stitch mockup
	assert.ok(html.includes('Pesanan Saya'), 'Harus ada judul Pesanan Saya');
	assert.ok(html.includes('0811-7200-999'), 'Harus ada banner kontak loket');
	assert.ok(html.includes('Cari kode booking'), 'Harus ada kolom pencarian');
	assert.ok(html.includes('Semua Pesanan'), 'Harus ada tab filter Semua Pesanan');
	assert.ok(html.includes('Status Member'), 'Harus ada widget Status Member');
	assert.ok(html.includes('Tier Reguler'), 'Harus ada Tier Reguler');
	assert.ok(html.includes('Tol Natar - Terpeka Lancar'), 'Harus ada live tracker tol');
	assert.ok(html.includes('Kendala Perjalanan atau Reschedule?'), 'Harus ada widget kendala perjalanan');
	assert.ok(html.includes('WhatsApp Loket'), 'Harus ada tombol WhatsApp Loket');

	console.log('[PASS] SSR Halaman /member/pesanan berhasil me-render seluruh komponen Stitch');
	console.log('=== TEST PESANAN SAYA UI SUKSES 100%! ===');
}

testPesananSayaUI().catch((err) => {
	console.error('[FATAL ERROR]', err);
	process.exit(1);
});
