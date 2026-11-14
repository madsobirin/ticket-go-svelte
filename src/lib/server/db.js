import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

function cleanEnv(val) {
	if (val === undefined || val === null) return val;
	val = String(val).trim();
	if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
		return val.slice(1, -1);
	}
	return val;
}

/**
 * Konfigurasi koneksi database MySQL / MariaDB / TiDB Serverless.
 * Mendukung:
 * 1. DATABASE_URL / MYSQL_URL (Connection URI dari TiDB / Railway / PlanetScale)
 * 2. TIDB_* (TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD, TIDB_DATABASE)
 * 3. DB_* (DB_HOST, DB_PORT, DB_USER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DATABASE, DB_SSL)
 */
function createDatabasePool() {
	// 1. Opsi Connection URI
	const connectionUri = cleanEnv(env.DATABASE_URL || env.MYSQL_URL);
	if (connectionUri) {
		const isTiDB = connectionUri.includes('tidbcloud.com') || env.DB_SSL === 'true' || env.DB_SSL === '1';
		return mysql.createPool({
			uri: connectionUri,
			waitForConnections: true,
			connectionLimit: 10,
			enableKeepAlive: true,
			keepAliveInitialDelay: 10000,
			charset: 'utf8mb4',
			...(isTiDB
				? {
						ssl: {
							minVersion: 'TLSv1.2',
							rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
						}
				  }
				: {})
		});
	}

	// 2. Opsi Parameter Individual (Local MySQL / MariaDB atau TiDB Serverless)
	const host = cleanEnv(env.TIDB_HOST || env.DB_HOST || '127.0.0.1');
	const isTiDB = host.includes('tidbcloud.com') || !!env.TIDB_HOST;
	const defaultPort = isTiDB ? 4000 : 3306;
	const port = Number(cleanEnv(env.TIDB_PORT || env.DB_PORT)) || defaultPort;

	const user = cleanEnv(env.TIDB_USER || env.DB_USER || env.DB_USERNAME) || 'travel';
	const rawPassword = env.TIDB_PASSWORD !== undefined ? env.TIDB_PASSWORD : (env.DB_PASSWORD || '');
	const password = cleanEnv(rawPassword) ?? '';
	const database = cleanEnv(env.TIDB_DATABASE || env.TIDB_DB_NAME || env.DB_NAME || env.DB_DATABASE) || 'db_tiket';

	// TiDB Cloud mewajibkan enkripsi TLS v1.2
	const isSSL = isTiDB || env.DB_SSL === 'true' || env.DB_SSL === '1';
	const sslConfig = isSSL
		? {
				minVersion: 'TLSv1.2',
				rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
		  }
		: undefined;

	return mysql.createPool({
		host,
		port,
		user,
		password,
		database,
		ssl: sslConfig,
		waitForConnections: true,
		connectionLimit: 10,
		enableKeepAlive: true,
		keepAliveInitialDelay: 10000,
		charset: 'utf8mb4'
	});
}

export const pool = createDatabasePool();
