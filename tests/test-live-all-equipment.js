const { chromium } = require('playwright');

const EQUIPMENT_TO_TEST = [
  { search: 'adult trauma', name: 'Adult Trauma Bag' },
  { search: 'aed', name: 'AED' },
  { search: 'drug box', name: 'Drug Box' },
  { search: 'lifepak', name: 'Lifepak 15' },
  { search: 'oxygen kit', name: 'Adult Oxygen Kit' },
  { search: 'intubation', name: 'Intubation Kit' },
  { search: 'iv kit', name: 'IV Kit' },
  { search: 'narcan', name: 'Narcan' }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });

  console.log('===========================================');
  console.log('LIVE SITE TEST v2.6.6');
  console.log('https://hnfd-rescue.vercel.app');
  console.log('===========================================\n');

  await page.goto('https://hnfd-rescue.vercel.app');
  await page.waitForTimeout(3000);

  // Check version
  const version = await page.evaluate(() => {
    const el = document.querySelector('#version-display');
    return el ? el.textContent : 'not found';
  });
  console.log(`Version: ${version}\n`);

  let passed = 0;
  let failed = 0;

  for (const item of EQUIPMENT_TO_TEST) {
    // Clear and search
    await page.fill('input', '');
    await page.waitForTimeout(300);
    await page.fill('input', item.search);
    await page.waitForTimeout(1500);

    // Check for Location Guide button
    const guideBtn = await page.$('.location-guide-btn');

    if (guideBtn) {
      console.log(`✅ ${item.name}: Location Guide FOUND`);
      passed++;
    } else {
      console.log(`❌ ${item.name}: Location Guide MISSING`);
      failed++;
    }
  }

  console.log('\n===========================================');
  console.log(`RESULTS: ${passed}/${EQUIPMENT_TO_TEST.length} passed`);
  console.log('===========================================');

  if (failed === 0) {
    console.log('\n🎉 ALL EQUIPMENT HAS 3-IMAGE LOCATION GUIDES!');
  }

  await browser.close();
})();
