import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

function loadEnv() {
	const envPath = path.resolve(process.cwd(), '.env');
	if (!fs.existsSync(envPath)) return {};
	const content = fs.readFileSync(envPath, 'utf-8');
	const parsed = {};
	for (const line of content.split('\n')) {
		const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
		if (match) {
			let val = match[2] || '';
			if ((val.startsWith('\'') && val.endsWith('\'')) || (val.startsWith('"') && val.endsWith('"'))) {
				val = val.slice(1, -1);
			}
			parsed[match[1]] = val;
		}
	}
	return parsed;
}

async function runMigration() {
	const env = loadEnv();
	const host = env.TIDB_HOST || env.DB_HOST || '127.0.0.1';
	const isTiDB = host.includes('tidbcloud.com') || !!env.TIDB_HOST;
	const port = Number(env.TIDB_PORT || env.DB_PORT) || (isTiDB ? 4000 : 3306);
	const user = env.TIDB_USER || env.DB_USER || env.DB_USERNAME || 'root';
	const password = env.TIDB_PASSWORD !== undefined ? env.TIDB_PASSWORD : (env.DB_PASSWORD || '');
	const database = env.TIDB_DATABASE || env.TIDB_DB_NAME || env.DB_NAME || env.DB_DATABASE || 'ticketgo';

	console.log(`Menghubungkan ke ${host}:${port} (Database: ${database}, User: ${user})...`);

	const conn = await mysql.createConnection({
		host,
		port,
		user,
		password,
		database,
		ssl: isTiDB ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
		multipleStatements: true
	});

	console.log('Koneksi berhasil! Membaca scripts/schema.sql...');
	const sqlPath = path.resolve(process.cwd(), 'scripts/schema.sql');
	const sql = fs.readFileSync(sqlPath, 'utf-8');

	console.log('Menjalankan migrasi DDL & seed data...');
	await conn.query(sql);

	const [tables] = await conn.query('SHOW TABLES');
	console.log('Migrasi selesai! Daftar tabel di database:', tables);

	await conn.end();
}

runMigration().catch((err) => {
	console.error('Migrasi gagal:', err.message);
	process.exit(1);
});
