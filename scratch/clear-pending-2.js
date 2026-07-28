import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhqqjungilusfiyvmhcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXFqdW5naWx1c2ZpeXZtaGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzQ0NzMsImV4cCI6MjA5Njc1MDQ3M30.53sIPO7rdJZJktrg0J9Z8JOxewvv_HE-qee4UKkEefI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching pending evaluations...');
  
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('status', 'pendente');
    
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log(`Found ${data.length} pending evaluations.`);
  
  if (data.length > 0) {
    const { error: delError } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('status', 'pendente');
      
    if (delError) {
      console.error('Error deleting:', delError);
    } else {
      console.log('Successfully cleared all pending evaluations.');
    }
  }
}

run();
