const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });

  console.log('Loading app...');
  await page.goto('https://hnfd-rescue.vercel.app');
  await page.waitForTimeout(2000);

  // Search for AED
  console.log('Searching for AED...');
  await page.fill('input', 'AED');
  await page.waitForTimeout(1500);

  // Take screenshot of results
  await page.screenshot({ path: 'tests/screenshots/test_search_results.png' });
  console.log('Screenshot saved: test_search_results.png');

  // Check if Location Guide button exists
  const guideBtn = await page.$('.location-guide-btn');
  console.log('Location Guide button found:', !!guideBtn);

  if (guideBtn) {
    console.log('Clicking Location Guide button...');
    await guideBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/test_location_guide_step1.png' });
    console.log('Screenshot saved: test_location_guide_step1.png');

    // Check if modal appeared
    const modal = await page.$('.guide-modal');
    console.log('Guide modal appeared:', !!modal);

    if (modal) {
      // Wait for rotation
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/test_location_guide_step2.png' });
      console.log('Screenshot saved: test_location_guide_step2.png');

      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/test_location_guide_step3.png' });
      console.log('Screenshot saved: test_location_guide_step3.png');

      console.log('SUCCESS: Location guide is working!');
    }
  } else {
    console.log('ERROR: Location Guide button NOT FOUND!');

    // Get the HTML of results to debug
    const resultsHtml = await page.evaluate(() => {
      const el = document.querySelector('#results');
      return el ? el.innerHTML : 'No results element found';
    });
    console.log('Results HTML preview:');
    console.log(resultsHtml.substring(0, 2000));
  }

  await browser.close();
})();
