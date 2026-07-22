const fs = require('fs');
let txt = fs.readFileSync('src/views/Aluno.jsx', 'utf8');

const regex = /const currentLoadVal = formData\[realLoadKey\];\s*const repsCount = defaultRepsSets\.reps;/m;

const replacement = `const currentSetsVal = formData[realSetsKey] !== undefined ? formData[realSetsKey] : defaultRepsSets.sets;
                        const currentLoadVal = formData[realLoadKey] !== undefined ? formData[realLoadKey] : '';
                        const repsCount = defaultRepsSets.reps;`;

txt = txt.replace(regex, replacement);
fs.writeFileSync('src/views/Aluno.jsx', txt);
