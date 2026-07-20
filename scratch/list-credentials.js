import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Senha do banco de dados fornecida anteriormente pelo usuário: yCU9GHogKLof0y48
const connectionString = `postgres://postgres:yCU9GHogKLof0y48@db.xhqqjungilusfiyvmhcg.supabase.co:5432/postgres`;

async function main() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Conectado ao Supabase!');
    const res = await client.query('SELECT id, role, plano_vip, dados_pessoais FROM users');
    console.log('--- LISTA DE USUÁRIOS E CREDENCIAIS ---');
    res.rows.forEach(row => {
      const dp = row.dados_pessoais || {};
      console.log(`Nome: ${dp.name || 'N/A'}`);
      console.log(`Email: ${dp.email || 'N/A'}`);
      console.log(`Senha: ${dp.password || '123'}`);
      console.log(`Role: ${row.role}`);
      console.log(`VIP: ${row.plano_vip}`);
      console.log('--------------------------------------');
    });
  } catch (e) {
    console.error('Erro ao consultar banco:', e);
  } finally {
    await client.end();
  }
}

main();
