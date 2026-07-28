import { supabase } from '../src/supabase.js';

async function clearPending() {
  console.log('Clearing pending evaluations...');
  
  // First, check what's there
  const { data: evals, error: fetchErr } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('status', 'pendente');
    
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }
  
  console.log('Found pending evaluations:', evals?.length || 0);
  
  if (evals && evals.length > 0) {
    const { error: delErr } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('status', 'pendente');
      
    if (delErr) {
      console.error('Delete error:', delErr);
    } else {
      console.log('Successfully deleted pending evaluations');
    }
  }
}

clearPending();
