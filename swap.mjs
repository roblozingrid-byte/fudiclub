import fs from 'fs';

fs.renameSync('index.html', 'proximamente.html');
fs.renameSync('app.html', 'index.html');
console.log('Swapped index.html and app.html');
