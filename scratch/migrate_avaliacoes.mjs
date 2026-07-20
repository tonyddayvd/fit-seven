import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xhqqjungilusfiyvmhcg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXFqdW5naWx1c2ZpeXZtaGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzQ0NzMsImV4cCI6MjA5Njc1MDQ3M30.53sIPO7rdJZJktrg0J9Z8JOxewvv_HE-qee4UKkEefI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


async function main() {
  // Verificar estrutura atual tentando ler com as colunas novas
  console.log('--- Verificando tabela avaliacoes ---');
  const { data: evals, error: readErr } = await supabase
    .from('avaliacoes')
    .select('id, status, approved_at, user_id')
    .limit(10);
  
  if (readErr) {
    console.log('Colunas status/approved_at não existem ainda:', readErr.message);
    console.log('=> É necessário adicionar as colunas manualmente no Supabase Dashboard:');
    console.log('   SQL a executar no SQL Editor do Supabase:');
    console.log('   ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'pending\';');
    console.log('   ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;');
    console.log('   UPDATE avaliacoes SET status = \'pending\' WHERE status IS NULL;');
  } else {
    console.log('Colunas já existem! Registros:', JSON.stringify(evals, null, 2));
    
    // Atualizar registros sem status
    const { error: updateErr } = await supabase
      .from('avaliacoes')
      .update({ status: 'pending' })
      .is('status', null);
    
    if (updateErr) console.log('Erro ao atualizar status:', updateErr.message);
    else console.log('Todos os registros sem status foram marcados como pending');
  }
}

main();
