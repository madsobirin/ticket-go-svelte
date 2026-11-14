-- ========================================================
-- Ticket Go - Database Schema & Initial Seed Data
-- Compatible with MySQL 8.0+ and TiDB Serverless Cloud
-- ========================================================

CREATE DATABASE IF NOT EXISTS `ticketgo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ticketgo`;

-- 1. Tabel Admin
CREATE TABLE IF NOT EXISTS `admin` (
  `id_admin` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Operator Loket
CREATE TABLE IF NOT EXISTS `operator_loket` (
  `id_opr` INT AUTO_INCREMENT PRIMARY KEY,
  `user` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Member
CREATE TABLE IF NOT EXISTS `member` (
  `id_member` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `alamat` TEXT DEFAULT NULL,
  `telepon` VARCHAR(20) DEFAULT NULL,
  `jen_kelamin` VARCHAR(20) DEFAULT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Kota Asal
CREATE TABLE IF NOT EXISTS `kota_asal` (
  `id_kota_asal` INT AUTO_INCREMENT PRIMARY KEY,
  `nm_kota_asal` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel Kota Tujuan
CREATE TABLE IF NOT EXISTS `kota_tujuan` (
  `id_kota_tujuan` INT AUTO_INCREMENT PRIMARY KEY,
  `nm_kota_tujuan` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabel Kendaraan
CREATE TABLE IF NOT EXISTS `kendaraan` (
  `id_mobil` INT AUTO_INCREMENT PRIMARY KEY,
  `jenis_mobil` VARCHAR(100) NOT NULL,
  `nomor_polisi` VARCHAR(20) NOT NULL UNIQUE,
  `warna_mobil` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabel Jadwal
CREATE TABLE IF NOT EXISTS `jadwal` (
  `id_jadwal` INT AUTO_INCREMENT PRIMARY KEY,
  `id_kota_asal` INT NOT NULL,
  `id_kota_tujuan` INT NOT NULL,
  `id_mobil` INT NOT NULL,
  `harga` INT NOT NULL,
  `tgl_berangkat` DATE NOT NULL,
  `jam_berangkat` TIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_jadwal_tgl_jam` (`tgl_berangkat`, `jam_berangkat`),
  CONSTRAINT `fk_jadwal_kota_asal` FOREIGN KEY (`id_kota_asal`) REFERENCES `kota_asal` (`id_kota_asal`) ON DELETE RESTRICT,
  CONSTRAINT `fk_jadwal_kota_tujuan` FOREIGN KEY (`id_kota_tujuan`) REFERENCES `kota_tujuan` (`id_kota_tujuan`) ON DELETE RESTRICT,
  CONSTRAINT `fk_jadwal_mobil` FOREIGN KEY (`id_mobil`) REFERENCES `kendaraan` (`id_mobil`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabel Pesan
CREATE TABLE IF NOT EXISTS `pesan` (
  `id_pesan` INT AUTO_INCREMENT PRIMARY KEY,
  `nomor_kursi` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Belum Bayar',
  `id_jadwal` INT NOT NULL,
  `id_member` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pesan_jadwal_status` (`id_jadwal`, `status`),
  CONSTRAINT `fk_pesan_jadwal` FOREIGN KEY (`id_jadwal`) REFERENCES `jadwal` (`id_jadwal`) ON DELETE CASCADE,
  CONSTRAINT `fk_pesan_member` FOREIGN KEY (`id_member`) REFERENCES `member` (`id_member`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabel Konfirmasi Pesan
CREATE TABLE IF NOT EXISTS `konfirmasi_pesan` (
  `id_konfirmasi` INT AUTO_INCREMENT PRIMARY KEY,
  `no_resi` VARCHAR(100) NOT NULL,
  `no_rek` VARCHAR(100) NOT NULL,
  `tgl_transfer` DATE NOT NULL,
  `jam_transfer` TIME NOT NULL,
  `id_pesan` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_konfirmasi_pesan` FOREIGN KEY (`id_pesan`) REFERENCES `pesan` (`id_pesan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Tabel Keluhan
CREATE TABLE IF NOT EXISTS `keluhan` (
  `id_keluhan` INT AUTO_INCREMENT PRIMARY KEY,
  `id_member` INT NOT NULL,
  `j_keluhan` VARCHAR(50) NOT NULL,
  `d_keluhan` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_keluhan_member` FOREIGN KEY (`id_member`) REFERENCES `member` (`id_member`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ========================================================
-- SEED DATA AWAL (Initial Seed Data)
-- ========================================================

-- Akun Default:
-- Admin 1: admin@ticketgo.id / admin123
-- Admin 2: test@team2travel.net / TheOne123@
INSERT INTO `admin` (`id_admin`, `email`, `password`) VALUES
(1, 'admin@ticketgo.id', 'admin123'),
(2, 'test@team2travel.net', 'TheOne123@')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- Operator Loket Default:
-- user: loket1 / operator123
INSERT INTO `operator_loket` (`id_opr`, `user`, `password`, `nama`) VALUES
(1, 'loket1', 'operator123', 'Petugas Loket 1')
ON DUPLICATE KEY UPDATE `user` = VALUES(`user`);

-- Member Default:
-- doni / doni123
-- buditest / budi123
INSERT INTO `member` (`id_member`, `nama`, `alamat`, `telepon`, `jen_kelamin`, `username`, `password`) VALUES
(1, 'Doni Pratama', 'Jl. Raden Intan No. 45, Bandar Lampung', '081234567890', 'Laki-laki', 'doni', 'doni123'),
(2, 'Budi Santoso', 'Jl. Merdeka No. 10, Jakarta', '081398765432', 'Laki-laki', 'buditest', 'budi123')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- Data Kota Asal
INSERT INTO `kota_asal` (`id_kota_asal`, `nm_kota_asal`) VALUES
(1, 'Indramayu'),
(2, 'Bandar Lampung'),
(3, 'Jakarta'),
(4, 'Bandung'),
(5, 'Cirebon')
ON DUPLICATE KEY UPDATE `nm_kota_asal` = VALUES(`nm_kota_asal`);

-- Data Kota Tujuan
INSERT INTO `kota_tujuan` (`id_kota_tujuan`, `nm_kota_tujuan`) VALUES
(1, 'Cirebon'),
(2, 'Jakarta'),
(3, 'Bandar Lampung'),
(4, 'Bandung'),
(5, 'Indramayu')
ON DUPLICATE KEY UPDATE `nm_kota_tujuan` = VALUES(`nm_kota_tujuan`);

-- Data Kendaraan (8 Kursi)
INSERT INTO `kendaraan` (`id_mobil`, `jenis_mobil`, `nomor_polisi`, `warna_mobil`) VALUES
(1, 'Toyota Avanza', 'BE 1212 AT', 'Hitam Metalik'),
(2, 'Toyota HiAce Premio', 'BE 7788 BT', 'Putih'),
(3, 'Daihatsu Xenia', 'BE 3456 CD', 'Silver')
ON DUPLICATE KEY UPDATE `nomor_polisi` = VALUES(`nomor_polisi`);

-- Data Jadwal (Tanggal Hari Ini & Mendatang agar selalu tampil di pencarian)
INSERT INTO `jadwal` (`id_jadwal`, `id_kota_asal`, `id_kota_tujuan`, `id_mobil`, `harga`, `tgl_berangkat`, `jam_berangkat`) VALUES
(1, 1, 1, 1, 60000, CURDATE(), '23:59:00'),
(2, 1, 1, 1, 60000, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00'),
(3, 2, 2, 2, 220000, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00'),
(4, 3, 4, 3, 110000, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00:00'),
(5, 2, 2, 1, 180000, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '08:30:00'),
(6, 4, 5, 2, 140000, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00:00')
ON DUPLICATE KEY UPDATE `harga` = VALUES(`harga`);

-- Data Pesanan Dummy (untuk Jadwal 2: terisi kursi 1, 2, 3 -> sisa 5 dari 8 kursi)
INSERT INTO `pesan` (`id_pesan`, `nomor_kursi`, `status`, `id_jadwal`, `id_member`) VALUES
(1, 1, 'Lunas', 2, 1),
(2, 2, 'Lunas', 2, 2),
(3, 3, 'Dalam Proses', 2, 1)
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Data Keluhan Dummy
INSERT INTO `keluhan` (`id_keluhan`, `id_member`, `j_keluhan`, `d_keluhan`) VALUES
(1, 1, 'Layanan Armada', 'AC mobil agak kurang dingin saat perjalanan siang hari.'),
(2, 2, 'Ketepatan Waktu', 'Mohon konfirmasi keberangkatan 30 menit sebelum jadwal tiba.')
ON DUPLICATE KEY UPDATE `j_keluhan` = VALUES(`j_keluhan`);
