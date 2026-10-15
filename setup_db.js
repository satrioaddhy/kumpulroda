// =========================================================================
// KUMPULRODA — DATABASE SCRIPT RUNNER
//
// Kredensial database TIDAK BOLEH ditulis di file ini. Isi DATABASE_URL di .env:
//   DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres
//
// Pemakaian:
//   node setup_db.js migrations/20261014_security_finance.sql   -> jalankan migrasi (aman, idempotent)
//   node setup_db.js supabase_schema.sql --reset                 -> RESET TOTAL (hapus semua data!)
// =========================================================================
import fs from 'fs';
import pg from 'pg';

const { Client } = pg;

// Muat .env (Node >= 20.12 / 21.7)
if (fs.existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}

const connectionString = process.env.DATABASE_URL;
const [, , sqlFile, ...flags] = process.argv;

if (!connectionString) {
  console.error('DATABASE_URL belum diatur. Tambahkan ke file .env (lihat .env.example).');
  process.exit(1);
}

if (!sqlFile) {
  console.error('Sebutkan file SQL yang ingin dijalankan. Contoh: node setup_db.js migrations/20261014_security_finance.sql');
  process.exit(1);
}

if (!fs.existsSync(sqlFile)) {
  console.error(`File tidak ditemukan: ${sqlFile}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlFile, 'utf8');
const isDestructive = /\bdrop\s+(table|publication|schema)\b/i.test(sql);

if (isDestructive && !flags.includes('--reset')) {
  console.error(
    `File "${sqlFile}" berisi perintah DROP yang akan MENGHAPUS DATA.\n` +
    'Jika Anda benar-benar ingin mereset database, jalankan ulang dengan flag --reset.'
  );
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Terhubung ke Supabase PostgreSQL.');
    await client.query(sql);
    console.log(`Berhasil menjalankan ${sqlFile}`);
  } catch (err) {
    console.error('Gagal menjalankan SQL:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
