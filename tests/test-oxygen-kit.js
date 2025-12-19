const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });

  // Test against LOCAL files first
  console.log('Testing LOCAL version...');
  await page.goto('file:///Users/stuartkerr/Code/AMBUILANCE_INVENTORY/index.html');
  await page.waitForTimeout(2000);

  // Search for Adult Oxygen Kit
  console.log('Searching for Adult Oxygen Kit...');
  await page.fill('input', 'adult oxygen');
  await page.waitForTimeout(1500);

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/test_oxygen_search.png' });

  // Check if Location Guide button exists
  const guideBtn = await page.$('.location-guide-btn');
  console.log('Location Guide button found:', !!guideBtn);

  if (guideBtn) {
    console.log('SUCCESS: Adult Oxygen Kit has location guide button!');
    await guideBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/test_oxygen_guide.png' });

    const modal = await page.$('.guide-modal');
    console.log('Guide modal appeared:', !!modal);
  } else {
    console.log('ERROR: No location guide button for Adult Oxygen Kit');

    // Debug - get HTML
    const html = await page.evaluate(() => document.querySelector('#results')?.innerHTML || 'No results');
    console.log('Results HTML:', html.substring(0, 1500));
  }

  await browser.close();
})();
