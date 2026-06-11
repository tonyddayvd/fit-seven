import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const connectionString = `postgres://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.xhqqjungilusfiyvmhcg.supabase.co:5432/postgres`;

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Conectado!');
    const res = await client.query('SELECT id, role, plano_vip, dados_pessoais FROM users');
    console.log('--- USUÁRIOS NO BANCO ---');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

main();
