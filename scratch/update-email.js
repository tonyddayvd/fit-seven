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
    
    // Obter dados pessoais de Lisiane
    const res = await client.query("SELECT dados_pessoais FROM users WHERE id = 'u1781191554724'");
    if (res.rows.length > 0) {
      const dp = res.rows[0].dados_pessoais;
      dp.email = 'lisiane_vieira_alves8@gmail.com';
      
      await client.query(
        "UPDATE users SET dados_pessoais = $1 WHERE id = 'u1781191554724'",
        [JSON.stringify(dp)]
      );
      console.log('E-mail atualizado com sucesso para lisiane_vieira_alves8@gmail.com!');
    } else {
      console.log('Lisiane não encontrada com o ID especificado.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

main();
