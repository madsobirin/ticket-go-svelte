import json
import uuid

def build_postman_collection():
    collection_id = str(uuid.uuid4())
    
    collection = {
        "info": {
            "_postman_id": collection_id,
            "name": "Ticket Go API Test Collection",
            "description": "Koleksi Postman untuk pengujian API Ticket Go di https://ticket-go-kohl.vercel.app.\n\nAlur Pengujian:\n1. Jalankan '02. Autentikasi / Login Admin / Login Operator / Login Member'.\n2. Token sesi disimpan otomatis di variabel 'session_cookie' dan otomatis dikirimkan di header/cookie jar.\n3. Jalankan endpoint pengujian sesuai role.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "variable": [
            {
                "key": "base_url",
                "value": "https://ticket-go-kohl.vercel.app",
                "type": "string"
            },
            {
                "key": "session_cookie",
                "value": "",
                "type": "string"
            },
            {
                "key": "admin_identifier",
                "value": "test@team2travel.net",
                "type": "string"
            },
            {
                "key": "admin_password",
                "value": "TheOne123@",
                "type": "string"
            },
            {
                "key": "operator_identifier",
                "value": "loket1",
                "type": "string"
            },
            {
                "key": "operator_password",
                "value": "operator123",
                "type": "string"
            },
            {
                "key": "member_identifier",
                "value": "buditest",
                "type": "string"
            },
            {
                "key": "member_password",
                "value": "budi123",
                "type": "string"
            },
            {
                "key": "sample_jadwal_id",
                "value": "1",
                "type": "string"
            },
            {
                "key": "sample_pesan_id",
                "value": "1",
                "type": "string"
            },
            {
                "key": "sample_member_id",
                "value": "1",
                "type": "string"
            },
            {
                "key": "sample_kendaraan_id",
                "value": "1",
                "type": "string"
            },
            {
                "key": "sample_kota_asal_id",
                "value": "1",
                "type": "string"
            },
            {
                "key": "sample_kota_tujuan_id",
                "value": "1",
                "type": "string"
            }
        ],
        "item": []
    }

    def make_url(path_str, query_params=None):
        parts = [p for p in path_str.strip("/").split("/") if p]
        url_obj = {
            "raw": "{{base_url}}/" + "/".join(parts),
            "host": ["{{base_url}}"],
            "path": parts
        }
        if query_params:
            url_obj["query"] = query_params
            query_str = "&".join([f"{q['key']}={q['value']}" for q in query_params if not q.get("disabled")])
            if query_str:
                url_obj["raw"] += "?" + query_str
        return url_obj

    def make_auth_headers():
        return [
            {"key": "Accept", "value": "application/json", "type": "text"},
            {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text", "description": "Auto-filled dari login script atau gunakan Postman Cookie Jar"}
        ]

    def make_auth_test_script():
        return [
            {
                "listen": "test",
                "script": {
                    "exec": [
                        "pm.test(\"Status code is 200\", function () {",
                        "    pm.response.to.have.status(200);",
                        "});",
                        "",
                        "// Simpan cookie ke variabel session_cookie untuk pengujian tanpa cookie jar",
                        "const rawCookie = pm.response.headers.get(\"set-cookie\");",
                        "if (rawCookie) {",
                        "    const match = rawCookie.match(/session=([^;]+)/);",
                        "    if (match) {",
                        "        pm.collectionVariables.set(\"session_cookie\", match[1]);",
                        "        console.log(\"Session cookie berhasil diperbarui:\", match[1]);",
                        "    }",
                        "}"
                    ],
                    "type": "text/javascript"
                }
            }
        ]

    def make_generic_test_script(status_code=200):
        return [
            {
                "listen": "test",
                "script": {
                    "exec": [
                        f"pm.test(\"Status code is {status_code}\", function () {{",
                        f"    pm.response.to.have.status({status_code});",
                        "});",
                        "pm.test(\"Response is valid JSON\", function () {",
                        "    pm.response.to.be.json;",
                        "});"
                    ],
                    "type": "text/javascript"
                }
            }
        ]

    # ---------------- 1. System & Public ----------------
    sys_public = {
        "name": "01. System & Public",
        "item": [
            {
                "name": "Health Check (TiDB Database Status)",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": [{"key": "Accept", "value": "application/json", "type": "text"}],
                    "url": make_url("/api/health"),
                    "description": "Memastikan server dan koneksi database TiDB Cloud aktif."
                },
                "response": []
            },
            {
                "name": "Daftar Kota Master (Asal & Tujuan)",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": [{"key": "Accept", "value": "application/json", "type": "text"}],
                    "url": make_url("/api/kota"),
                    "description": "Mengambil master seluruh kota asal dan kota tujuan untuk form pencarian tiket."
                },
                "response": []
            },
            {
                "name": "Cari Jadwal Publik (Query Params)",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": [{"key": "Accept", "value": "application/json", "type": "text"}],
                    "url": make_url("/api/member/jadwal", [
                        {"key": "id_kota_asal", "value": "1", "description": "Opsional: ID Kota Asal"},
                        {"key": "id_kota_tujuan", "value": "2", "description": "Opsional: ID Kota Tujuan"},
                        {"key": "tanggal", "value": "2026-11-20", "description": "Opsional: Format YYYY-MM-DD"}
                    ]),
                    "description": "Mencari jadwal tiket travel aktif di masa mendatang berdasarkan filter rute & tanggal."
                },
                "response": []
            }
        ]
    }

    # ---------------- 2. Autentikasi ----------------
    auth_folder = {
        "name": "02. Autentikasi (Auth)",
        "item": [
            {
                "name": "1. Login Admin (test@team2travel.net)",
                "event": make_auth_test_script(),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"identifier\": \"{{admin_identifier}}\",\n  \"password\": \"{{admin_password}}\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/auth/login"),
                    "description": "Login sebagai Admin. Menyimpan session cookie role admin."
                },
                "response": []
            },
            {
                "name": "2. Login Operator Loket (loket1)",
                "event": make_auth_test_script(),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"identifier\": \"{{operator_identifier}}\",\n  \"password\": \"{{operator_password}}\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/auth/login"),
                    "description": "Login sebagai Petugas Loket. Menyimpan session cookie role operator."
                },
                "response": []
            },
            {
                "name": "3. Login Member (buditest)",
                "event": make_auth_test_script(),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"identifier\": \"{{member_identifier}}\",\n  \"password\": \"{{member_password}}\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/auth/login"),
                    "description": "Login sebagai Member pelanggan travel. Menyimpan session cookie role member."
                },
                "response": []
            },
            {
                "name": "4. Register Member Baru",
                "event": make_generic_test_script(201),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"nama\": \"Andi Wijaya\",\n  \"alamat\": \"Jl. Sudirman No 12 Bandar Lampung\",\n  \"telepon\": \"081298765432\",\n  \"jen_kelamin\": \"L\",\n  \"username\": \"andi_\" + Math.floor(Math.random() * 10000),\n  \"password\": \"andi12345\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/auth/register"),
                    "description": "Pendaftaran akun member baru. Password otomatis di-hash dengan bcrypt."
                },
                "response": []
            },
            {
                "name": "5. Logout",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "DELETE",
                    "header": make_auth_headers(),
                    "url": make_url("/api/auth/logout"),
                    "description": "Menghapus cookie session aktif."
                },
                "response": []
            }
        ]
    }

    # ---------------- 3. Member Features ----------------
    member_folder = {
        "name": "03. Fitur Member (Pelanggan)",
        "item": [
            {
                "name": "1. Cari Jadwal Perjalanan",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/member/jadwal"),
                    "description": "Melihat jadwal perjalanan travel aktif beserta jumlah sisa kursi."
                },
                "response": []
            },
            {
                "name": "2. Cek Kursi Terisi pada Jadwal",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/member/jadwal/{{sample_jadwal_id}}/kursi"),
                    "description": "Mengecek nomor kursi mana saja yang sudah terpesan pada suatu jadwal."
                },
                "response": []
            },
            {
                "name": "3. Pesan Kursi / Buat Booking",
                "event": make_generic_test_script(201),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"id_jadwal\": {{sample_jadwal_id}},\n  \"nomor_kursi\": [5]\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/member/pesan"),
                    "description": "Memesan kursi (1 sampai 5 kursi). Status awal pesanan: 'Belum Bayar'."
                },
                "response": []
            },
            {
                "name": "4. Riwayat Pesanan Saya",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/member/pesanan"),
                    "description": "Melihat seluruh tiket dan riwayat pesanan milik akun member login."
                },
                "response": []
            },
            {
                "name": "5. Detail Pesanan Tiket",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/member/pesanan/{{sample_pesan_id}}"),
                    "description": "Melihat detail pesanan tiket berdasarkan ID pesan."
                },
                "response": []
            },
            {
                "name": "6. Cek Data Konfirmasi Pesanan",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/member/pesanan/{{sample_pesan_id}}/konfirmasi"),
                    "description": "Mengecek apakah pesanan ini sudah mengirim bukti transfer atau belum."
                },
                "response": []
            },
            {
                "name": "7. Kirim Bukti Transfer ke Loket (Ubah Status ke Dalam Proses)",
                "event": make_generic_test_script(201),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"no_rek\": \"5432109876\",\n  \"tgl_transfer\": \"2026-11-18\",\n  \"jam_transfer\": \"10:15:00\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/member/pesanan/{{sample_pesan_id}}/kirim"),
                    "description": "Mengirim bukti bayar ke loket. No resi dihitung otomatis oleh sistem, status otomatis berganti ke 'Dalam Proses'."
                },
                "response": []
            },
            {
                "name": "8. Daftar Rekening Bank Tujuan Transfer",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/member/bank"),
                    "description": "Melihat daftar 5 bank resmi perusahaan travel untuk transfer manual."
                },
                "response": []
            },
            {
                "name": "9. Kirim Keluhan / Pengaduan Member",
                "event": make_generic_test_script(201),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"j_keluhan\": \"Layanan Armada\",\n  \"d_keluhan\": \"Perjalanan tepat waktu, supir ramah dan AC dingin.\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/member/keluhan"),
                    "description": "Member menyampaikan saran/keluhan mengenai armada atau layanan."
                },
                "response": []
            }
        ]
    }

    # ---------------- 4. Operator Loket ----------------
    operator_folder = {
        "name": "04. Fitur Operator Loket",
        "item": [
            {
                "name": "1. Lihat Semua Pesanan Masuk",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/operator/pesan"),
                    "description": "Melihat daftar seluruh pesanan tiket beserta status pembayaran dan nomor resi."
                },
                "response": []
            },
            {
                "name": "2. Filter Pesanan Berdasarkan Status (Dalam Proses)",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/operator/pesan", [
                        {"key": "status", "value": "Dalam Proses", "description": "Pilihan: Belum Bayar | Dalam Proses | Lunas"}
                    ]),
                    "description": "Menyaring pesanan tiket yang bukti transfernya perlu diverifikasi oleh operator loket."
                },
                "response": []
            },
            {
                "name": "3. Detail Pesanan & Bukti Transfer",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/operator/pesan/{{sample_pesan_id}}"),
                    "description": "Melihat rincian pesanan dan bukti rekening pengirim transfer."
                },
                "response": []
            },
            {
                "name": "4. Verifikasi Pembayaran (Ubah Status ke Lunas)",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "PATCH",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"status\": \"Lunas\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/operator/pesan/{{sample_pesan_id}}/status"),
                    "description": "Operator mengesahkan status pesanan menjadi 'Lunas' setelah transfer dicek di rekening."
                },
                "response": []
            },
            {
                "name": "5. Tolak Pembayaran (Kembalikan ke Belum Bayar)",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "PATCH",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"status\": \"Belum Bayar\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/operator/pesan/{{sample_pesan_id}}/status"),
                    "description": "Mengembalikan status ke 'Belum Bayar' jika bukti mutasi bank tidak valid."
                },
                "response": []
            }
        ]
    }

    # ---------------- 5. Admin Folder ----------------
    admin_folder = {
        "name": "05. Fitur Admin (Kelola Master Data)",
        "item": [
            # Kendaraan
            {
                "name": "1. Kelola Kendaraan - List Kendaraan",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/kendaraan"),
                    "description": "Melihat semua armada kendaraan."
                },
                "response": []
            },
            {
                "name": "1. Kelola Kendaraan - Tambah Kendaraan",
                "event": make_generic_test_script(201),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"jenis_mobil\": \"Toyota HiAce\",\n  \"nomor_polisi\": \"BE \" + Math.floor(1000 + Math.random() * 9000) + \" ZZ\",\n  \"warna_mobil\": \"Putih\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/kendaraan"),
                    "description": "Menambah armada kendaraan travel baru."
                },
                "response": []
            },
            {
                "name": "1. Kelola Kendaraan - Update Kendaraan",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "PUT",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"jenis_mobil\": \"Toyota HiAce Luxury\",\n  \"nomor_polisi\": \"BE 8899 AA\",\n  \"warna_mobil\": \"Hitam Metalik\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/kendaraan/{{sample_kendaraan_id}}"),
                    "description": "Memperbarui data kendaraan travel."
                },
                "response": []
            },
            {
                "name": "1. Kelola Kendaraan - Hapus Kendaraan",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "DELETE",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/kendaraan/{{sample_kendaraan_id}}"),
                    "description": "Menghapus data kendaraan travel."
                },
                "response": []
            },

            # Kota Asal
            {
                "name": "2. Kelola Kota Asal - List Kota Asal",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/kota/asal"),
                    "description": "Melihat master kota asal beserta jumlah jadwalnya."
                },
                "response": []
            },
            {
                "name": "2. Kelola Kota Asal - Tambah Kota Asal",
                "event": make_generic_test_script(201),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"nm_kota_asal\": \"Palembang \" + Math.floor(Math.random() * 1000)\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/kota/asal"),
                    "description": "Menambah master kota asal baru."
                },
                "response": []
            },
            {
                "name": "2. Kelola Kota Asal - Update Kota Asal",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "PUT",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"nm_kota_asal\": \"Bandar Lampung\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/kota/asal/{{sample_kota_asal_id}}"),
                    "description": "Memperbarui nama kota asal."
                },
                "response": []
            },
            {
                "name": "2. Kelola Kota Asal - Hapus Kota Asal",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "DELETE",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/kota/asal/{{sample_kota_asal_id}}"),
                    "description": "Menghapus master kota asal jika belum ada jadwal terkait."
                },
                "response": []
            },

            # Kota Tujuan
            {
                "name": "3. Kelola Kota Tujuan - List Kota Tujuan",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/kota/tujuan"),
                    "description": "Melihat master kota tujuan beserta jumlah jadwalnya."
                },
                "response": []
            },
            {
                "name": "3. Kelola Kota Tujuan - Tambah Kota Tujuan",
                "event": make_generic_test_script(201),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"nm_kota_tujuan\": \"Semarang \" + Math.floor(Math.random() * 1000)\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/kota/tujuan"),
                    "description": "Menambah master kota tujuan baru."
                },
                "response": []
            },
            {
                "name": "3. Kelola Kota Tujuan - Update Kota Tujuan",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "PUT",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"nm_kota_tujuan\": \"Jakarta Timur\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/kota/tujuan/{{sample_kota_tujuan_id}}"),
                    "description": "Memperbarui nama kota tujuan."
                },
                "response": []
            },
            {
                "name": "3. Kelola Kota Tujuan - Hapus Kota Tujuan",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "DELETE",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/kota/tujuan/{{sample_kota_tujuan_id}}"),
                    "description": "Menghapus master kota tujuan jika belum ada jadwal terkait."
                },
                "response": []
            },

            # Jadwal
            {
                "name": "4. Kelola Jadwal - List Semua Jadwal",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/jadwal"),
                    "description": "Melihat daftar seluruh jadwal travel yang ada di sistem."
                },
                "response": []
            },
            {
                "name": "4. Kelola Jadwal - Tambah Jadwal Baru",
                "event": make_generic_test_script(201),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"id_kota_asal\": 1,\n  \"id_kota_tujuan\": 2,\n  \"id_mobil\": 1,\n  \"harga\": 150000,\n  \"tgl_berangkat\": \"2026-11-28\",\n  \"jam_berangkat\": \"08:00:00\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/jadwal"),
                    "description": "Admin membuat jadwal keberangkatan travel baru."
                },
                "response": []
            },
            {
                "name": "4. Kelola Jadwal - Update Jadwal",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "PUT",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"id_kota_asal\": 1,\n  \"id_kota_tujuan\": 2,\n  \"id_mobil\": 1,\n  \"harga\": 160000,\n  \"tgl_berangkat\": \"2026-11-28\",\n  \"jam_berangkat\": \"09:00:00\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/jadwal/{{sample_jadwal_id}}"),
                    "description": "Admin mengubah detail jadwal (harga, tanggal, atau jam)."
                },
                "response": []
            },
            {
                "name": "4. Kelola Jadwal - Hapus Jadwal",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "DELETE",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/jadwal/{{sample_jadwal_id}}"),
                    "description": "Admin menghapus jadwal (hanya jika belum ada pesanan aktif)."
                },
                "response": []
            },

            # Member
            {
                "name": "5. Kelola Member - List Semua Member",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/member"),
                    "description": "Melihat daftar akun member terdaftar beserta total pesanan tiket."
                },
                "response": []
            },
            {
                "name": "5. Kelola Member - Tambah Member Baru",
                "event": make_generic_test_script(201),
                "request": {
                    "method": "POST",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"nama\": \"Pelanggan VIP\",\n  \"alamat\": \"Jl. Cut Nyak Dien No 5\",\n  \"telepon\": \"082188776655\",\n  \"jen_kelamin\": \"P\",\n  \"username\": \"member_\" + Math.floor(Math.random() * 10000),\n  \"password\": \"password123\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/member"),
                    "description": "Admin menambahkan member pelanggan baru secara manual."
                },
                "response": []
            },
            {
                "name": "5. Kelola Member - Update Member",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "PUT",
                    "header": [
                        {"key": "Content-Type", "value": "application/json", "type": "text"},
                        {"key": "Accept", "value": "application/json", "type": "text"},
                        {"key": "Cookie", "value": "session={{session_cookie}}", "type": "text"}
                    ],
                    "body": {
                        "mode": "raw",
                        "raw": "{\n  \"nama\": \"Budi Santoso Updated\",\n  \"alamat\": \"Jl. Merdeka No. 10 Jakarta\",\n  \"telepon\": \"081398765432\",\n  \"jen_kelamin\": \"L\",\n  \"username\": \"buditest\",\n  \"password\": \"\"\n}",
                        "options": {"raw": {"language": "json"}}
                    },
                    "url": make_url("/api/admin/member/{{sample_member_id}}"),
                    "description": "Admin memperbarui profil member (kosongkan password jika tidak diubah)."
                },
                "response": []
            },
            {
                "name": "5. Kelola Member - Hapus Member",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "DELETE",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/member/{{sample_member_id}}"),
                    "description": "Admin menghapus akun member."
                },
                "response": []
            },

            # Keluhan
            {
                "name": "6. Kelola Keluhan - List Semua Keluhan",
                "event": make_generic_test_script(200),
                "request": {
                    "method": "GET",
                    "header": make_auth_headers(),
                    "url": make_url("/api/admin/keluhan"),
                    "description": "Admin melihat laporan keluhan yang dikirimkan oleh para member pelanggan."
                },
                "response": []
            }
        ]
    }

    collection["item"] = [
        sys_public,
        auth_folder,
        member_folder,
        operator_folder,
        admin_folder
    ]

    return collection

if __name__ == "__main__":
    col = build_postman_collection()
    with open("test-api-ticket-go.json", "w", encoding="utf-8") as f:
        json.dump(col, f, indent=2, ensure_ascii=False)
    print("test-api-ticket-go.json generated successfully!")
