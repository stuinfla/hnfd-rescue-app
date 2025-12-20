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
  console.log('COMPREHENSIVE EQUIPMENT TEST v2.6.6');
  console.log('Testing ALL equipment location guides');
  console.log('===========================================\n');

  await page.goto('file:///Users/stuartkerr/Code/AMBUILANCE_INVENTORY/index.html');
  await page.waitForTimeout(2000);

  let passed = 0;
  let failed = 0;

  for (const item of EQUIPMENT_TO_TEST) {
    // Clear search and search for item
    await page.fill('input', '');
    await page.fill('input', item.search);
    await page.waitForTimeout(1000);

    // Check for Location Guide button
    const guideBtn = await page.$('.location-guide-btn');

    if (guideBtn) {
      console.log(`✅ ${item.name}: Location Guide button FOUND`);
      passed++;
    } else {
      console.log(`❌ ${item.name}: Location Guide button MISSING`);
      failed++;
    }
  }

  console.log('\n===========================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('===========================================');

  if (failed === 0) {
    console.log('\n🎉 ALL EQUIPMENT HAS LOCATION GUIDES!');
  } else {
    console.log('\n⚠️  Some equipment missing location guides');
  }

  await browser.close();
})();
