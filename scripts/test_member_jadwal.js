import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:5173';

async function testMemberCariJadwal() {
	console.log('=== TEST MEMBER CARI JADWAL UI & API ===');

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

	// 2. Fetch /api/member/jadwal
	const jadwalRes = await fetch(`${BASE_URL}/api/member/jadwal`, {
		headers: { Cookie: cookie }
	});
	assert.strictEqual(jadwalRes.status, 200, 'GET /api/member/jadwal harus 200');
	const jadwalData = await jadwalRes.json();
	console.log(`[PASS] GET /api/member/jadwal sukses, total jadwal: ${jadwalData.data.length}`);
	assert.ok(Array.isArray(jadwalData.data), 'data harus berupa array');
	if (jadwalData.data.length > 0) {
		const first = jadwalData.data[0];
		assert.ok('sisa_kursi' in first, 'jadwal harus memiliki field sisa_kursi');
		assert.ok('kursi_terisi' in first, 'jadwal harus memiliki field kursi_terisi');
		console.log(`[INFO] Sample jadwal: ID ${first.id_jadwal}, ${first.nm_kota_asal} -> ${first.nm_kota_tujuan}, sisa kursi: ${first.sisa_kursi}`);
	}

	// 3. Fetch /member HTML
	const pageRes = await fetch(`${BASE_URL}/member`, {
		headers: { Cookie: cookie }
	});
	assert.strictEqual(pageRes.status, 200, 'Halaman /member harus 200');
	const html = await pageRes.text();
	assert.ok(html.includes('Lampung Travel'), 'HTML harus mengandung branding Lampung Travel');
	assert.ok(html.includes('Cari Perjalanan'), 'HTML harus mengandung Cari Perjalanan');
	assert.ok(html.includes('TERMINAL RAJABASA AKTIF'), 'HTML harus memuat status terminal');
	assert.ok(html.includes('Status Tol Bakauheni - Terbanggi'), 'HTML harus memuat status tol');
	assert.ok(html.includes('Antar-Jemput Alamat'), 'HTML harus memuat fitur antar-jemput');
	assert.ok(html.includes('Hubungi CS'), 'HTML harus memuat tombol Hubungi CS');
	console.log('[PASS] SSR Halaman /member berhasil me-render seluruh komponen Stitch');

	console.log('=== SEMUA TEST MEMBER CARI JADWAL BERHASIL 100%! ===');
}

testMemberCariJadwal().catch((err) => {
	console.error('[FATAL ERROR]', err);
	process.exit(1);
});
