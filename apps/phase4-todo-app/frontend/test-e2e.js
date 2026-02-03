const { chromium } = require('playwright');

(async () => {
  console.log('Starting E2E browser test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track console messages and errors
  const consoleMessages = [];
  const consoleErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(`Page Error: ${error.message}`);
  });

  try {
    // Test 1: Landing Page
    console.log('1. Testing Landing Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`   Title: ${title}`);

    const heroTitle = await page.textContent('h1');
    console.log(`   Hero: ${heroTitle.replace(/\n/g, ' ').trim()}`);

    // Check for Sign In and Get Started buttons
    const signInBtn = await page.locator('a:has-text("Sign In")').first();
    const getStartedBtn = await page.locator('a:has-text("Get Started")').first();
    console.log(`   Sign In button: ${await signInBtn.isVisible() ? '✓' : '✗'}`);
    console.log(`   Get Started button: ${await getStartedBtn.isVisible() ? '✓' : '✗'}`);
    console.log('');

    // Test 2: Login Page
    console.log('2. Testing Login Page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    const loginTitle = await page.textContent('h1');
    console.log(`   Title: ${loginTitle}`);

    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    const loginBtn = await page.locator('button:has-text("Sign In")').first();
    console.log(`   Email input: ${await emailInput.isVisible() ? '✓' : '✗'}`);
    console.log(`   Password input: ${await passwordInput.isVisible() ? '✓' : '✗'}`);
    console.log(`   Sign In button: ${await loginBtn.isVisible() ? '✓' : '✗'}`);
    console.log('');

    // Test 3: Register Page
    console.log('3. Testing Register Page...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
    const registerTitle = await page.textContent('h1');
    console.log(`   Title: ${registerTitle}`);

    const regEmailInput = await page.locator('input[type="email"]').first();
    const regPasswordInput = await page.locator('input[type="password"]').first();
    const regBtn = await page.locator('button:has-text("Create Account")').first();
    console.log(`   Email input: ${await regEmailInput.isVisible() ? '✓' : '✗'}`);
    console.log(`   Password input: ${await regPasswordInput.isVisible() ? '✓' : '✗'}`);
    console.log(`   Create Account button: ${await regBtn.isVisible() ? '✓' : '✗'}`);
    console.log('');

    // Test 4: Demo Mode (View Demo button)
    console.log('4. Testing Demo Mode...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    const viewDemoBtn = await page.locator('a:has-text("View Demo")').first();
    if (await viewDemoBtn.isVisible()) {
      await viewDemoBtn.click();
      await page.waitForURL('**/todos', { timeout: 5000 });
      console.log('   Navigated to todos page via View Demo');

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Check if todos page loaded
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);

      // Check for demo banner
      const demoBanner = await page.locator('.demo-banner').first();
      const hasDemoBanner = await demoBanner.isVisible().catch(() => false);
      console.log(`   Demo banner visible: ${hasDemoBanner ? '✓' : '✗'}`);

      // Check for todos
      const todoItems = await page.locator('.todo-item').count();
      console.log(`   Todo items displayed: ${todoItems}`);

      // Check for stats cards
      const statCards = await page.locator('.stat-card').count();
      console.log(`   Stat cards: ${statCards}`);

      // Check for add todo form
      const todoForm = await page.locator('.todo-form, [class*="form"]').first();
      console.log(`   Todo form visible: ${await todoForm.isVisible() ? '✓' : '✗'}`);
    } else {
      console.log('   View Demo button not found');
    }
    console.log('');

    // Test 5: Login with test user
    console.log('5. Testing User Registration & Login...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });

    const testEmail = `testuser_${Date.now()}@example.com`;
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Create Account")');

    // Wait for navigation or response
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    console.log(`   Registration response URL: ${finalUrl}`);

    if (finalUrl.includes('todos')) {
      console.log('   ✓ Successfully registered and redirected to todos!');
    } else {
      console.log('   Checking if user already exists or error...');
    }
    console.log('');

    // Summary
    console.log('=== TEST SUMMARY ===');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);

    if (consoleErrors.length > 0) {
      console.log('\nConsole Errors:');
      consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    } else {
      console.log('\n✓ No console errors detected!');
    }

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\nBrowser test completed.');
  }
})();
