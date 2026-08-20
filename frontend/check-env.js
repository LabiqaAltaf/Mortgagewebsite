const fs = require('fs');
const path = require('path');

// Check what's available
const checks = [
  'node_modules/jsdom',
  'node_modules/@playwright',
  'node_modules/puppeteer',
  'node_modules/.bin/eslint',
  'node_modules/.bin/vite',
];

checks.forEach(p => {
  const exists = fs.existsSync(path.join('D:/MortgageWebsite/frontend', p));
  console.log(`${exists ? 'EXISTS' : 'MISSING'}: ${p}`);
});

// Check if node_modules exists
console.log('---');
console.log('node_modules exists:', fs.existsSync('D:/MortgageWebsite/frontend/node_modules'));