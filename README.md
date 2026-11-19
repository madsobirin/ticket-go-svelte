# Ticket Go - Sistem Pemesanan Tiket Travel Antarkota

Aplikasi web modern untuk pemesanan tiket travel antarkota (Lampung - Jawa) dengan 3 role pengguna: **Admin**, **Operator Loket**, dan **Member (Pelanggan)**.

- **URL Deployment Production**: [https://ticket-go-kohl.vercel.app/](https://ticket-go-kohl.vercel.app/)
- **Tech Stack**: SvelteKit 3, Tailwind CSS v4, MySQL / TiDB Cloud Serverless, Docker & Docker Compose.

---

## Panduan Menjalankan Sistem dengan Docker (Rekomendasi Dosen / Penguji)

Pastikan **Docker Desktop** atau Docker daemon sudah berjalan di komputer Anda.

### 1. Ekstrak dan Buka Folder Project
```bash
cd ticket-go-v1
```

### 2. Pastikan File Konfigurasi `.env` Ada
File `.env` sudah disertakan di root project dengan koneksi database cloud TiDB:
```env
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=4PrFPKvFdBpxNSE.root
DB_PASSWORD=3rUqJIGkOrnpS8Yr
DB_NAME=ticketgo
```

### 3. Build & Jalankan Container
Cukup jalankan satu perintah:
```bash
docker compose up -d --build
```
> Docker akan otomatis mengunduh Node 22, menginstal dependensi, build aplikasi, dan menyalakan container di background.

### 4. Cek Status Container
```bash
docker ps
```
Pastikan container `ticketgo-app` berstatus `Up` dengan port `0.0.0.0:3000->3000`.

### 5. Akses Aplikasi di Browser
Buka tautan berikut di browser:
```
http://localhost:3000
```

### 6. Mematikan Container
Jika pengujian selesai, jalankan:
```bash
docker compose down
```

---

## Akun Pengujian Default (Demo)

Gunakan akun berikut pada halaman login `/login`:

| Role | Username / Identifier | Password | Hak Akses |
|---|---|---|---|
| **Admin** | `test@team2travel.net` | `TheOne123@` | Kelola master kendaraan, kota asal, kota tujuan, jadwal, member, & lihat keluhan |
| **Operator** | `loket1` | `operator123` | Cek pesanan masuk, verifikasi bukti transfer pembayaran tiket |
| **Member** | `buditest` | `budi123` | Cari jadwal, pesan nomor kursi, kirim bukti bayar, cetak tiket, kirim keluhan |

---

## Panduan Menjalankan Lokal (Tanpa Docker)

Jika ingin menjalankan langsung menggunakan Node.js di komputer:

1. **Prasyarat**: Node.js versi 22+ terinstal.
2. **Install Dependensi**:
   ```bash
   npm install
   ```
3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses di `http://localhost:5173`.
4. **Build Production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## Pengujian API dengan Postman

File koleksi pengujian API lengkap sudah tersedia di root:
- File: `test-api-ticket-go.json`
- **Cara Pakai**:
  1. Buka Postman -> Klik tombol **Import**.
  2. Pilih file `test-api-ticket-go.json`.
  3. Seluruh 25+ endpoint (Auth, Public, Member, Operator, Admin) siap dites secara otomatis.

---

## Struktur Database & Migrasi

Skrip DDL dan seed data database tersimpan di:
- `scripts/schema.sql`: Skema 10 tabel (`admin`, `operator_loket`, `member`, `kota_asal`, `kota_tujuan`, `kendaraan`, `jadwal`, `pesan`, `konfirmasi_pesan`, `keluhan`) beserta data awal.
