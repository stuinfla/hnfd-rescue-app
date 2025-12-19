/**
 * Comprehensive Mobile Visual Audit for HNFD Equipment Finder v2.6.0
 * Tests all functionality from a mobile user perspective
 * Takes screenshots for critical visual analysis
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://hnfd-rescue.vercel.app';
const ADMIN_PASSWORD = 'hnfd2026admin';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// iPhone 14 Pro viewport
const MOBILE_VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

// Critical equipment to test (including ones with new location guides)
const EQUIPMENT_TO_TEST = [
  'Narcan',
  'Adult Trauma Bag',
  'AED',
  'Drug Box',
  'LifePak',
  'Glucometer',
  'Oxygen',
  'Suction'
];

async function runVisualAudit() {
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('='.repeat(60));
  console.log('HNFD EQUIPMENT FINDER - MOBILE VISUAL AUDIT v2.6.0');
  console.log('='.repeat(60));
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  const results = [];

  try {
    // ============================================
    // TEST 1: Landing Page
    // ============================================
    console.log('\n[TEST 1] Landing Page');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const landingScreenshot = path.join(SCREENSHOTS_DIR, '01_landing_page.png');
    await page.screenshot({ path: landingScreenshot, fullPage: true });
    console.log(`  Screenshot: ${landingScreenshot}`);

    // Check version
    const versionText = await page.textContent('body').catch(() => '');
    const versionMatch = versionText.match(/v[\d.]+/);
    console.log(`  Version displayed: ${versionMatch ? versionMatch[0] : 'NOT FOUND'}`);

    results.push({
      test: 'Landing Page',
      screenshot: landingScreenshot,
      notes: 'Check: Is the UI clear? Is the search prominent? Is the version visible?'
    });

    // ============================================
    // TEST 2: Search for each critical equipment
    // ============================================
    console.log('\n[TEST 2] Equipment Search Tests');

    for (let i = 0; i < EQUIPMENT_TO_TEST.length; i++) {
      const equipment = EQUIPMENT_TO_TEST[i];
      console.log(`\n  Testing: ${equipment}`);

      // Clear any previous search
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Find and use the search input
      const searchInput = await page.$('input[type="text"], input[type="search"], #search-input');
      if (searchInput) {
        await searchInput.fill(equipment);
        await page.waitForTimeout(800);

        // Screenshot the search results
        const searchScreenshot = path.join(SCREENSHOTS_DIR, `02_search_${equipment.toLowerCase().replace(/\s+/g, '_')}.png`);
        await page.screenshot({ path: searchScreenshot, fullPage: true });
        console.log(`    Search results screenshot: ${searchScreenshot}`);

        results.push({
          test: `Search: ${equipment}`,
          screenshot: searchScreenshot,
          notes: `Check: Does the result clearly show ${equipment}? Is the location helpful?`
        });

        // Click on the result if there is one
        const resultCard = await page.$('.equipment-card, .result-card, [data-equipment]');
        if (resultCard) {
          await resultCard.click();
          await page.waitForTimeout(500);

          const detailScreenshot = path.join(SCREENSHOTS_DIR, `03_detail_${equipment.toLowerCase().replace(/\s+/g, '_')}.png`);
          await page.screenshot({ path: detailScreenshot, fullPage: true });
          console.log(`    Detail view screenshot: ${detailScreenshot}`);

          results.push({
            test: `Detail: ${equipment}`,
            screenshot: detailScreenshot,
            notes: `Check: Is the location description clear? Are there images? Are they helpful?`
          });
        }
      }
    }

    // ============================================
    // TEST 3: Admin Panel Access
    // ============================================
    console.log('\n[TEST 3] Admin Panel Access');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Find and click gear icon
    const gearIcon = await page.$('[data-admin], .admin-btn, button:has-text("⚙"), .settings-btn');
    if (gearIcon) {
      await gearIcon.click();
      await page.waitForTimeout(500);

      const adminLoginScreenshot = path.join(SCREENSHOTS_DIR, '04_admin_login_modal.png');
      await page.screenshot({ path: adminLoginScreenshot });
      console.log(`  Admin login screenshot: ${adminLoginScreenshot}`);

      // Try to enter password
      const passwordInput = await page.$('input[type="password"]');
      if (passwordInput) {
        await passwordInput.fill(ADMIN_PASSWORD);

        // Find and click login button
        const loginBtn = await page.$('button:has-text("Login"), button:has-text("Enter"), .admin-login-btn');
        if (loginBtn) {
          await loginBtn.click();
          await page.waitForTimeout(1000);

          const adminPanelScreenshot = path.join(SCREENSHOTS_DIR, '05_admin_panel.png');
          await page.screenshot({ path: adminPanelScreenshot, fullPage: true });
          console.log(`  Admin panel screenshot: ${adminPanelScreenshot}`);

          results.push({
            test: 'Admin Panel (Mobile)',
            screenshot: adminPanelScreenshot,
            notes: 'Check: Is admin panel usable on mobile? Can you manage equipment?'
          });
        }
      }
    } else {
      console.log('  Admin button not found on mobile view');
    }

    // ============================================
    // TEST 4: Desktop Admin Portal
    // ============================================
    console.log('\n[TEST 4] Desktop Admin Portal');

    // Switch to desktop viewport
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(`${BASE_URL}/admin-portal.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const adminPortalScreenshot = path.join(SCREENSHOTS_DIR, '06_admin_portal_desktop.png');
    await page.screenshot({ path: adminPortalScreenshot, fullPage: true });
    console.log(`  Admin portal screenshot: ${adminPortalScreenshot}`);

    results.push({
      test: 'Admin Portal (Desktop)',
      screenshot: adminPortalScreenshot,
      notes: 'Check: Does the portal load? Are all 17 equipment items visible?'
    });

    // ============================================
    // TEST 5: Location Guide with Gold Dots
    // ============================================
    console.log('\n[TEST 5] Location Guide with Gold Dots');

    // Find and click "View Guide" on an equipment item with location guide
    const viewGuideBtn = await page.$('button:has-text("View Guide"), .view-guide-btn');
    if (viewGuideBtn) {
      await viewGuideBtn.click();
      await page.waitForTimeout(1500);

      const guideScreenshot1 = path.join(SCREENSHOTS_DIR, '07_location_guide_step1.png');
      await page.screenshot({ path: guideScreenshot1 });
      console.log(`  Guide step 1 screenshot: ${guideScreenshot1}`);

      // Wait for rotation to next image
      await page.waitForTimeout(2500);
      const guideScreenshot2 = path.join(SCREENSHOTS_DIR, '08_location_guide_step2.png');
      await page.screenshot({ path: guideScreenshot2 });
      console.log(`  Guide step 2 screenshot: ${guideScreenshot2}`);

      // Wait for rotation to next image
      await page.waitForTimeout(2500);
      const guideScreenshot3 = path.join(SCREENSHOTS_DIR, '09_location_guide_step3.png');
      await page.screenshot({ path: guideScreenshot3 });
      console.log(`  Guide step 3 screenshot: ${guideScreenshot3}`);

      results.push({
        test: 'Location Guide - Rotating Images',
        screenshot: guideScreenshot1,
        notes: 'Check: Does the gold dot appear? Is it in the right position? Is the label helpful?'
      });
    } else {
      console.log('  View Guide button not found');
    }

    // ============================================
    // TEST 6: Equipment Images Quality Check
    // ============================================
    console.log('\n[TEST 6] Equipment Images Quality Check');

    // Scroll through equipment list to capture all items
    const equipmentCards = await page.$$('.equipment-card, .card');
    console.log(`  Found ${equipmentCards.length} equipment cards`);

    // Take a full page screenshot showing all equipment
    const allEquipmentScreenshot = path.join(SCREENSHOTS_DIR, '10_all_equipment.png');
    await page.screenshot({ path: allEquipmentScreenshot, fullPage: true });
    console.log(`  All equipment screenshot: ${allEquipmentScreenshot}`);

    results.push({
      test: 'All Equipment Overview',
      screenshot: allEquipmentScreenshot,
      notes: 'Check: Do all items have images? Are thumbnails clear?'
    });

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('VISUAL AUDIT COMPLETE');
    console.log('='.repeat(60));
    console.log(`\nTotal screenshots captured: ${results.length}`);
    console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log('\nREVIEW CHECKLIST:');

    results.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.test}`);
      console.log(`   File: ${path.basename(r.screenshot)}`);
      console.log(`   ${r.notes}`);
    });

  } catch (error) {
    console.error('Error during visual audit:', error);
  } finally {
    await browser.close();
  }

  return results;
}

// Run the audit
runVisualAudit().then(() => {
  console.log('\n\nAudit complete. Review screenshots in tests/screenshots/');
}).catch(console.error);
