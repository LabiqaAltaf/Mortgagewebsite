import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://localhost:5174/';

const browser = await puppeteer.launch({
  headless: true,
  // Use system Chrome if available, otherwise use the bundled one
});

const page = await browser.newPage();

const consoleErrors = [];
const pageErrors = [];

page.on('console', (msg) => {
  const type = msg.type();
  const text = msg.text();
  if (type === 'error' || type === 'warning') {
    consoleErrors.push(`[console ${type}] ${text}`);
  }
});

page.on('pageerror', (err) => {
  pageErrors.push(`[pageerror] ${err.message}\n${err.stack}`);
});

page.on('requestfailed', (req) => {
  const url = req.url();
  const err = req.failure();
  consoleErrors.push(`[requestfailed] ${url} - ${err?.errorText || err?.errorCode || 'unknown'}`);
});

try {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
  
  // Wait a bit for React to render
  await new Promise(r => setTimeout(r, 3000));
  
  // Get the page content
  const content = await page.content();
  const rootHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return 'ROOT NOT FOUND';
    return root.innerHTML.substring(0, 5000);
  });
  
  console.log('=== ROOT INNER HTML (first 5000 chars) ===');
  console.log(rootHTML);
  console.log('=== ROOT INNER HTML LENGTH ===');
  console.log(rootHTML.length);
  console.log('=== CONSOLE ERRORS ===');
  consoleErrors.forEach(e => console.log(e));
  console.log('=== PAGE ERRORS ===');
  pageErrors.forEach(e => console.log(e));
  console.log('=== ALL CONSOLE messages ===');
} catch (e) {
  console.error('Error loading page:', e.message);
} finally {
  await browser.close();
}
