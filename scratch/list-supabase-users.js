import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhqqjungilusfiyvmhcg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXFqdW5naWx1c2ZpeXZtaGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzQ0NzMsImV4cCI6MjA5Njc1MDQ3M30.53sIPO7rdJZJktrg0J9Z8JOxewvv_HE-qee4UKkEefI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('--- CREDENCIAIS DOS USUÁRIOS NO SUPABASE ---');
    data.forEach(u => {
      const dp = u.dados_pessoais || {};
      console.log(`Nome: ${dp.name || 'N/A'}`);
      console.log(`Email: ${dp.email || 'N/A'}`);
      console.log(`Senha: ${dp.password || '123'}`);
      console.log(`Role: ${u.role}`);
      console.log('------------------------------------');
    });
  }
}

main();
