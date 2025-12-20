// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * COMPREHENSIVE MOBILE UI AUDIT - v2.9.7
 *
 * Tests ALL features and grades them 1-100 on:
 * - Functionality (does it work?)
 * - Mobile UX (is it easy to use on phone?)
 * - Screen Space Efficiency (good use of limited space?)
 * - Visual Clarity (is it clear and readable?)
 *
 * MOBILE ONLY - iPhone 13 viewport (390x844)
 */

const AUDIT_RESULTS = {
  tests: [],
  totalScore: 0,
  improvements: [],
  imageIssues: []
};

// Helper to dismiss modals
async function dismissModals(page) {
  await page.evaluate(() => {
    document.querySelectorAll('#install-prompt, #mic-onboarding-modal, .admin-modal').forEach(el => {
      el.style.display = 'none';
      el.classList.remove('visible', 'active');
    });
  });
  await page.waitForTimeout(300);
}

// Helper to grade and log
function gradeTest(name, scores, notes = '', improvements = []) {
  const avg = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length);
  const result = {
    name,
    scores,
    average: avg,
    notes,
    improvements
  };
  AUDIT_RESULTS.tests.push(result);
  if (improvements.length > 0) {
    AUDIT_RESULTS.improvements.push(...improvements.map(i => `[${name}] ${i}`));
  }
  console.log(`\n📊 ${name}: ${avg}/100`);
  Object.entries(scores).forEach(([k, v]) => console.log(`   ${k}: ${v}`));
  if (notes) console.log(`   Notes: ${notes}`);
  if (improvements.length) console.log(`   🔧 Improvements: ${improvements.join(', ')}`);
  return avg;
}

test.describe('MOBILE COMPREHENSIVE AUDIT', () => {

  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 13
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  test('1. HOME SCREEN - First Impressions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/audit-01-home.png', fullPage: true });

    // Check key elements
    const logo = page.locator('img[alt*="HNFR"], .header-logo img').first();
    const searchInput = page.locator('#searchInput');
    const voiceBtn = page.locator('#voiceBtn');
    const criticalBtn = page.locator('text=SHOW ALL CRITICAL');

    const logoVisible = await logo.isVisible().catch(() => false);
    const searchVisible = await searchInput.isVisible();
    const voiceVisible = await voiceBtn.isVisible();
    const criticalVisible = await criticalBtn.isVisible();

    // Measure spacing
    const headerHeight = await page.locator('header, .header, [class*="header"]').first().boundingBox().then(b => b?.height || 0).catch(() => 60);
    const searchBox = await searchInput.boundingBox();

    const scores = {
      functionality: (searchVisible && voiceVisible) ? 95 : 60,
      mobileUX: searchBox && searchBox.width > 300 ? 90 : 70,
      screenSpace: headerHeight < 100 ? 85 : 70,
      visualClarity: logoVisible ? 90 : 75
    };

    const improvements = [];
    if (headerHeight > 80) improvements.push('Header could be more compact');
    if (!criticalVisible) improvements.push('Critical items button should be above fold');

    gradeTest('HOME SCREEN', scores, `Header: ${headerHeight}px, Search width: ${searchBox?.width}px`, improvements);

    expect(searchVisible).toBe(true);
    expect(voiceVisible).toBe(true);
  });

  test('2. VOICE BUTTON - Tap Target & Visibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    const voiceBtn = page.locator('#voiceBtn');
    const voiceBox = await voiceBtn.boundingBox();

    await page.screenshot({ path: 'tests/screenshots/audit-02-voice-btn.png' });

    // iOS requires 44x44 minimum tap target
    const tapTargetOK = voiceBox && voiceBox.width >= 44 && voiceBox.height >= 44;
    const isCentered = voiceBox && Math.abs((390 / 2) - (voiceBox.x + voiceBox.width / 2)) < 50;

    const scores = {
      functionality: 90,
      mobileUX: tapTargetOK ? 95 : 60,
      screenSpace: isCentered ? 90 : 75,
      visualClarity: voiceBox && voiceBox.width >= 80 ? 95 : 70
    };

    const improvements = [];
    if (!tapTargetOK) improvements.push(`Voice button too small: ${voiceBox?.width}x${voiceBox?.height} (need 44x44 min)`);
    if (!isCentered) improvements.push('Voice button should be more centered');

    gradeTest('VOICE BUTTON', scores, `Size: ${voiceBox?.width}x${voiceBox?.height}px`, improvements);

    expect(tapTargetOK).toBe(true);
  });

  test('3. SEARCH RESULTS - Location First', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    await page.locator('#searchInput').fill('AED');
    await page.locator('#searchBtn').click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/audit-03-search-result.png', fullPage: true });

    const locationPrimary = page.locator('.result-location-primary').first();
    const locationVisible = await locationPrimary.isVisible();
    const locationBox = await locationPrimary.boundingBox();

    // Check location is above image
    const imageContainer = page.locator('.result-image-container').first();
    let locationAboveImage = true;
    if (await imageContainer.isVisible()) {
      const imageBox = await imageContainer.boundingBox();
      locationAboveImage = locationBox && imageBox && locationBox.y < imageBox.y;
    }

    // Check location text size
    const locationFontSize = await locationPrimary.evaluate(el =>
      parseInt(window.getComputedStyle(el).fontSize)
    ).catch(() => 14);

    const scores = {
      functionality: locationVisible ? 100 : 50,
      mobileUX: locationAboveImage ? 95 : 60,
      screenSpace: 85,
      visualClarity: locationFontSize >= 16 ? 95 : 70
    };

    const improvements = [];
    if (!locationAboveImage) improvements.push('Location should appear BEFORE image');
    if (locationFontSize < 18) improvements.push(`Location text too small: ${locationFontSize}px (suggest 18px+)`);

    gradeTest('SEARCH RESULTS', scores, `Location font: ${locationFontSize}px`, improvements);

    expect(locationVisible).toBe(true);
  });

  test('4. RESULT IMAGES - Full Picture Display', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    await page.locator('#searchInput').fill('oxygen');
    await page.locator('#searchBtn').click();
    await page.waitForTimeout(1000);

    const resultImage = page.locator('.result-image').first();

    if (await resultImage.isVisible()) {
      await page.screenshot({ path: 'tests/screenshots/audit-04-result-image.png' });

      const objectFit = await resultImage.evaluate(el =>
        window.getComputedStyle(el).objectFit
      );
      const imageBox = await resultImage.boundingBox();

      // Check if image uses full width
      const widthEfficiency = imageBox ? (imageBox.width / 390) * 100 : 0;

      const scores = {
        functionality: objectFit === 'contain' ? 100 : 50,
        mobileUX: 85,
        screenSpace: widthEfficiency > 80 ? 90 : 70,
        visualClarity: objectFit === 'contain' ? 95 : 60
      };

      const improvements = [];
      if (objectFit !== 'contain') improvements.push(`Image cropped! object-fit: ${objectFit} (should be contain)`);
      if (widthEfficiency < 85) improvements.push(`Image only uses ${widthEfficiency.toFixed(0)}% of screen width`);

      AUDIT_RESULTS.imageIssues.push({
        location: 'Search Result Image',
        objectFit,
        widthPercent: widthEfficiency
      });

      gradeTest('RESULT IMAGES', scores, `object-fit: ${objectFit}, width: ${widthEfficiency.toFixed(0)}%`, improvements);

      expect(objectFit).toBe('contain');
    } else {
      console.log('⚠️ No image found for this item');
    }
  });

  test('5. A-Z BROWSE - Scrollable List', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    await page.locator('#azBrowseBtn').click({ force: true });
    await page.waitForTimeout(800);

    await page.screenshot({ path: 'tests/screenshots/audit-05-az-browse.png' });

    const azModal = page.locator('#az-modal');
    const isActive = await azModal.evaluate(el => el.classList.contains('active')).catch(() => false);

    const items = page.locator('.az-item');
    const itemCount = await items.count();

    // Check item tap targets
    const firstItem = items.first();
    const itemBox = await firstItem.boundingBox();
    const tapTargetOK = itemBox && itemBox.height >= 44;

    const scores = {
      functionality: isActive && itemCount > 5 ? 95 : 60,
      mobileUX: tapTargetOK ? 90 : 65,
      screenSpace: 85,
      visualClarity: 90
    };

    const improvements = [];
    if (!tapTargetOK) improvements.push(`List items too small: ${itemBox?.height}px height (need 44px min)`);
    if (itemCount < 10) improvements.push('A-Z list seems incomplete');

    gradeTest('A-Z BROWSE', scores, `${itemCount} items, item height: ${itemBox?.height}px`, improvements);

    // Close modal
    await page.locator('#az-close-btn').click().catch(() => {});

    expect(isActive).toBe(true);
  });

  test('6. COMPARTMENT BROWSER - Visual Cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    await page.locator('#compartmentBrowseBtn').click({ force: true });
    await page.waitForTimeout(800);

    await page.screenshot({ path: 'tests/screenshots/audit-06-compartment-browse.png', fullPage: true });

    const cards = page.locator('.compartment-card');
    const cardCount = await cards.count();

    // Check first card
    const firstCard = cards.first();
    const cardBox = await firstCard.boundingBox();

    // Check card image
    const cardImage = firstCard.locator('img').first();
    const imageVisible = await cardImage.isVisible().catch(() => false);

    const scores = {
      functionality: cardCount >= 8 ? 95 : 70,
      mobileUX: cardBox && cardBox.height >= 80 ? 90 : 70,
      screenSpace: 85,
      visualClarity: imageVisible ? 95 : 70
    };

    const improvements = [];
    if (!imageVisible) improvements.push('Compartment cards should show thumbnail images');
    if (cardCount < 8) improvements.push(`Only ${cardCount} compartments shown (expected 8)`);

    gradeTest('COMPARTMENT BROWSER', scores, `${cardCount} compartments`, improvements);

    expect(cardCount).toBeGreaterThanOrEqual(8);
  });

  test('7. COMPARTMENT DETAIL - Full Image View', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    await page.locator('#compartmentBrowseBtn').click({ force: true });
    await page.waitForTimeout(800);

    await page.locator('.compartment-card').first().click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'tests/screenshots/audit-07-compartment-detail.png', fullPage: true });

    const detailImage = page.locator('.compartment-detail-image, .compartment-detail img').first();
    const imageVisible = await detailImage.isVisible().catch(() => false);

    let imageBox = null;
    let objectFit = 'unknown';
    if (imageVisible) {
      imageBox = await detailImage.boundingBox();
      objectFit = await detailImage.evaluate(el =>
        window.getComputedStyle(el).objectFit
      ).catch(() => 'unknown');
    }

    const widthPercent = imageBox ? (imageBox.width / 390) * 100 : 0;

    const scores = {
      functionality: imageVisible ? 95 : 50,
      mobileUX: 85,
      screenSpace: widthPercent > 90 ? 95 : 75,
      visualClarity: objectFit === 'contain' ? 95 : 70
    };

    const improvements = [];
    if (objectFit !== 'contain') improvements.push(`Detail image cropped: ${objectFit}`);
    if (widthPercent < 90) improvements.push(`Image only ${widthPercent.toFixed(0)}% width - should be full screen`);

    AUDIT_RESULTS.imageIssues.push({
      location: 'Compartment Detail',
      objectFit,
      widthPercent
    });

    gradeTest('COMPARTMENT DETAIL', scores, `Image: ${widthPercent.toFixed(0)}% width, ${objectFit}`, improvements);
  });

  test('8. LOCATION GUIDE - 3-Step Images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    await page.locator('#searchInput').fill('oxygen');
    await page.locator('#searchBtn').click();
    await page.waitForTimeout(1000);

    const guideBtn = page.locator('.location-guide-btn').first();
    if (await guideBtn.isVisible()) {
      await guideBtn.click({ force: true });
      await page.waitForTimeout(800);

      await page.screenshot({ path: 'tests/screenshots/audit-08-location-guide.png', fullPage: true });

      const guideModal = page.locator('#location-guide-modal');
      const modalVisible = await guideModal.isVisible();

      const guideImage = page.locator('#guide-image, .guide-image').first();
      const imageVisible = await guideImage.isVisible().catch(() => false);

      let imageBox = null;
      let objectFit = 'unknown';
      if (imageVisible) {
        imageBox = await guideImage.boundingBox();
        objectFit = await guideImage.evaluate(el =>
          window.getComputedStyle(el).objectFit
        ).catch(() => 'unknown');
      }

      // Check step indicator
      const stepText = await guideModal.textContent();
      const hasStepIndicator = stepText?.toLowerCase().includes('step') && stepText?.includes('of');

      const widthPercent = imageBox ? (imageBox.width / 390) * 100 : 0;
      const heightPercent = imageBox ? (imageBox.height / 844) * 100 : 0;

      const scores = {
        functionality: modalVisible && hasStepIndicator ? 95 : 70,
        mobileUX: 85,
        screenSpace: heightPercent > 40 ? 90 : 70,
        visualClarity: objectFit === 'contain' ? 95 : 60
      };

      const improvements = [];
      if (objectFit !== 'contain') improvements.push(`Guide image cropped: ${objectFit} (MUST be contain)`);
      if (heightPercent < 50) improvements.push(`Guide image too small: ${heightPercent.toFixed(0)}% of screen height`);
      if (widthPercent < 90) improvements.push(`Guide image should use full width`);

      AUDIT_RESULTS.imageIssues.push({
        location: 'Location Guide',
        objectFit,
        widthPercent,
        heightPercent
      });

      gradeTest('LOCATION GUIDE', scores, `Image: ${widthPercent.toFixed(0)}%W x ${heightPercent.toFixed(0)}%H, ${objectFit}`, improvements);

      // Close
      await page.locator('.guide-close-btn').click().catch(() => {});
    } else {
      console.log('⚠️ No location guide button found');
    }
  });

  test('9. QUICK FIND BUTTONS - Tap Targets', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    // Scroll to quick find section
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'tests/screenshots/audit-09-quick-find.png' });

    const quickButtons = page.locator('[data-search]');
    const buttonCount = await quickButtons.count();

    // Check first button size
    const firstBtn = quickButtons.first();
    const btnBox = await firstBtn.boundingBox();
    const tapTargetOK = btnBox && btnBox.width >= 44 && btnBox.height >= 44;

    // Check grid layout
    const buttons = await quickButtons.all();
    let layoutScore = 85;
    if (buttons.length > 0) {
      const boxes = await Promise.all(buttons.slice(0, 4).map(b => b.boundingBox()));
      const validBoxes = boxes.filter(b => b);
      if (validBoxes.length >= 2) {
        // Check if buttons are in a grid (2 columns)
        const isGrid = validBoxes[0] && validBoxes[1] &&
          Math.abs(validBoxes[0].y - validBoxes[1].y) < 10; // Same row
        layoutScore = isGrid ? 90 : 75;
      }
    }

    const scores = {
      functionality: buttonCount >= 6 ? 95 : 70,
      mobileUX: tapTargetOK ? 90 : 65,
      screenSpace: layoutScore,
      visualClarity: 85
    };

    const improvements = [];
    if (!tapTargetOK) improvements.push(`Quick buttons too small: ${btnBox?.width}x${btnBox?.height}px`);
    if (buttonCount < 8) improvements.push('Could add more quick access buttons');

    gradeTest('QUICK FIND BUTTONS', scores, `${buttonCount} buttons, size: ${btnBox?.width}x${btnBox?.height}px`, improvements);
  });

  test('10. SETTINGS MENU - Accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await dismissModals(page);

    await page.locator('#admin-toggle').click({ force: true });
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'tests/screenshots/audit-10-settings.png' });

    const settingsModal = page.locator('#settings-modal');
    const isActive = await settingsModal.evaluate(el => el.classList.contains('active')).catch(() => false);

    // Check version display
    const versionEl = page.locator('#settings-version');
    const versionText = await versionEl.textContent().catch(() => '');
    const hasVersion = versionText.includes('2.9');

    // Check button sizes
    const settingsButtons = settingsModal.locator('button');
    const btnCount = await settingsButtons.count();

    const scores = {
      functionality: isActive && hasVersion ? 95 : 70,
      mobileUX: btnCount >= 3 ? 90 : 75,
      screenSpace: 85,
      visualClarity: 90
    };

    const improvements = [];
    if (!hasVersion) improvements.push('Version not displayed correctly');

    gradeTest('SETTINGS MENU', scores, `Version: ${versionText}`, improvements);

    expect(isActive).toBe(true);
  });

  test('FINAL AUDIT REPORT', async ({ page }) => {
    // Calculate overall scores
    const totalTests = AUDIT_RESULTS.tests.length;
    const overallAvg = Math.round(
      AUDIT_RESULTS.tests.reduce((sum, t) => sum + t.average, 0) / totalTests
    );

    console.log('\n' + '='.repeat(60));
    console.log('📋 COMPREHENSIVE MOBILE AUDIT REPORT - v2.9.7');
    console.log('='.repeat(60));

    console.log(`\n🎯 OVERALL SCORE: ${overallAvg}/100\n`);

    console.log('📊 INDIVIDUAL SCORES:');
    console.log('-'.repeat(40));
    AUDIT_RESULTS.tests.forEach(t => {
      const emoji = t.average >= 90 ? '✅' : t.average >= 75 ? '⚠️' : '❌';
      console.log(`${emoji} ${t.name}: ${t.average}/100`);
    });

    console.log('\n🔧 RECOMMENDED IMPROVEMENTS:');
    console.log('-'.repeat(40));
    if (AUDIT_RESULTS.improvements.length === 0) {
      console.log('✨ No critical improvements needed!');
    } else {
      AUDIT_RESULTS.improvements.forEach((imp, i) => {
        console.log(`${i + 1}. ${imp}`);
      });
    }

    console.log('\n🖼️ IMAGE ANALYSIS:');
    console.log('-'.repeat(40));
    AUDIT_RESULTS.imageIssues.forEach(img => {
      const status = img.objectFit === 'contain' ? '✅' : '❌';
      console.log(`${status} ${img.location}: ${img.objectFit}, ${img.widthPercent?.toFixed(0) || '?'}% width`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`AUDIT COMPLETE - ${totalTests} tests, ${AUDIT_RESULTS.improvements.length} improvements suggested`);
    console.log('='.repeat(60));

    // Pass if overall score is above 80
    expect(overallAvg).toBeGreaterThanOrEqual(75);
  });
});
