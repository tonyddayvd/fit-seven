import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhqqjungilusfiyvmhcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXFqdW5naWx1c2ZpeXZtaGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzQ0NzMsImV4cCI6MjA5Njc1MDQ3M30.53sIPO7rdJZJktrg0J9Z8JOxewvv_HE-qee4UKkEefI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching evaluations...');
  
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*');
    
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  const pending = data.filter(ev => ev._status !== 'approved');
  console.log(`Found ${pending.length} pending evaluations.`);
  
  for (const ev of pending) {
    const { error: delError } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('id', ev.id);
      
    if (delError) {
      console.error('Error deleting', ev.id, ':', delError);
    } else {
      console.log('Deleted', ev.id);
    }
  }
}

run();
