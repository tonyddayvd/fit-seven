import fetch from 'node-fetch';

const SUPABASE_URL = 'https://xhqqjungilusfiyvmhcg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXFqdW5naWx1c2ZpeXZtaGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzQ0NzMsImV4cCI6MjA5Njc1MDQ3M30.53sIPO7rdJZJktrg0J9Z8JOxewvv_HE-qee4UKkEefI';

// Como a anon key não permite DDL, vamos verificar se podemos usar a função upsert com as novas colunas
// e se o banco já tem as colunas via tentativa de insert com status
async function main() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/avaliacoes?select=id,status,approved_at&limit=1`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  const text = await response.text();
  console.log('Status HTTP:', response.status);
  console.log('Resposta:', text);
}

main();
