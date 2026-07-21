import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhqqjungilusfiyvmhcg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocXFqdW5naWx1c2ZpeXZtaGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzQ0NzMsImV4cCI6MjA5Njc1MDQ3M30.53sIPO7rdJZJktrg0J9Z8JOxewvv_HE-qee4UKkEefI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('treinos_html').select('*');
  if (error) console.error(error);
  else {
    data.forEach(tr => {
      console.log(`User: ${tr.user_id}`);
      try {
        const parsed = JSON.parse(tr.html_content);
        console.log(`  finishedSplits:`, parsed.finishedSplits);
        if (parsed.exercises && parsed.exercises.length > 0) {
           console.log(`  exercises status (first 3):`, parsed.exercises.slice(0,3).map(e => `${e.id}: ${e.status}`));
        } else {
           console.log(`  exercises: 0`);
        }
      } catch (e) {
        console.log(`  error parsing`);
      }
    });
  }
}

check();
