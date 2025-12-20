const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });

  console.log('Testing LIVE site v2.6.4...');
  await page.goto('https://hnfd-rescue.vercel.app');
  await page.waitForTimeout(2000);

  // Search for Adult Oxygen Kit
  console.log('Searching for Adult Oxygen Kit...');
  await page.fill('input', 'adult oxygen');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'tests/screenshots/oxygen_search.png' });
  console.log('Screenshot: oxygen_search.png');

  // Check if Location Guide button exists
  const guideBtn = await page.$('.location-guide-btn');
  console.log('Location Guide button found:', !!guideBtn);

  if (guideBtn) {
    console.log('Clicking Location Guide...');
    await guideBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/oxygen_guide_step1.png' });

    // Wait for rotations
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/oxygen_guide_step2.png' });

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/oxygen_guide_step3.png' });

    console.log('SUCCESS: Adult Oxygen Kit location guide is working!');
  } else {
    console.log('FAIL: Location Guide button not found');
  }

  await browser.close();
})();
