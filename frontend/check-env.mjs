import fs from 'fs';
import path from 'path';

const checks = [
  'node_modules/jsdom',
  'node_modules/@playwright',
  'node_modules/puppeteer',
  'node_modules/.bin/vite',
];

const base = 'D:/MortgageWebsite/frontend';
checks.forEach(p => {
  const exists = fs.existsSync(path.join(base, p));
  console.log(`${exists ? 'EXISTS' : 'MISSING'}: ${p}`);
});