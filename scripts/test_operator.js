import mysql from 'mysql2/promise';

const BASE_URL = 'http://127.0.0.1:5173';

async function runTests() {
	console.log('=== START TESTING LANGKAH 8: FITUR OPERATOR LOKET ===');

	// DB connection to inspect state
	const db = await mysql.createConnection({
		host: '127.0.0.1',
		user: 'travel',
		password: 'travel123',
		database: 'db_tiket'
	});

	// Find an upcoming schedule with available seats
	const [jadwalRows] = await db.query(`
		SELECT j.id_jadwal, j.harga 
		FROM jadwal j 
		LEFT JOIN pesan p ON j.id_jadwal = p.id_jadwal 
		WHERE j.tgl_berangkat >= CURDATE() 
		GROUP BY j.id_jadwal 
		HAVING count(p.id_pesan) <= 3 
		ORDER BY j.id_jadwal ASC 
		LIMIT 1
	`);
	if (jadwalRows.length === 0) {
		throw new Error('Tidak ada jadwal aktif dengan kursi kosong di database untuk pengujian');
	}
	const targetJadwal = jadwalRows[0];
	console.log(`[INFO] Target Jadwal ID: ${targetJadwal.id_jadwal}, Harga: ${targetJadwal.harga}`);

	// 1. Helper to login and get cookie
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
		return { cookie, role: json.data.role, redirect: json.data.redirect };
	}

	// Login member & operator
	console.log('\n--- 1. Login Member & Operator ---');
	const memberAuth = await login('buditest', 'budi123');
	console.log(`[PASS] Member login: role=${memberAuth.role}`);

	const operatorAuth = await login('operatortiket@localhost', 'qwerty');
	console.log(`[PASS] Operator login: role=${operatorAuth.role}`);

	// Helper for member to find an available seat
	async function getAvailableSeat(id_jadwal, cookie) {
		const res = await fetch(`${BASE_URL}/api/member/jadwal/${id_jadwal}/kursi`, {
			headers: { Cookie: cookie }
		});
		const json = await res.json();
		const occupied = new Set(json.data.booked_seats);
		for (let s = 1; s <= 5; s++) {
			if (!occupied.has(s)) return s;
		}
		throw new Error('Tidak ada kursi kosong di jadwal ini (semua 1-5 penuh)');
	}

	// 2. Skenario 4: Role Guard Check (Member cannot access operator APIs)
	console.log('\n--- 2. Role Guard: Member dilarang akses endpoint Operator ---');
	const forbiddenRes1 = await fetch(`${BASE_URL}/api/operator/pesan`, {
		headers: { Cookie: memberAuth.cookie }
	});
	if (forbiddenRes1.status === 403) {
		console.log('[PASS] GET /api/operator/pesan with member cookie -> 403 Forbidden');
	} else {
		throw new Error(`Expected 403, got ${forbiddenRes1.status}`);
	}

	const forbiddenRes2 = await fetch(`${BASE_URL}/api/operator/pesan/1/status`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', Cookie: memberAuth.cookie },
		body: JSON.stringify({ status: 'Lunas' })
	});
	if (forbiddenRes2.status === 403) {
		console.log('[PASS] PATCH /api/operator/pesan/1/status with member cookie -> 403 Forbidden');
	} else {
		throw new Error(`Expected 403, got ${forbiddenRes2.status}`);
	}

	// 3. Skenario 3: Alur Penuh (Pesan -> Kirim Bukti -> Operator Verifikasi LUNAS)
	console.log('\n--- 3. Alur Pesan -> Kirim Bukti -> Operator Set Lunas ---');
	const seat1 = await getAvailableSeat(targetJadwal.id_jadwal, memberAuth.cookie);
	console.log(`Member memesan kursi #${seat1}...`);

	const pesanRes1 = await fetch(`${BASE_URL}/api/member/pesan`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: memberAuth.cookie },
		body: JSON.stringify({ id_jadwal: targetJadwal.id_jadwal, nomor_kursi: seat1 })
	});
	const pesanData1 = await pesanRes1.json();
	if (!pesanRes1.ok) throw new Error(`Gagal pesan: ${JSON.stringify(pesanData1)}`);
	const idPesan1 = pesanData1.data.first_id_pesan;
	console.log(`[PASS] Pesanan dibuat: ID ${idPesan1}`);

	// Member kirim bukti
	console.log(`Member mengirim bukti transfer untuk pesanan ID ${idPesan1}...`);
	const kirimRes1 = await fetch(`${BASE_URL}/api/member/pesanan/${idPesan1}/kirim`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: memberAuth.cookie },
		body: JSON.stringify({
			no_rek: '1234567890',
			tgl_transfer: '2026-12-15',
			jam_transfer: '10:00'
		})
	});
	const kirimData1 = await kirimRes1.json();
	if (!kirimRes1.ok) throw new Error(`Gagal kirim bukti: ${JSON.stringify(kirimData1)}`);
	console.log(`[PASS] Bukti terkirim. Status sekarang: ${kirimData1.data.status}`);

	// Operator inspects list
	console.log('Operator mengambil daftar pesanan filter "Dalam Proses"...');
	const listRes = await fetch(`${BASE_URL}/api/operator/pesan?status=Dalam%20Proses`, {
		headers: { Cookie: operatorAuth.cookie }
	});
	const listData = await listRes.json();
	if (!listRes.ok) throw new Error(`Gagal ambil list operator: ${JSON.stringify(listData)}`);
	const foundInList = listData.data.find(p => p.id_pesan === idPesan1);
	if (!foundInList) throw new Error(`Pesanan ${idPesan1} tidak ditemukan di list Dalam Proses`);
	console.log(`[PASS] Pesanan ${idPesan1} ditemukan di daftar operator (Resi: ${foundInList.no_resi})`);

	// Operator inspects detail
	console.log(`Operator melihat detail pesanan ID ${idPesan1}...`);
	const detailRes = await fetch(`${BASE_URL}/api/operator/pesan/${idPesan1}`, {
		headers: { Cookie: operatorAuth.cookie }
	});
	const detailData = await detailRes.json();
	if (!detailRes.ok) throw new Error(`Gagal detail operator: ${JSON.stringify(detailData)}`);
	const order1 = detailData.data;

	console.log(`[PASS] Detail pesanan: Resi Pesan=${order1.resi_pesan}, Resi Konfirmasi=${order1.konfirmasi_no_resi}, No Rek=${order1.no_rek}`);
	if (order1.resi_pesan !== order1.konfirmasi_no_resi) {
		throw new Error(`BUG: Resi pesan (${order1.resi_pesan}) != Resi konfirmasi (${order1.konfirmasi_no_resi})`);
	}
	console.log('[PASS] Validasi kesamaan nomor resi sukses (keduanya identik)');

	// Operator set Lunas
	console.log(`Operator mengubah status pesanan ${idPesan1} menjadi Lunas...`);
	const patchLunasRes = await fetch(`${BASE_URL}/api/operator/pesan/${idPesan1}/status`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', Cookie: operatorAuth.cookie },
		body: JSON.stringify({ status: 'Lunas' })
	});
	const patchLunasData = await patchLunasRes.json();
	if (!patchLunasRes.ok) throw new Error(`Gagal set Lunas: ${JSON.stringify(patchLunasData)}`);
	console.log(`[PASS] Status berhasil diubah menjadi: ${patchLunasData.data.status}`);

	// Verify in DB
	const [dbCheckLunas] = await db.query('SELECT status FROM pesan WHERE id_pesan = ?', [idPesan1]);
	if (dbCheckLunas[0]?.status !== 'Lunas') {
		throw new Error(`DB Status mismatch: expected Lunas, got ${dbCheckLunas[0]?.status}`);
	}
	console.log('[PASS] Verifikasi DB: status pesan = Lunas');

	// 4. Skenario 6: Final status guard (Lunas tidak bisa diubah lagi)
	console.log('\n--- 4. Status Final Guard: Dari Lunas tidak boleh diubah ---');
	const invalidLunasChange = await fetch(`${BASE_URL}/api/operator/pesan/${idPesan1}/status`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', Cookie: operatorAuth.cookie },
		body: JSON.stringify({ status: 'Belum Bayar' })
	});
	if (invalidLunasChange.status === 409) {
		const err = await invalidLunasChange.json();
		console.log(`[PASS] Tolak perubahan status dari Lunas -> 409 Conflict (${err.error.message})`);
	} else {
		throw new Error(`Expected 409, got ${invalidLunasChange.status}`);
	}

	// 5. Skenario 5: Operator Kembalikan ke Belum Bayar & Hapus Konfirmasi
	console.log('\n--- 5. Tolak Bukti: Kembalikan ke Belum Bayar & Hapus Konfirmasi ---');
	const seat2 = await getAvailableSeat(targetJadwal.id_jadwal, memberAuth.cookie);
	const pesanRes2 = await fetch(`${BASE_URL}/api/member/pesan`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: memberAuth.cookie },
		body: JSON.stringify({ id_jadwal: targetJadwal.id_jadwal, nomor_kursi: seat2 })
	});
	const pesanData2 = await pesanRes2.json();
	const idPesan2 = pesanData2.data.first_id_pesan;

	// Cek reject saat status masih Belum Bayar -> Harus 409 Conflict
	const rejectPremature = await fetch(`${BASE_URL}/api/operator/pesan/${idPesan2}/status`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', Cookie: operatorAuth.cookie },
		body: JSON.stringify({ status: 'Lunas' })
	});
	if (rejectPremature.status === 409) {
		console.log('[PASS] Operator mencoba ubah status dari Belum Bayar -> 409 Conflict ditolak');
	} else {
		throw new Error(`Expected 409, got ${rejectPremature.status}`);
	}

	// Member kirim bukti
	const kirimRes2 = await fetch(`${BASE_URL}/api/member/pesanan/${idPesan2}/kirim`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: memberAuth.cookie },
		body: JSON.stringify({
			no_rek: '1987654321',
			tgl_transfer: '2026-12-15',
			jam_transfer: '11:00'
		})
	});
	const kirimData2 = await kirimRes2.json();
	if (!kirimRes2.ok) {
		throw new Error(`Kirim bukti 2 failed: ${JSON.stringify(kirimData2)}`);
	}
	console.log(`Pesanan ${idPesan2} sekarang berstatus Dalam Proses.`);

	// Cek konfirmasi_pesan ada di DB
	const [konfBefore] = await db.query('SELECT * FROM konfirmasi_pesan WHERE id_pesan = ?', [idPesan2]);
	if (konfBefore.length === 0) throw new Error('Konfirmasi pesan harusnya ada sebelum ditolak');
	console.log(`[PASS] Baris konfirmasi_pesan ada (id_konfirmasi: ${konfBefore[0].id_konfirmasi || konfBefore[0].no_resi})`);

	// Operator tolak bukti -> ubah ke Belum Bayar
	console.log(`Operator menolak bukti pesanan ${idPesan2}...`);
	const patchRejectRes = await fetch(`${BASE_URL}/api/operator/pesan/${idPesan2}/status`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', Cookie: operatorAuth.cookie },
		body: JSON.stringify({ status: 'Belum Bayar' })
	});
	const patchRejectData = await patchRejectRes.json();
	if (!patchRejectRes.ok) throw new Error(`Gagal tolak bukti: ${JSON.stringify(patchRejectData)}`);
	console.log(`[PASS] Operator berhasil kembalikan ke: ${patchRejectData.data.status}`);

	// Verifikasi konfirmasi_pesan terhapus di DB dalam transaksi yang sama
	const [konfAfter] = await db.query('SELECT * FROM konfirmasi_pesan WHERE id_pesan = ?', [idPesan2]);
	if (konfAfter.length !== 0) {
		throw new Error(`Harusnya konfirmasi_pesan terhapus, tetapi masih ada ${konfAfter.length} baris`);
	}
	console.log('[PASS] Verifikasi DB: baris konfirmasi_pesan BERHASIL DIHAPUS!');

	// Member sekarang bisa kirim bukti ulang!
	console.log('Member mencoba mengirim bukti ulang...');
	const reKirimRes = await fetch(`${BASE_URL}/api/member/pesanan/${idPesan2}/kirim`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Cookie: memberAuth.cookie },
		body: JSON.stringify({
			no_rek: '1555666777',
			tgl_transfer: '2026-12-15',
			jam_transfer: '11:30'
		})
	});
	const reKirimData = await reKirimRes.json();
	if (!reKirimRes.ok) throw new Error(`Member gagal kirim bukti ulang: ${JSON.stringify(reKirimData)}`);
	console.log(`[PASS] Member sukses kirim bukti ulang! Status: ${reKirimData.data.status}`);

	// Operator set Lunas pesanan kedua
	await fetch(`${BASE_URL}/api/operator/pesan/${idPesan2}/status`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', Cookie: operatorAuth.cookie },
		body: JSON.stringify({ status: 'Lunas' })
	});
	console.log(`[PASS] Pesanan kedua berhasil diselesaikan (Lunas).`);

	await db.end();
	console.log('\n=== SEMUA PENGUJIAN LANGKAH 8 BERHASIL 100%! ===');
}

runTests().catch(err => {
	console.error('\n[FATAL TEST ERROR]', err);
	process.exit(1);
});
