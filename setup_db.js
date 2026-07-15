import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:9D1UU61pQSieSBPj@db.hdtezmmjkepkyemwuoox.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');
    const sql = fs.readFileSync('supabase_schema.sql', 'utf8');
    await client.query(sql);
    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await client.end();
  }
}

run();
