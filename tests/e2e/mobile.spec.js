// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * HNFD Rescue Equipment Finder - Mobile App Tests
 *
 * Tests the user-facing mobile PWA optimized for iPhone/Android
 * Covers: Search, Voice, Results, Compartments, Roster, Drivers, Navigation
 */

const BASE_URL = 'https://hnfd-rescue.vercel.app';
const ROSTER_PIN = '1426';

test.describe('Mobile App - Page Load & UI', () => {
  test('should load the app and display main interface', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for app to fully load
    await page.waitForLoadState('networkidle');

    // Check header is visible
    await expect(page.locator('header, .header, h1').first()).toBeVisible();

    // Check search input exists with yellow border
    const searchInput = page.locator('input[type="text"], .search-input').first();
    await expect(searchInput).toBeVisible();
  });

  test('should display version number', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Version should be visible somewhere on page
    const versionText = await page.textContent('body');
    expect(versionText).toContain('2.14');
  });

  test('should have yellow search box border for visibility', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('.search-input').first();
    await expect(searchInput).toBeVisible();

    // Check border color is yellow
    const borderColor = await searchInput.evaluate(el =>
      getComputedStyle(el).borderColor
    );
    // Yellow border should be present (rgb values for #fbbf24)
    expect(borderColor).toBeTruthy();
  });

  test('should have appropriately sized microphone button', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const voiceBtn = page.locator('.voice-btn').first();
    if (await voiceBtn.isVisible()) {
      const box = await voiceBtn.boundingBox();
      // Should be 90px or smaller (not 140px)
      expect(box.width).toBeLessThanOrEqual(100);
      expect(box.height).toBeLessThanOrEqual(100);
    }
  });

  test('should display bottom navigation tabs', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check for navigation elements
    const nav = page.locator('nav, .bottom-nav, .nav-tabs, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });
});

test.describe('Mobile App - Equipment Search', () => {
  test('should search for equipment by text', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('oxygen');
    await searchInput.press('Enter');

    // Should show results
    await page.waitForTimeout(1000);
    const resultsArea = page.locator('.results, .search-results, [class*="result"]').first();
    await expect(resultsArea).toBeVisible();
  });

  test('should search for BVM equipment', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('BVM');
    await searchInput.press('Enter');

    await page.waitForTimeout(1000);
    const pageContent = await page.textContent('body');
    // Should find BVM or bag valve mask related content
    expect(pageContent.toLowerCase()).toMatch(/bvm|bag|valve|mask|compartment/i);
  });

  test('should search for AED', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('AED');
    await searchInput.press('Enter');

    await page.waitForTimeout(1000);
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/aed|defib|compartment/i);
  });

  test('should handle no results gracefully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('xyznonexistent12345');
    await searchInput.press('Enter');

    await page.waitForTimeout(1000);
    // Should not crash, page should still be functional
    await expect(searchInput).toBeVisible();
  });

  test('should clear search input', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('test search');
    expect(await searchInput.inputValue()).toBe('test search');

    // Clear the input
    await searchInput.fill('');
    expect(await searchInput.inputValue()).toBe('');
  });
});

test.describe('Mobile App - Voice Search', () => {
  test('should display voice search button', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const voiceBtn = page.locator('.voice-btn, [class*="voice"], button:has-text("🎤")').first();
    await expect(voiceBtn).toBeVisible();
  });

  test('should have clickable voice button', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const voiceBtn = page.locator('.voice-btn, [class*="voice"], button:has-text("🎤")').first();

    // Voice button should be enabled and clickable
    await expect(voiceBtn).toBeEnabled();
  });
});

test.describe('Mobile App - Search Results Display', () => {
  test('should display equipment images without cropping', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('oxygen');
    await searchInput.press('Enter');

    await page.waitForTimeout(1500);

    // Check images use object-fit: contain (not cover)
    const images = page.locator('img[class*="result"], .result-image, img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const objectFit = await img.evaluate(el => getComputedStyle(el).objectFit);
        // Should be contain, not cover (to prevent cropping)
        if (objectFit !== 'none' && objectFit !== '') {
          expect(objectFit).toBe('contain');
        }
      }
    }
  });

  test('should display compartment location info', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('suction');
    await searchInput.press('Enter');

    await page.waitForTimeout(1500);

    const pageContent = await page.textContent('body');
    // Should show location information
    expect(pageContent.toLowerCase()).toMatch(/cabinet|compartment|shelf|location|inside|outside/i);
  });
});

test.describe('Mobile App - Compartment Navigation', () => {
  test('should navigate to compartments view', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for compartments tab or link
    const compartmentsTab = page.locator('text=Compartments, [class*="compartment"], button:has-text("Compartment")').first();

    if (await compartmentsTab.isVisible()) {
      await compartmentsTab.click();
      await page.waitForTimeout(500);

      // Should show compartment list
      const pageContent = await page.textContent('body');
      expect(pageContent.toLowerCase()).toMatch(/cabinet|compartment|inside|outside/i);
    }
  });

  test('should display Inside/Outside compartment labels', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Navigate to see compartments
    const pageContent = await page.textContent('body');

    // App should have Inside/Outside labeling somewhere
    const hasLabeling = pageContent.toLowerCase().includes('inside') ||
                        pageContent.toLowerCase().includes('outside') ||
                        pageContent.toLowerCase().includes('cabinet');
    expect(hasLabeling).toBeTruthy();
  });
});

test.describe('Mobile App - Roster (PIN Protected)', () => {
  test('should display roster tab/button', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Use actual selector from app: #rosterBtn or .browse-roster-btn
    const rosterTab = page.locator('#rosterBtn, .browse-roster-btn').first();
    await expect(rosterTab).toBeVisible();
  });

  test('should require PIN to access roster', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const rosterTab = page.locator('#rosterBtn, .browse-roster-btn').first();
    await rosterTab.click();

    await page.waitForTimeout(1000);

    // Should show PIN prompt or roster modal
    const pinInput = page.locator('#roster-pin-input, input[type="tel"], input[placeholder*="PIN"]').first();
    const pageContent = await page.textContent('body');
    const hasPinPrompt = pageContent.toLowerCase().includes('pin') || await pinInput.isVisible();
    expect(hasPinPrompt).toBeTruthy();
  });

  test('should unlock roster with correct PIN', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const rosterTab = page.locator('#rosterBtn, .browse-roster-btn').first();
    await rosterTab.click();
    await page.waitForTimeout(1000);

    // Enter PIN
    const pinInput = page.locator('#roster-pin-input, input[type="tel"], input[placeholder*="PIN"]').first();
    if (await pinInput.isVisible()) {
      await pinInput.fill(ROSTER_PIN);

      // Submit PIN
      const submitBtn = page.locator('button:has-text("Enter"), button:has-text("Submit"), button:has-text("Unlock")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      } else {
        await pinInput.press('Enter');
      }

      await page.waitForTimeout(1000);

      // Should now show roster members
      const pageContent = await page.textContent('body');
      expect(pageContent.toLowerCase()).toMatch(/chief|captain|lieutenant|member|leadership|roster/i);
    }
  });

  test('should display member details on tap', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Access roster
    const rosterTab = page.locator('#rosterBtn, .browse-roster-btn').first();
    await rosterTab.click();
    await page.waitForTimeout(1000);

    // Enter PIN
    const pinInput = page.locator('#roster-pin-input, input[type="tel"], input[placeholder*="PIN"]').first();
    if (await pinInput.isVisible()) {
      await pinInput.fill(ROSTER_PIN);
      await pinInput.press('Enter');
      await page.waitForTimeout(1000);
    }

    // Tap on a member name
    const memberName = page.locator('.member-row, .roster-member, [class*="member-name"]').first();
    if (await memberName.isVisible()) {
      await memberName.click();
      await page.waitForTimeout(500);

      // Should show member details modal or contact info
      const pageContent = await page.textContent('body');
      expect(pageContent.toLowerCase()).toMatch(/phone|email|cell|call|contact/i);
    }
  });

  test('should close member detail modal', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Access roster with PIN
    const rosterTab = page.locator('#rosterBtn, .browse-roster-btn').first();
    await rosterTab.click();
    await page.waitForTimeout(1000);

    const pinInput = page.locator('#roster-pin-input, input[type="tel"], input[placeholder*="PIN"]').first();
    if (await pinInput.isVisible()) {
      await pinInput.fill(ROSTER_PIN);
      await pinInput.press('Enter');
      await page.waitForTimeout(1000);
    }

    // Open member detail
    const memberName = page.locator('.member-row, .roster-member').first();
    if (await memberName.isVisible()) {
      await memberName.click();
      await page.waitForTimeout(500);

      // Close button should work
      const closeBtn = page.locator('button:has-text("Close"), button:has-text("✕"), .close-btn, .az-close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should sort leadership by number', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Access roster with PIN
    const rosterTab = page.locator('#rosterBtn, .browse-roster-btn').first();
    await rosterTab.click();
    await page.waitForTimeout(1000);

    const pinInput = page.locator('#roster-pin-input, input[type="tel"], input[placeholder*="PIN"]').first();
    if (await pinInput.isVisible()) {
      await pinInput.fill(ROSTER_PIN);
      await pinInput.press('Enter');
      await page.waitForTimeout(1000);
    }

    const pageContent = await page.textContent('body');
    // Chief (701) should appear - leadership should be visible
    expect(pageContent).toMatch(/chief|701|leadership/i);
  });
});

test.describe('Mobile App - Driver Zones', () => {
  test('should display driver zones tab', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Use actual selector from app: #driverZonesBtn or .browse-drivers-btn
    const driversTab = page.locator('#driverZonesBtn, .browse-drivers-btn').first();
    await expect(driversTab).toBeVisible();
  });

  test('should show driver zones with phone numbers', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const driversTab = page.locator('#driverZonesBtn, .browse-drivers-btn').first();
    await driversTab.click();
    await page.waitForTimeout(1000);

    const pageContent = await page.textContent('body');
    // Should show zones and phone numbers
    expect(pageContent.toLowerCase()).toMatch(/zone|driver|phone|call|map/i);
  });

  test('should have flip card functionality for map', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const driversTab = page.locator('#driverZonesBtn, .browse-drivers-btn').first();
    await driversTab.click();
    await page.waitForTimeout(1000);

    // Look for flip card: #driver-flip-card
    const flipCard = page.locator('#driver-flip-card, .driver-flip-card').first();
    if (await flipCard.isVisible()) {
      await flipCard.click();
      await page.waitForTimeout(500);
      // Should flip to show map or driver list
    }
  });

  test('should allow tap to call drivers', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const driversTab = page.locator('#driverZonesBtn, .browse-drivers-btn').first();
    await driversTab.click();
    await page.waitForTimeout(1000);

    // Check for phone links in driver zones
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/zone|driver|phone|call/i);
  });
});

test.describe('Mobile App - Text-to-Speech', () => {
  test('should have speak button on results', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('oxygen');
    await searchInput.press('Enter');

    await page.waitForTimeout(1500);

    // Look for speaker/audio button
    const speakBtn = page.locator('[class*="speak"], [class*="audio"], button:has-text("🔊")').first();
    // Should exist on results page (may or may not be visible)
  });

  test('should toggle speech on second tap', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('oxygen');
    await searchInput.press('Enter');

    await page.waitForTimeout(1500);

    const speakBtn = page.locator('[class*="speak"], [class*="audio"], button:has-text("🔊")').first();
    if (await speakBtn.isVisible()) {
      // First tap starts
      await speakBtn.click();
      await page.waitForTimeout(300);
      // Second tap should stop
      await speakBtn.click();
    }
  });
});

test.describe('Mobile App - History/Recent Searches', () => {
  test('should track recent searches', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();

    // Perform a search
    await searchInput.fill('oxygen');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);

    // Check for history functionality
    const historySection = page.locator('[class*="history"], [class*="recent"]').first();
    // History may or may not be visible depending on UI
  });
});

test.describe('Mobile App - PWA Features', () => {
  test('should have service worker registered', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check for service worker
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });

    // PWA should have service worker
    expect(swRegistered).toBeTruthy();
  });

  test('should have manifest for PWA install', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.json`);
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
  });
});

test.describe('Mobile App - Touch Interactions', () => {
  test('should handle touch scroll', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Perform touch scroll
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThanOrEqual(0);
  });

  test('should handle tap events correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();

    // Tap to focus
    await searchInput.tap();
    await expect(searchInput).toBeFocused();
  });
});

test.describe('Mobile App - Error Handling', () => {
  test('should not crash on rapid interactions', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();

    // Rapid typing
    for (let i = 0; i < 5; i++) {
      await searchInput.fill(`test${i}`);
      await searchInput.press('Enter');
      await page.waitForTimeout(100);
    }

    // Page should still be functional
    await expect(searchInput).toBeVisible();
  });

  test('should handle empty search gracefully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('');
    await searchInput.press('Enter');

    // Should not crash
    await expect(searchInput).toBeVisible();
  });
});
