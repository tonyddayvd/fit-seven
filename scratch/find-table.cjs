const fs = require('fs');
const content = fs.readFileSync('src/context/AppContext.jsx', 'utf8');

const fetchIndex = content.indexOf('fetchPendingEvaluations');
const section = content.substring(fetchIndex, fetchIndex + 1000);

const fromMatch = section.match(/supabase\.from\(['"]([^'"]+)['"]\)/);
if (fromMatch) {
  console.log('Table:', fromMatch[1]);
} else {
  console.log('Not found in context snippet');
}
