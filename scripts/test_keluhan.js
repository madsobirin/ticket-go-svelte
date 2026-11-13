import mysql from 'mysql2/promise';

const BASE_URL = 'http://127.0.0.1:5173';

async function runTests() {
	console.log('=== START TESTING LANGKAH 9: FITUR KELUHAN ===');

	const db = await mysql.createConnection({
		host: '127.0.0.1',
		user: 'travel',
		password: 'travel123',
		database: 'db_tiket'
	});

	async function login(identifier, password) {
		const res = await fetch(`${BASE_URL}/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ identifier, password })
		});
		const cookieHeader = res.headers.get('set-cookie');
		const json = await res.json();
		if (!res.ok) {
			throw new Error(`Login failed for ${identifier}: ${JSON.stringify(json)}`);
		}
		const cookie = cookieHeader ? cookieHeader.split(';')[0] : '';
		return { cookie, role: json.data.role };
	}

	console.log('\n--- 1. Login Akun Member & Admin ---');
	const memberAuth = await login('buditest', 'budi123');
	console.log(`[PASS] Member login: role=${memberAuth.role}`);

	const adminAuth = await login('test@team2travel.net', 'TheOne123@');
	console.log(`[PASS] Admin login: role=${adminAuth.role}`);

	// Test 1: User belum login ditolak kirim keluhan
	console.log('\n--- 2. Guard: Pengguna belum login kirim keluhan ditolak ---');
	const unauthRes = await fetch(`${BASE_URL}/api/member/keluhan`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ j_keluhan: 'Armada', d_keluhan: 'AC kurang dingin' })
	});
	if (unauthRes.status === 401) {
		console.log('[PASS] POST /api/member/keluhan tanpa session -> 401 Unauthorized');
	} else {
		throw new Error(`Expected 401, got ${unauthRes.status}`);
	}

	// Test 2: Admin tidak bisa mengirim keluhan (role guard member)
	console.log('\n--- 3. Guard: Admin tidak bisa mengirim keluhan ---');
	const adminRes = await fetch(`${BASE_URL}/api/member/keluhan`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: adminAuth.cookie },
		body: JSON.stringify({ j_keluhan: 'Armada', d_keluhan: 'AC kurang dingin' })
	});
	if (adminRes.status === 403) {
		console.log('[PASS] POST /api/member/keluhan dengan cookie admin -> 403 Forbidden');
	} else {
		throw new Error(`Expected 403, got ${adminRes.status}`);
	}

	// Test 3: Member mengirim keluhan
	console.log('\n--- 4. Member mengirim keluhan ---');
	const testJenis = 'AC Travel';
	const testDesc = `AC armada kurang dingin saat perjalanan siang hari (test-${Date.now()})`;

	const memberKeluhanRes = await fetch(`${BASE_URL}/api/member/keluhan`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: memberAuth.cookie },
		body: JSON.stringify({
			j_keluhan: testJenis,
			d_keluhan: testDesc
		})
	});
	const memberKeluhanData = await memberKeluhanRes.json();
	if (!memberKeluhanRes.ok) {
		throw new Error(`Member gagal kirim keluhan: ${JSON.stringify(memberKeluhanData)}`);
	}
	const idKeluhan = memberKeluhanData.data.id_keluhan;
	console.log(`[PASS] Keluhan tersimpan: ID ${idKeluhan}, Jenis: "${testJenis}"`);

	// Test 4: Admin melihat keluhan tersebut di GET /api/admin/keluhan dan /admin/keluhan
	console.log('\n--- 5. Admin mengambil keluhan dari API & Halaman /admin/keluhan ---');
	const adminListRes = await fetch(`${BASE_URL}/api/admin/keluhan`, {
		headers: { Cookie: adminAuth.cookie }
	});
	const adminListData = await adminListRes.json();
	if (!adminListRes.ok) {
		throw new Error(`Admin gagal ambil list keluhan: ${JSON.stringify(adminListData)}`);
	}
	const foundKeluhan = adminListData.data.find(k => k.id_keluhan === idKeluhan);
	if (!foundKeluhan) {
		throw new Error(`Keluhan ID ${idKeluhan} tidak ditemukan di daftar admin`);
	}
	console.log(`[PASS] Keluhan ID ${idKeluhan} ditemukan di admin list: "${foundKeluhan.d_keluhan}" dari member "${foundKeluhan.nama_member}"`);

	// Test 5: Verifikasi SSR halaman /admin/keluhan dan /member/keluhan
	console.log('\n--- 6. SSR Halaman /admin/keluhan & /member/keluhan ---');
	const adminPageRes = await fetch(`${BASE_URL}/admin/keluhan`, {
		headers: { Cookie: adminAuth.cookie }
	});
	const adminPageHtml = await adminPageRes.text();
	if (adminPageRes.status === 200 && adminPageHtml.includes(testDesc)) {
		console.log('[PASS] Halaman /admin/keluhan menampilkan keluhan member secara utuh');
	} else {
		throw new Error(`Halaman /admin/keluhan gagal me-render teks keluhan (status: ${adminPageRes.status})`);
	}

	const memberPageRes = await fetch(`${BASE_URL}/member/keluhan`, {
		headers: { Cookie: memberAuth.cookie }
	});
	const memberPageHtml = await memberPageRes.text();
	if (memberPageRes.status === 200 && memberPageHtml.includes(testDesc)) {
		console.log('[PASS] Halaman /member/keluhan menampilkan riwayat keluhan member');
	} else {
		throw new Error(`Halaman /member/keluhan gagal me-render teks riwayat (status: ${memberPageRes.status})`);
	}

	await db.end();
	console.log('\n=== SEMUA PENGUJIAN LANGKAH 9 BERHASIL 100%! ===');
}

runTests().catch(err => {
	console.error('\n[FATAL TEST ERROR]', err);
	process.exit(1);
});
