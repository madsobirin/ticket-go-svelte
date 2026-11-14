import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:5173';

async function testPilihKursiUI() {
	console.log('=== TEST MEMBER PILIH KURSI UI ===');

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

	// 2. Fetch /member/jadwal/8
	const pageRes = await fetch(`${BASE_URL}/member/jadwal/8`, {
		headers: { Cookie: cookie }
	});
	assert.strictEqual(pageRes.status, 200, 'GET /member/jadwal/8 harus status 200');
	const html = await pageRes.text();

	// 3. Verify elements
	assert.ok(html.includes('Pilih Posisi Kursi'), 'Harus ada judul Pilih Posisi Kursi');
	assert.ok(html.includes('Kaca Depan / Arah Jalan'), 'Harus ada banner Kaca Depan');
	assert.ok(html.includes('Area Kemudi'), 'Harus ada label Area Kemudi sopir');
	assert.ok(html.includes('Depan Kiri'), 'Harus ada kursi Depan Kiri');
	assert.ok(html.includes('Tengah Kanan'), 'Harus ada kursi Tengah Kanan');
	assert.ok(html.includes('Tengah Kiri'), 'Harus ada kursi Tengah Kiri');
	assert.ok(html.includes('Belakang Kanan'), 'Harus ada kursi Belakang Kanan');
	assert.ok(html.includes('Belakang Kiri'), 'Harus ada kursi Belakang Kiri');
	assert.ok(html.includes('Ringkasan Pemesanan'), 'Harus ada kartu Ringkasan Pemesanan');
	assert.ok(html.includes('Kebijakan Bagasi'), 'Harus ada Kebijakan Bagasi');
	assert.ok(html.includes('Pesan Sekarang'), 'Harus ada tombol Pesan Sekarang');
	assert.ok(html.includes('Pembayaran dapat ditransfer setelah kursi terkonfirmasi'), 'Harus ada notice keamanan');

	console.log('[PASS] SSR Halaman /member/jadwal/8 sukses me-render seluruh komponen Stitch');
	console.log('=== TEST PILIH KURSI SUKSES 100%! ===');
}

testPilihKursiUI().catch((err) => {
	console.error('[FATAL ERROR]', err);
	process.exit(1);
});
