const fs = require('fs');
const path = require('path');

// Simple smoke checks: build exists (can be run by CI) and key files present
const root = path.resolve(__dirname, '..');
const required = [
  'pages/bible.js',
  'components/Header.js',
  'package.json'
];
let ok = true;
for (const f of required) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) {
    console.error('Missing required file:', f);
    ok = false;
  }
}
if (!ok) process.exit(2);
console.log('smoke: ok');
process.exit(0);
