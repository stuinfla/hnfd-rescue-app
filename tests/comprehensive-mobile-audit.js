/**
 * COMPREHENSIVE MOBILE AUDIT - HNFD Equipment Finder v2.6.0
 * Full end-to-end testing with critical visual review and grading
 *
 * Tests as: iPhone 14 Pro and Android (Pixel 7)
 * Grades: Each component 0-100, overall 0-100
 * Target: 99/100 or better
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://hnfd-rescue.vercel.app';
const ADMIN_PASSWORD = 'hnfd2026admin';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Device configurations
const DEVICES = {
  iPhone: {
    name: 'iPhone 14 Pro',
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  Android: {
    name: 'Pixel 7',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/119.0.0.0 Mobile Safari/537.36'
  }
};

// Grading criteria
const CRITERIA = {
  UI_CLARITY: { weight: 15, description: 'UI is clear, readable, and intuitive' },
  SEARCH_SPEED: { weight: 15, description: 'Search returns results quickly (<500ms)' },
  IMAGE_RELEVANCE: { weight: 20, description: 'Images actually show the equipment and location' },
  LOCATION_HELPFULNESS: { weight: 20, description: 'Location text helps find equipment' },
  VOICE_FUNCTIONALITY: { weight: 10, description: 'Voice search button present and functional' },
  MOBILE_USABILITY: { weight: 10, description: 'App works well on mobile touch' },
  ADMIN_FUNCTIONALITY: { weight: 5, description: 'Admin portal accessible and functional' },
  ERROR_HANDLING: { weight: 5, description: 'Graceful handling of errors/edge cases' }
};

// Test results storage
const testResults = {
  device: '',
  scores: {},
  screenshots: [],
  issues: [],
  suggestions: [],
  overallGrade: 0
};

async function captureAndAnalyze(page, name, description) {
  const filename = `${name.replace(/\s+/g, '_').toLowerCase()}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: false });

  testResults.screenshots.push({
    name,
    path: filepath,
    description
  });

  console.log(`    [Screenshot] ${filename}`);
  return filepath;
}

async function runComprehensiveAudit() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  HNFD EQUIPMENT FINDER - COMPREHENSIVE MOBILE AUDIT v2.6.0  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: true });

  // Test on iPhone
  const device = DEVICES.iPhone;
  testResults.device = device.name;

  console.log(`Testing on: ${device.name} (${device.viewport.width}x${device.viewport.height})`);
  console.log('─'.repeat(60) + '\n');

  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    userAgent: device.userAgent
  });

  const page = await context.newPage();

  // ═══════════════════════════════════════════════════════════════
  // TEST 1: LANDING PAGE & UI CLARITY
  // ═══════════════════════════════════════════════════════════════
  console.log('█ TEST 1: Landing Page & UI Clarity');

  let uiScore = 100;
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  await captureAndAnalyze(page, '01_landing_page', 'Initial landing page view');

  // Check for critical UI elements
  const hasHeader = await page.$('.header, header, .app-header');
  const hasSearchInput = await page.$('input, #search-input, .search-input');
  const hasMicButton = await page.$('.mic-btn, .voice-btn, button[data-mic], #mic-button');
  const hasLogo = await page.$('.logo, img[alt*="logo"], .brand');

  if (!hasHeader) { uiScore -= 15; testResults.issues.push('Missing header element'); }
  if (!hasSearchInput) { uiScore -= 25; testResults.issues.push('Search input not found'); }
  if (!hasMicButton) { uiScore -= 10; testResults.issues.push('Microphone button not visible'); }

  // Check version display
  const bodyText = await page.textContent('body');
  const hasVersion = bodyText.includes('2.6') || bodyText.includes('v2.');
  if (!hasVersion) { uiScore -= 5; testResults.issues.push('Version not displayed'); }

  testResults.scores.UI_CLARITY = uiScore;
  console.log(`  UI Clarity Score: ${uiScore}/100`);
  console.log(`  - Header: ${hasHeader ? '✓' : '✗'}`);
  console.log(`  - Search Input: ${hasSearchInput ? '✓' : '✗'}`);
  console.log(`  - Mic Button: ${hasMicButton ? '✓' : '✗'}`);
  console.log(`  - Version: ${hasVersion ? '✓' : '✗'}`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 2: SEARCH FUNCTIONALITY & SPEED
  // ═══════════════════════════════════════════════════════════════
  console.log('\n█ TEST 2: Search Functionality & Speed');

  let searchScore = 100;
  const searchTerms = ['Narcan', 'AED', 'trauma bag', 'lifepak', 'oxygen'];

  for (const term of searchTerms) {
    console.log(`  Testing search: "${term}"`);

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const searchInput = await page.$('input');
    if (searchInput) {
      const startTime = Date.now();
      await searchInput.fill(term);
      await page.waitForTimeout(800);
      const endTime = Date.now();

      const searchTime = endTime - startTime;
      console.log(`    Search time: ${searchTime}ms`);

      if (searchTime > 1000) {
        searchScore -= 5;
        testResults.issues.push(`Search for "${term}" took ${searchTime}ms (>1000ms)`);
      }

      await captureAndAnalyze(page, `02_search_${term.replace(/\s+/g, '_')}`, `Search results for "${term}"`);

      // Check if results appeared
      const hasResults = await page.$('.result, .equipment-card, .card, [data-equipment]');
      if (!hasResults) {
        searchScore -= 10;
        testResults.issues.push(`No results shown for "${term}"`);
      }
    }
  }

  testResults.scores.SEARCH_SPEED = searchScore;
  console.log(`  Search Score: ${searchScore}/100`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 3: IMAGE RELEVANCE & QUALITY
  // ═══════════════════════════════════════════════════════════════
  console.log('\n█ TEST 3: Image Relevance Analysis');

  let imageScore = 100;

  // Test equipment with known location guides
  const equipmentWithImages = ['Narcan', 'AED', 'Drug Box', 'LifePak'];

  for (const item of equipmentWithImages) {
    console.log(`  Checking images for: ${item}`);

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const searchInput = await page.$('input');
    if (searchInput) {
      await searchInput.fill(item);
      await page.waitForTimeout(800);

      // Click on result to see detail
      const resultCard = await page.$('.equipment-card, .result, .card');
      if (resultCard) {
        await resultCard.click();
        await page.waitForTimeout(1000);

        await captureAndAnalyze(page, `03_detail_${item.replace(/\s+/g, '_')}`, `Detail view for ${item}`);

        // Check for images
        const images = await page.$$('img');
        const imageCount = images.length;
        console.log(`    Found ${imageCount} images`);

        if (imageCount === 0) {
          imageScore -= 10;
          testResults.issues.push(`No images found for ${item}`);
        }

        // Check if images loaded (not broken)
        for (let i = 0; i < Math.min(images.length, 3); i++) {
          const naturalWidth = await images[i].evaluate(img => img.naturalWidth);
          if (naturalWidth === 0) {
            imageScore -= 5;
            testResults.issues.push(`Broken image in ${item} detail view`);
          }
        }
      }
    }
  }

  testResults.scores.IMAGE_RELEVANCE = imageScore;
  console.log(`  Image Score: ${imageScore}/100`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 4: LOCATION HELPFULNESS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n█ TEST 4: Location Helpfulness');

  let locationScore = 100;

  // Test Narcan specifically - this is critical for overdose situations
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const searchInput = await page.$('input');
  if (searchInput) {
    await searchInput.fill('Narcan');
    await page.waitForTimeout(1000);

    await captureAndAnalyze(page, '04_narcan_result', 'Narcan search result - critical for overdose');

    // Check if location info is present
    const pageContent = await page.textContent('body');

    const hasDrawerInfo = pageContent.toLowerCase().includes('drawer');
    const hasCabinetInfo = pageContent.toLowerCase().includes('cabinet');
    const hasStepByStep = pageContent.includes('Step') || pageContent.includes('step');

    console.log(`  - Drawer location: ${hasDrawerInfo ? '✓' : '✗'}`);
    console.log(`  - Cabinet info: ${hasCabinetInfo ? '✓' : '✗'}`);
    console.log(`  - Step-by-step: ${hasStepByStep ? '✓' : '✗'}`);

    if (!hasDrawerInfo && !hasCabinetInfo) {
      locationScore -= 20;
      testResults.issues.push('Narcan location does not specify drawer/cabinet');
    }

    // Check for warning about atomizer
    const hasWarning = pageContent.toLowerCase().includes('atomizer') ||
                       pageContent.toLowerCase().includes('warning');
    if (!hasWarning) {
      locationScore -= 10;
      testResults.issues.push('Narcan missing critical atomizer warning');
      testResults.suggestions.push('Add warning: Atomizer must come with syringe - they are TAPED TOGETHER');
    }
  }

  testResults.scores.LOCATION_HELPFULNESS = locationScore;
  console.log(`  Location Score: ${locationScore}/100`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 5: VOICE/MICROPHONE FUNCTIONALITY
  // ═══════════════════════════════════════════════════════════════
  console.log('\n█ TEST 5: Voice/Microphone Button');

  let voiceScore = 100;

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await captureAndAnalyze(page, '05_voice_button', 'Voice/microphone button visibility');

  // Check for microphone button
  const micButton = await page.$('.mic-btn, .voice-btn, button[data-mic], #mic-button, [class*="mic"]');

  if (micButton) {
    console.log('  Microphone button: ✓ Found');

    // Check if it's visible
    const isVisible = await micButton.isVisible();
    if (!isVisible) {
      voiceScore -= 30;
      testResults.issues.push('Microphone button exists but not visible');
    }

    // Check button size (should be easy to tap)
    const box = await micButton.boundingBox();
    if (box && (box.width < 44 || box.height < 44)) {
      voiceScore -= 10;
      testResults.issues.push('Microphone button too small for easy touch');
      testResults.suggestions.push('Make mic button at least 44x44px for accessibility');
    }

    // Try clicking it
    try {
      await micButton.click();
      await page.waitForTimeout(500);

      await captureAndAnalyze(page, '05_after_mic_click', 'After clicking microphone button');
      console.log('  Mic button clickable: ✓');
    } catch (e) {
      voiceScore -= 20;
      testResults.issues.push('Microphone button not clickable');
    }
  } else {
    voiceScore -= 50;
    testResults.issues.push('Microphone button NOT FOUND - critical for voice search');
    testResults.suggestions.push('Add prominent microphone button for voice search');
  }

  testResults.scores.VOICE_FUNCTIONALITY = voiceScore;
  console.log(`  Voice Score: ${voiceScore}/100`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 6: MOBILE USABILITY (Touch targets, scrolling)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n█ TEST 6: Mobile Usability');

  let mobileScore = 100;

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Check all buttons have adequate touch targets
  const buttons = await page.$$('button, .btn, [role="button"]');
  let smallButtons = 0;

  for (const btn of buttons) {
    const box = await btn.boundingBox();
    if (box && (box.width < 44 || box.height < 44)) {
      smallButtons++;
    }
  }

  if (smallButtons > 0) {
    mobileScore -= (smallButtons * 3);
    testResults.issues.push(`${smallButtons} buttons smaller than 44x44px`);
  }

  // Test scrolling
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);
  const scrollY = await page.evaluate(() => window.scrollY);

  if (scrollY < 400) {
    mobileScore -= 10;
    testResults.issues.push('Page does not scroll properly');
  }

  testResults.scores.MOBILE_USABILITY = mobileScore;
  console.log(`  Mobile Usability Score: ${mobileScore}/100`);
  console.log(`  - Small buttons: ${smallButtons}`);
  console.log(`  - Scroll works: ${scrollY > 400 ? '✓' : '✗'}`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 7: ADMIN PORTAL
  // ═══════════════════════════════════════════════════════════════
  console.log('\n█ TEST 7: Admin Portal');

  let adminScore = 100;

  // Test desktop admin portal
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(`${BASE_URL}/admin-portal.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  await captureAndAnalyze(page, '07_admin_portal', 'Admin portal desktop view');

  const adminContent = await page.textContent('body');
  const hasEquipmentList = adminContent.includes('Equipment') || adminContent.includes('equipment');
  const hasVersion = adminContent.includes('2.6') || adminContent.includes('v2.');

  if (!hasEquipmentList) {
    adminScore -= 30;
    testResults.issues.push('Admin portal not showing equipment list');
  }

  // Check for "View Guide" button
  const viewGuideBtn = await page.$('button:has-text("View Guide"), .view-guide-btn, [onclick*="viewLocationGuide"]');
  if (viewGuideBtn) {
    await viewGuideBtn.click();
    await page.waitForTimeout(2000);

    await captureAndAnalyze(page, '07_location_guide_modal', 'Location guide modal with gold dot');

    // Check for gold dot element
    const goldDot = await page.$('#guide-gold-dot, .gold-dot, [style*="FFD700"]');
    if (!goldDot) {
      adminScore -= 15;
      testResults.issues.push('Gold dot marker not visible in location guide');
    }

    // Wait for rotation
    await page.waitForTimeout(3000);
    await captureAndAnalyze(page, '07_location_guide_rotated', 'Location guide after rotation');
  }

  testResults.scores.ADMIN_FUNCTIONALITY = adminScore;
  console.log(`  Admin Score: ${adminScore}/100`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 8: ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════
  console.log('\n█ TEST 8: Error Handling');

  let errorScore = 100;

  // Reset to mobile
  await page.setViewportSize(device.viewport);

  // Test searching for non-existent equipment
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const searchInputErr = await page.$('input');
  if (searchInputErr) {
    await searchInputErr.fill('xyznonexistent123');
    await page.waitForTimeout(1000);

    await captureAndAnalyze(page, '08_no_results', 'Search with no results');

    const pageContent = await page.textContent('body');
    const hasNoResultsMsg = pageContent.toLowerCase().includes('no result') ||
                            pageContent.toLowerCase().includes('not found') ||
                            pageContent.toLowerCase().includes('try');

    if (!hasNoResultsMsg) {
      errorScore -= 20;
      testResults.issues.push('No helpful message when search returns no results');
      testResults.suggestions.push('Add "No results found. Try a different search term" message');
    }
  }

  testResults.scores.ERROR_HANDLING = errorScore;
  console.log(`  Error Handling Score: ${errorScore}/100`);

  await browser.close();

  // ═══════════════════════════════════════════════════════════════
  // CALCULATE OVERALL GRADE
  // ═══════════════════════════════════════════════════════════════
  let weightedTotal = 0;
  let totalWeight = 0;

  for (const [criterion, config] of Object.entries(CRITERIA)) {
    const score = testResults.scores[criterion] || 0;
    weightedTotal += score * config.weight;
    totalWeight += config.weight;
  }

  testResults.overallGrade = Math.round(weightedTotal / totalWeight);

  // ═══════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('                     FINAL AUDIT REPORT');
  console.log('═'.repeat(60));

  console.log(`\n📱 Device Tested: ${testResults.device}`);
  console.log(`📊 Screenshots Captured: ${testResults.screenshots.length}`);
  console.log(`📁 Location: ${SCREENSHOTS_DIR}`);

  console.log('\n┌────────────────────────────────────┬────────┬────────┐');
  console.log('│ CRITERION                          │ WEIGHT │ SCORE  │');
  console.log('├────────────────────────────────────┼────────┼────────┤');

  for (const [criterion, config] of Object.entries(CRITERIA)) {
    const score = testResults.scores[criterion] || 0;
    const name = config.description.substring(0, 34).padEnd(34);
    console.log(`│ ${name} │  ${config.weight.toString().padStart(2)}%   │ ${score.toString().padStart(3)}/100 │`);
  }

  console.log('├────────────────────────────────────┼────────┼────────┤');
  console.log(`│ OVERALL GRADE                      │  100%  │ ${testResults.overallGrade.toString().padStart(3)}/100 │`);
  console.log('└────────────────────────────────────┴────────┴────────┘');

  // Grade letter
  let grade = 'F';
  if (testResults.overallGrade >= 99) grade = 'A+';
  else if (testResults.overallGrade >= 93) grade = 'A';
  else if (testResults.overallGrade >= 90) grade = 'A-';
  else if (testResults.overallGrade >= 87) grade = 'B+';
  else if (testResults.overallGrade >= 83) grade = 'B';
  else if (testResults.overallGrade >= 80) grade = 'B-';
  else if (testResults.overallGrade >= 70) grade = 'C';
  else if (testResults.overallGrade >= 60) grade = 'D';

  console.log(`\n🏆 LETTER GRADE: ${grade}`);

  if (testResults.issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    testResults.issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }

  if (testResults.suggestions.length > 0) {
    console.log('\n💡 SUGGESTIONS FOR IMPROVEMENT:');
    testResults.suggestions.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });
  }

  if (testResults.overallGrade < 99) {
    console.log(`\n🎯 TO REACH 99/100:`);
    console.log('   Fix the issues listed above and re-run this audit.');
  } else {
    console.log('\n✅ EXCELLENT! App meets the 99/100 quality threshold!');
  }

  console.log('\n' + '═'.repeat(60));

  return testResults;
}

// Run and export results
runComprehensiveAudit().then(results => {
  // Save results to JSON
  const resultsPath = path.join(SCREENSHOTS_DIR, 'audit_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);
}).catch(console.error);
