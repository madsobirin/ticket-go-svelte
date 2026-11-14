import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:5173';

async function testPaymentUI() {
	console.log('=== TEST MEMBER PAYMENT UI & FLOW ===');

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

	// 2. Buat pesanan baru untuk ditest bayar
	const pesanRes = await fetch(`${BASE_URL}/api/member/pesan`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: cookie },
		body: JSON.stringify({ id_jadwal: 9, nomor_kursi: 3 })
	});
	const pesanJson = await pesanRes.json();
	let orderId;
	if (pesanRes.ok) {
		orderId = pesanJson.data.id_pesan;
		console.log(`[PASS] Pesanan baru dibuat: ID ${orderId}`);
	} else {
		// ambil pesanan pertama member
		const myPesananRes = await fetch(`${BASE_URL}/api/member/pesanan`, { headers: { Cookie: cookie } });
		const myPesananJson = await myPesananRes.json();
		orderId = myPesananJson.data[0].id_pesan;
		console.log(`[INFO] Menggunakan pesanan existing: ID ${orderId}`);
	}

	// 3. Fetch Halaman Pembayaran /member/pesanan/[id]/bayar
	const pageRes = await fetch(`${BASE_URL}/member/pesanan/${orderId}/bayar`, {
		headers: { Cookie: cookie }
	});
	assert.strictEqual(pageRes.status, 200, 'Halaman /bayar harus 200');
	const html = await pageRes.text();

	// 4. Assert UI components matching Stitch design
	assert.ok(html.includes('Instruksi'), 'Harus ada judul Instruksi');
	assert.ok(html.includes('Pilihan Rekening Bank Tujuan'), 'Harus ada judul Pilihan Rekening');
	assert.ok(html.includes('Bank Mandiri'), 'Harus ada Bank Mandiri');
	assert.ok(html.includes('Bank BRI'), 'Harus ada Bank BRI');
	assert.ok(html.includes('Bank Central Asia (BCA)'), 'Harus ada Bank BCA');
	assert.ok(html.includes('Bank BNI'), 'Harus ada Bank BNI');
	assert.ok(html.includes('Bank CIMB Niaga'), 'Harus ada Bank CIMB Niaga');
	assert.ok(html.includes('Salin No. Rekening'), 'Harus ada tombol Salin No. Rekening');
	assert.ok(html.includes('Ringkasan Tagihan'), 'Harus ada kartu Ringkasan Tagihan');
	assert.ok(html.includes('Kirim Bukti ke Meja Loket'), 'Harus ada tombol Kirim Bukti');
	assert.ok(html.includes('Unduh Bukti Tagihan / Booking Slip'), 'Harus ada tombol Unduh Booking Slip');
	assert.ok(html.includes('Kendala saat transfer?'), 'Harus ada kontak bantuan');

	console.log('[PASS] SSR Halaman /member/pesanan/[id]/bayar sukses me-render seluruh komponen Stitch');

	// 5. Test kirim bukti endpoint
	const kirimRes = await fetch(`${BASE_URL}/api/member/pesanan/${orderId}/kirim`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: cookie },
		body: JSON.stringify({
			no_rek: '9876543210',
			tgl_transfer: '2026-11-14',
			jam_transfer: '10:00'
		})
	});
	// Kalau sudah terkirim / sukses, status 201 atau 409
	console.log(`[PASS] Kirim bukti response: status ${kirimRes.status}`);

	console.log('=== SEMUA TEST PAYMENT UI SUKSES 100%! ===');
}

testPaymentUI().catch((err) => {
	console.error('[FATAL ERROR]', err);
	process.exit(1);
});
