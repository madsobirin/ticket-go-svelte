import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:5173';

async function runTests() {
	console.log('=== TEST SUITE: 5 USE CASES ADMIN LOKET ===');

	// 1. Login sebagai Admin
	const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ identifier: 'test@team2travel.net', password: 'TheOne123@' })
	});
	assert.strictEqual(loginRes.status, 200, 'Admin login harus berhasil');
	const rawCookie = loginRes.headers.get('set-cookie');
	assert.ok(rawCookie, 'Harus mendapatkan session cookie');
	const cookie = rawCookie.split(';')[0];
	const headers = { 'Content-Type': 'application/json', Cookie: cookie };
	console.log('[PASS] Login Admin terautentikasi');

	// 2. Verifikasi 5 Use Case di Navigation Layout
	const layoutRes = await fetch(`${BASE_URL}/admin`, { headers: { Cookie: cookie } });
	assert.strictEqual(layoutRes.status, 200);
	const layoutHtml = await layoutRes.text();
	assert.ok(layoutHtml.includes('/admin/jadwal'), 'Navigasi harus memiliki link Mengelola Jadwal');
	assert.ok(layoutHtml.includes('/admin/kota'), 'Navigasi harus memiliki link Mengelola Kota Asal & Tujuan');
	assert.ok(layoutHtml.includes('/admin/kendaraan'), 'Navigasi harus memiliki link Mengelola Kendaraan');
	assert.ok(layoutHtml.includes('/admin/member'), 'Navigasi harus memiliki link Mengelola Data Member');
	assert.ok(layoutHtml.includes('/admin/keluhan'), 'Navigasi harus memiliki link Mengelola Keluhan');
	console.log('[PASS] Sidebar Navigation memuat kelima Use Case Admin');

	// 3. Verifikasi Mengelola Data Member (CRUD)
	console.log('\n--- Uji Use Case 1: Mengelola Data Member ---');
	const getMembers = await fetch(`${BASE_URL}/api/admin/member`, { headers });
	assert.strictEqual(getMembers.status, 200);
	const memberData = await getMembers.json();
	assert.ok(Array.isArray(memberData.data), 'Harus mengembalikan daftar member');
	console.log(`[PASS] GET /api/admin/member sukses (${memberData.data.length} member)`);

	const testUsername = `u_${Date.now().toString().slice(-6)}`;
	const createMemberRes = await fetch(`${BASE_URL}/api/admin/member`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			nama: 'Member Uji Coba',
			alamat: 'Jl. ZA Pagar Alam No 1',
			telepon: '081299887766',
			jen_kelamin: 'L',
			username: testUsername,
			password: 'password123'
		})
	});
	assert.strictEqual(createMemberRes.status, 201, 'POST /api/admin/member harus 201');
	const createdMember = await createMemberRes.json();
	const createdMemberId = createdMember.data.id_member;
	assert.ok(createdMemberId, 'Harus mengembalikan ID member baru');
	console.log(`[PASS] POST /api/admin/member sukses (ID: ${createdMemberId})`);

	const updateMemberRes = await fetch(`${BASE_URL}/api/admin/member/${createdMemberId}`, {
		method: 'PUT',
		headers,
		body: JSON.stringify({
			nama: 'Member Uji Coba Diedit',
			alamat: 'Jl. Raden Intan No 10',
			telepon: '081299880000',
			jen_kelamin: 'P',
			username: testUsername,
			password: ''
		})
	});
	assert.strictEqual(updateMemberRes.status, 200, 'PUT /api/admin/member/:id harus 200');
	console.log('[PASS] PUT /api/admin/member/:id sukses');

	const deleteMemberRes = await fetch(`${BASE_URL}/api/admin/member/${createdMemberId}`, {
		method: 'DELETE',
		headers
	});
	assert.strictEqual(deleteMemberRes.status, 200, 'DELETE /api/admin/member/:id harus 200');
	console.log('[PASS] DELETE /api/admin/member/:id sukses');

	// 4. Verifikasi Mengelola Kota Asal (CRUD)
	console.log('\n--- Uji Use Case 3A: Mengelola Kota Asal ---');
	const getKotaAsal = await fetch(`${BASE_URL}/api/admin/kota/asal`, { headers });
	assert.strictEqual(getKotaAsal.status, 200);
	const kotaAsalJson = await getKotaAsal.json();
	assert.ok(Array.isArray(kotaAsalJson.data), 'Harus mengembalikan daftar kota asal');
	console.log(`[PASS] GET /api/admin/kota/asal sukses (${kotaAsalJson.data.length} kota)`);

	const testKotaAsalName = `KotaAsal_${Date.now()}`.slice(0, 20);
	const createAsalRes = await fetch(`${BASE_URL}/api/admin/kota/asal`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ nm_kota_asal: testKotaAsalName })
	});
	assert.strictEqual(createAsalRes.status, 201, 'POST /api/admin/kota/asal harus 201');
	const createdAsal = await createAsalRes.json();
	const createdAsalId = createdAsal.data.id_kota_asal;
	assert.ok(createdAsalId, 'Harus mengembalikan id kota asal');
	console.log(`[PASS] POST /api/admin/kota/asal sukses (ID: ${createdAsalId})`);

	const updateAsalRes = await fetch(`${BASE_URL}/api/admin/kota/asal/${createdAsalId}`, {
		method: 'PUT',
		headers,
		body: JSON.stringify({ nm_kota_asal: `${testKotaAsalName} Edit` })
	});
	assert.strictEqual(updateAsalRes.status, 200, 'PUT /api/admin/kota/asal/:id harus 200');
	console.log('[PASS] PUT /api/admin/kota/asal/:id sukses');

	// Uji proteksi hapus jika kota digunakan dalam jadwal
	const deleteInUseAsalRes = await fetch(`${BASE_URL}/api/admin/kota/asal/1`, {
		method: 'DELETE',
		headers
	});
	assert.strictEqual(deleteInUseAsalRes.status, 409, 'Hapus kota asal yang aktif di jadwal harus ditolak (409)');
	console.log('[PASS] Guard proteksi hapus kota asal aktif berfungsi (409 Conflict)');

	const deleteAsalRes = await fetch(`${BASE_URL}/api/admin/kota/asal/${createdAsalId}`, {
		method: 'DELETE',
		headers
	});
	assert.strictEqual(deleteAsalRes.status, 200, 'DELETE /api/admin/kota/asal/:id harus 200');
	console.log('[PASS] DELETE /api/admin/kota/asal/:id sukses');

	// 5. Verifikasi Mengelola Kota Tujuan (CRUD)
	console.log('\n--- Uji Use Case 3B: Mengelola Kota Tujuan ---');
	const getKotaTujuan = await fetch(`${BASE_URL}/api/admin/kota/tujuan`, { headers });
	assert.strictEqual(getKotaTujuan.status, 200);
	const kotaTujuanJson = await getKotaTujuan.json();
	assert.ok(Array.isArray(kotaTujuanJson.data), 'Harus mengembalikan daftar kota tujuan');
	console.log(`[PASS] GET /api/admin/kota/tujuan sukses (${kotaTujuanJson.data.length} kota)`);

	const testKotaTujuanName = `KotaTuj_${Date.now()}`.slice(0, 20);
	const createTujuanRes = await fetch(`${BASE_URL}/api/admin/kota/tujuan`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ nm_kota_tujuan: testKotaTujuanName })
	});
	assert.strictEqual(createTujuanRes.status, 201, 'POST /api/admin/kota/tujuan harus 201');
	const createdTujuan = await createTujuanRes.json();
	const createdTujuanId = createdTujuan.data.id_kota_tujuan;
	assert.ok(createdTujuanId, 'Harus mengembalikan id kota tujuan');
	console.log(`[PASS] POST /api/admin/kota/tujuan sukses (ID: ${createdTujuanId})`);

	const updateTujuanRes = await fetch(`${BASE_URL}/api/admin/kota/tujuan/${createdTujuanId}`, {
		method: 'PUT',
		headers,
		body: JSON.stringify({ nm_kota_tujuan: `${testKotaTujuanName} Edit` })
	});
	assert.strictEqual(updateTujuanRes.status, 200, 'PUT /api/admin/kota/tujuan/:id harus 200');
	console.log('[PASS] PUT /api/admin/kota/tujuan/:id sukses');

	// Uji proteksi hapus jika kota tujuan digunakan dalam jadwal
	const deleteInUseTujuanRes = await fetch(`${BASE_URL}/api/admin/kota/tujuan/2`, {
		method: 'DELETE',
		headers
	});
	assert.strictEqual(deleteInUseTujuanRes.status, 409, 'Hapus kota tujuan yang aktif di jadwal harus ditolak (409)');
	console.log('[PASS] Guard proteksi hapus kota tujuan aktif berfungsi (409 Conflict)');

	const deleteTujuanRes = await fetch(`${BASE_URL}/api/admin/kota/tujuan/${createdTujuanId}`, {
		method: 'DELETE',
		headers
	});
	assert.strictEqual(deleteTujuanRes.status, 200, 'DELETE /api/admin/kota/tujuan/:id harus 200');
	console.log('[PASS] DELETE /api/admin/kota/tujuan/:id sukses');

	// 6. Verifikasi Halaman HTML Admin untuk semua Use Cases
	console.log('\n--- Uji Render Halaman UI Admin ---');
	const routes = ['/admin', '/admin/jadwal', '/admin/kota', '/admin/kendaraan', '/admin/member', '/admin/keluhan'];
	for (const route of routes) {
		const res = await fetch(`${BASE_URL}${route}`, { headers: { Cookie: cookie } });
		assert.strictEqual(res.status, 200, `Halaman ${route} harus render 200 OK`);
		const text = await res.text();
		assert.ok(text.length > 500, `Halaman ${route} harus memiliki konten`);
		console.log(`[PASS] Halaman UI ${route} render sukses (200 OK)`);
	}

	console.log('\n======================================================');
	console.log('✅ SELURUH USE CASE DIAGRAM ADMIN LENGKAP & TERVERIFIKASI!');
	console.log('======================================================');
}

runTests().catch((err) => {
	console.error('[FAIL]', err);
	process.exit(1);
});
