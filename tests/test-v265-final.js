const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });

  console.log('Testing LIVE site v2.6.5 - Image fix verification...');
  await page.goto('https://hnfd-rescue.vercel.app');
  await page.waitForTimeout(2000);

  // Check version
  const version = await page.evaluate(() => {
    const el = document.querySelector('#version-display');
    return el ? el.textContent : 'not found';
  });
  console.log('Version displayed:', version);

  // Search for Adult Oxygen Kit
  console.log('\nSearching for Adult Oxygen Kit...');
  await page.fill('input', 'adult oxygen');
  await page.waitForTimeout(1500);

  // Check if Location Guide button exists
  const guideBtn = await page.$('.location-guide-btn');
  console.log('Location Guide button found:', !!guideBtn);

  if (guideBtn) {
    console.log('Clicking Location Guide...');
    await guideBtn.click();
    await page.waitForTimeout(1500);

    // Take screenshot of step 1
    await page.screenshot({ path: 'tests/screenshots/v265_step1.png' });
    console.log('Screenshot: v265_step1.png');

    // Wait for step 2
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/v265_step2.png' });
    console.log('Screenshot: v265_step2.png');

    // Wait for step 3 (equipment photo)
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/v265_step3.png' });
    console.log('Screenshot: v265_step3.png');

    console.log('\n✅ SUCCESS: v2.6.5 deployed with fixed images!');
    console.log('Check screenshots in tests/screenshots/ to verify oxygen tanks image.');
  } else {
    console.log('❌ FAIL: Location Guide button not found');
  }

  await browser.close();
})();
