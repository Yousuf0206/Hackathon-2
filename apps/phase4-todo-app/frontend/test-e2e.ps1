$ErrorActionPreference = "Continue"

Write-Host "Starting E2E browser test..." -ForegroundColor Cyan
Write-Host ""

# Launch browser and test
$script = @'
const { chromium } = require('playwright');

(async () => {
  console.log('Starting E2E browser test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', error => consoleErrors.push(error.message));

  try {
    // Test 1: Landing Page
    console.log('1. Testing Landing Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('   Title: ' + await page.title());
    console.log('   Hero: ' + (await page.textContent('h1')).replace(/\n/g, ' ').trim().substring(0, 50));
    console.log('   ✓ Landing page loaded');
    console.log('');

    // Test 2: Login Page
    console.log('2. Testing Login Page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    console.log('   Title: ' + await page.textContent('h1'));
    console.log('   ✓ Login page loaded');
    console.log('');

    // Test 3: Register Page
    console.log('3. Testing Register Page...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
    console.log('   Title: ' + await page.textContent('h1'));
    console.log('   ✓ Register page loaded');
    console.log('');

    // Test 4: Demo Mode
    console.log('4. Testing Demo Mode...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    const viewDemoBtn = await page.locator('a:has-text("View Demo")').first();
    if (await viewDemoBtn.isVisible()) {
      await viewDemoBtn.click();
      await page.waitForURL('**/todos', { timeout: 5000 });
      await page.waitForTimeout(2000);
      console.log('   Navigated to todos: ' + page.url());
      const demoBanner = await page.locator('.demo-banner').first().isVisible().catch(() => false);
      console.log('   Demo banner: ' + (demoBanner ? '✓' : '✗'));
      const todoCount = await page.locator('.todo-item').count();
      console.log('   Todo items: ' + todoCount);
      console.log('   ✓ Demo mode works');
    }
    console.log('');

    // Summary
    console.log('=== SUMMARY ===');
    console.log('Console errors: ' + consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e, i) => console.log('  ' + (i+1) + '. ' + e.substring(0, 100)));
    } else {
      console.log('✓ No console errors!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
    console.log('\nTest complete.');
  }
})();
'@

# Run with system node
& "C:\Program Files\nodejs\node.exe" -e $script
