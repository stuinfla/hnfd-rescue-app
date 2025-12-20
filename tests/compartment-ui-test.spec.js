// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('v2.9.4 Compartment Browser UI Test', () => {

  test('Full UI walkthrough with screenshots', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Dismiss any modals
    await page.evaluate(() => {
      document.querySelectorAll('#install-prompt, #mic-onboarding-modal, .admin-modal').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('visible', 'active');
      });
    });
    await page.waitForTimeout(500);

    // Screenshot 1: Home screen
    await page.screenshot({ path: 'tests/screenshots/v294-home.png', fullPage: true });
    console.log('✓ Screenshot: Home screen');

    // Check browse buttons exist
    const azBtn = page.locator('#azBrowseBtn');
    const compartmentBtn = page.locator('#compartmentBrowseBtn');
    await expect(azBtn).toBeVisible();
    await expect(compartmentBtn).toBeVisible();
    console.log('✓ Both browse buttons visible');

    // Screenshot 2: Click "By Compartment" button
    await compartmentBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'tests/screenshots/v294-compartment-browse.png' });
    console.log('✓ Screenshot: Compartment browser modal');

    // Check compartment cards are visible
    const compartmentCards = page.locator('.compartment-card');
    const cardCount = await compartmentCards.count();
    console.log(`✓ Found ${cardCount} compartment cards`);
    expect(cardCount).toBeGreaterThanOrEqual(8);

    // Screenshot 3: Click first compartment to see detail
    await compartmentCards.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/v294-compartment-detail.png' });
    console.log('✓ Screenshot: Compartment detail view');

    // Close detail overlay
    await page.locator('.compartment-detail-close').click();
    await page.waitForTimeout(300);

    // Screenshot 4: Test A-Z browse
    await azBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/v294-az-browse.png' });
    console.log('✓ Screenshot: A-Z browse modal');

    // Close A-Z modal
    await page.locator('#az-close-btn').click();
    await page.waitForTimeout(300);

    // Screenshot 5: Test search
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('trauma bag');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/v294-search-result.png' });
    console.log('✓ Screenshot: Search result');

    // Screenshot 6: Test quick buttons
    await searchInput.clear();
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/v294-quick-buttons.png' });
    console.log('✓ Screenshot: Quick access buttons');

    // Click AED quick button
    await page.locator('button[data-search="AED"]').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/v294-aed-result.png' });
    console.log('✓ Screenshot: AED quick search result');

    console.log('\n=== ALL UI TESTS PASSED ===');
  });

});
