require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testSubmit() {
  const formData = {
    workoutCompleted: true,
    split: 'A',
    observations: 'Treino do split A concluído com sucesso.',
    peso: null
  };
  
  const evalId = `eval-${Date.now()}`;
  const newEval = {
    id: evalId,
    userId: 'u3',
    userName: 'Aluno Teste',
    tenantId: 't1',
    date: new Date().toLocaleDateString('pt-BR'),
    formData: {
      ...formData,
      userId: 'u3',
      tenantId: 't1'
    },
    aiSuggestedWorkout: { recommendedSplits: 3 },
    ...(formData.workoutCompleted ? { _approvedAt: new Date().toISOString(), _approvedBy: 'Auto' } : {})
  };

  const { error } = await s.from('avaliacoes').insert({
    id: evalId,
    tenant_id: 't1',
    user_id: 'u3',
    medidas: newEval,
    fotos_urls: formData.fotos || {}
  });

  if (error) {
    console.error('ERROR inserting eval:', error);
  } else {
    console.log('SUCCESS inserting eval');
  }
}

testSubmit();
