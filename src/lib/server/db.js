import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

/**
 * Konfigurasi koneksi database MySQL/MariaDB.
 * Mendukung DATABASE_URL / MYSQL_URL atau variabel DB_* individual.
 * Mendukung port kustom dan SSL untuk cloud database (Aiven, TiDB, PlanetScale, Railway, dll).
 */
function createDatabasePool() {
	if (env.DATABASE_URL || env.MYSQL_URL) {
		return mysql.createPool(env.DATABASE_URL || env.MYSQL_URL);
	}

	const sslConfig =
		env.DB_SSL === 'true' || env.DB_SSL === '1'
			? { rejectUnauthorized: false }
			: undefined;

	return mysql.createPool({
		host: env.DB_HOST || '127.0.0.1',
		port: Number(env.DB_PORT) || 3306,
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
		ssl: sslConfig,
		waitForConnections: true,
		connectionLimit: 10,
		enableKeepAlive: true,
		keepAliveInitialDelay: 10000,
		charset: 'utf8mb4'
	});
}

export const pool = createDatabasePool();
