import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhqqjungilusfiyvmhcg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXFqdW5naWx1c2ZpeXZtaGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzQ0NzMsImV4cCI6MjA5Njc1MDQ3M30.53sIPO7rdJZJktrg0J9Z8JOxewvv_HE-qee4UKkEefI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log('Testando busca geral após limpeza...');
  const { data, error } = await supabase.from('avaliacoes').select('*');
  if (error) {
    console.error('Erro na busca:', error);
  } else {
    console.log('Sucesso! Quantidade de registros:', data.length);
    console.log('Registros:', data.map(item => item.id));
  }
}

testFetch();
