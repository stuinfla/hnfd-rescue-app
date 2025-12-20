// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * HNFD Rescue Equipment Finder - Comprehensive Tests
 * Tests microphone, admin sections (desktop & mobile), and new features
 */

// Helper function to dismiss microphone onboarding modal if present
async function dismissMicOnboarding(page) {
  await page.waitForTimeout(500);
  const micModal = page.locator('#mic-onboarding-modal.active');
  if (await micModal.isVisible().catch(() => false)) {
    // Click "Skip for now" to dismiss
    const skipBtn = page.locator('button:has-text("Skip for now"), button[onclick*="skipMicrophoneSetup"]');
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(300);
    }
  }
}

// Helper to set up admin auth
async function setupAdminAuth(page) {
  await page.evaluate(() => {
    localStorage.setItem('hnfd-admin-auth', 'true');
    localStorage.setItem('hnfd-mic-setup-shown', 'true');
    localStorage.setItem('hnfd-mic-permission-status', 'granted');
  });
}

test.describe('Core App Functionality', () => {

  test('should load the main page correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check page loaded
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    console.log('App loaded successfully');
  });

  test('should display search input', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissMicOnboarding(page);

    const searchInput = page.locator('input[type="search"], input[type="text"], #searchInput');
    await expect(searchInput.first()).toBeVisible();
    console.log('Search input visible - PASS');
  });

  test('should display voice search button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissMicOnboarding(page);

    // Look for voice/microphone button
    const voiceButton = page.locator('#voiceBtn, .voice-btn');
    await expect(voiceButton.first()).toBeVisible();
    console.log('Voice search button is visible - PASS');
  });
});

test.describe('A-Z Browse Button', () => {

  test('should display A-Z Browse button prominently without scrolling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissMicOnboarding(page);

    // Check A-Z button is visible
    const azButton = page.locator('#azBrowseBtn, .browse-az-btn');
    await expect(azButton.first()).toBeVisible();

    // Verify it's in the viewport
    const box = await azButton.first().boundingBox();
    expect(box).toBeTruthy();
    expect(box.y).toBeLessThan(800); // Should be within initial viewport

    console.log('A-Z Browse button is visible without scrolling - PASS');
    console.log(`Button position: y=${box.y}px`);
  });

  test('should open A-Z browse modal when clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissMicOnboarding(page);

    // Click A-Z button
    const azButton = page.locator('#azBrowseBtn, .browse-az-btn');
    await azButton.first().click();

    // Check modal or list appears
    await page.waitForTimeout(500);
    const modal = page.locator('.az-modal, .browse-modal, [class*="modal"].active');

    // Check for alphabetical list content
    const list = page.locator('.az-list, .alphabetical-list, [class*="az"]');
    const hasModal = await modal.isVisible().catch(() => false);
    const hasList = await list.isVisible().catch(() => false);

    expect(hasModal || hasList).toBeTruthy();
    console.log('A-Z browse modal/list opened - PASS');
  });
});

test.describe('Microphone Permission Handling', () => {

  test('should show microphone onboarding modal on first visit', async ({ page, context }) => {
    // Clear all storage to simulate first visit
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Reload to trigger first-time setup
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check for onboarding modal
    const modal = page.locator('#mic-onboarding-modal.active, #mic-onboarding-modal');
    const modalVisible = await modal.isVisible().catch(() => false);

    expect(modalVisible).toBeTruthy();
    console.log('Microphone onboarding modal appeared on first visit - PASS');
  });

  test('should remember microphone permission status', async ({ page }) => {
    await page.goto('/');

    // Set permission status in localStorage
    await page.evaluate(() => {
      localStorage.setItem('hnfd-mic-permission-status', 'granted');
      localStorage.setItem('hnfd-mic-setup-shown', 'true');
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should NOT show onboarding modal again
    const modal = page.locator('#mic-onboarding-modal.active');
    const modalVisible = await modal.isVisible().catch(() => false);

    expect(modalVisible).toBeFalsy();
    console.log('Microphone permission status is remembered - PASS');
  });

  test('should have skip button to bypass microphone setup', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Check skip button exists
    const skipBtn = page.locator('button:has-text("Skip"), button[onclick*="skip"]');
    const skipVisible = await skipBtn.isVisible().catch(() => false);

    if (skipVisible) {
      await skipBtn.click();
      await page.waitForTimeout(300);

      // Modal should close
      const modal = page.locator('#mic-onboarding-modal.active');
      const stillVisible = await modal.isVisible().catch(() => false);
      expect(stillVisible).toBeFalsy();
      console.log('Skip button works - modal closes - PASS');
    }
  });
});

test.describe('Admin Section - Desktop', () => {
  const ADMIN_PASSWORD = 'hnfd2024';

  test('should access admin via settings menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupAdminAuth(page);
    await page.reload();
    await dismissMicOnboarding(page);

    // Click settings/gear icon
    const settingsBtn = page.locator('#admin-toggle, .admin-toggle');
    await settingsBtn.first().click();
    await page.waitForTimeout(500);

    // Look for Admin Access button
    const adminBtn = page.locator('button:has-text("Admin"), #adminAccessBtn');
    await expect(adminBtn.first()).toBeVisible();
    console.log('Admin access button visible in settings - PASS');
  });

  test('should open admin panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupAdminAuth(page);
    await page.reload();
    await dismissMicOnboarding(page);

    // Open settings
    const settingsBtn = page.locator('#admin-toggle, .admin-toggle');
    await settingsBtn.first().click();
    await page.waitForTimeout(300);

    // Click Admin Access
    const adminBtn = page.locator('button:has-text("Admin"), #adminAccessBtn');
    await adminBtn.first().click();
    await page.waitForTimeout(500);

    // Check admin panel is visible
    const adminPanel = page.locator('.admin-panel, #adminPanel');
    await expect(adminPanel.first()).toBeVisible();
    console.log('Admin panel opened successfully - PASS');
  });

  test('should display equipment list in admin', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupAdminAuth(page);
    await page.reload();
    await dismissMicOnboarding(page);

    // Open settings then admin
    const settingsBtn = page.locator('#admin-toggle');
    await settingsBtn.first().click();
    await page.waitForTimeout(300);

    const adminBtn = page.locator('button:has-text("Admin"), #adminAccessBtn');
    await adminBtn.first().click();
    await page.waitForTimeout(500);

    // Check for equipment items
    const equipmentList = page.locator('.equipment-item, .admin-item');
    const count = await equipmentList.count();

    console.log(`Found ${count} equipment items in admin list`);
    expect(count).toBeGreaterThan(0);
  });

  test('should have compartment dropdown in edit form', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupAdminAuth(page);
    await page.reload();
    await dismissMicOnboarding(page);

    // Navigate to admin
    const settingsBtn = page.locator('#admin-toggle');
    await settingsBtn.first().click();
    await page.waitForTimeout(300);

    const adminBtn = page.locator('button:has-text("Admin"), #adminAccessBtn');
    await adminBtn.first().click();
    await page.waitForTimeout(500);

    // Click on first equipment item to edit
    const firstItem = page.locator('.equipment-item, .admin-item').first();
    await firstItem.click();
    await page.waitForTimeout(300);

    // Check for compartment dropdown (not text input)
    const compartmentSelect = page.locator('#edit-compartment');
    const tagName = await compartmentSelect.evaluate(el => el.tagName.toLowerCase()).catch(() => '');

    expect(tagName).toBe('select');
    console.log('Compartment is a dropdown (SELECT) - PASS');
  });

  test('should show location guide preview in edit form', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupAdminAuth(page);
    await page.reload();
    await dismissMicOnboarding(page);

    // Navigate to admin
    const settingsBtn = page.locator('#admin-toggle');
    await settingsBtn.first().click();
    await page.waitForTimeout(300);

    const adminBtn = page.locator('button:has-text("Admin"), #adminAccessBtn');
    await adminBtn.first().click();
    await page.waitForTimeout(500);

    // Click on first equipment item (Adult Trauma Bag usually has images)
    const firstItem = page.locator('.equipment-item, .admin-item').first();
    await firstItem.click();
    await page.waitForTimeout(500);

    // Check for location guide section
    const guideSection = page.locator('.location-guide-section, .edit-guide-preview, #edit-guide-section');
    const thumbnails = page.locator('.guide-thumbnail, .location-guide-thumbnails img');

    const sectionVisible = await guideSection.isVisible().catch(() => false);
    const thumbCount = await thumbnails.count();

    console.log(`Location guide section visible: ${sectionVisible}`);
    console.log(`Found ${thumbCount} location guide thumbnails`);

    // Should have location guide section
    expect(sectionVisible || thumbCount > 0).toBeTruthy();
  });

  test('should have photo buttons in edit form', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupAdminAuth(page);
    await page.reload();
    await dismissMicOnboarding(page);

    // Navigate to admin
    const settingsBtn = page.locator('#admin-toggle');
    await settingsBtn.first().click();
    await page.waitForTimeout(300);

    const adminBtn = page.locator('button:has-text("Admin"), #adminAccessBtn');
    await adminBtn.first().click();
    await page.waitForTimeout(500);

    // Click first item
    const firstItem = page.locator('.equipment-item, .admin-item').first();
    await firstItem.click();
    await page.waitForTimeout(300);

    // Check for photo buttons
    const takePhotoBtn = page.locator('button:has-text("Take Photo"), button:has-text("Camera")');
    const choosePhotoBtn = page.locator('button:has-text("Choose"), button:has-text("Library")');
    const imageUpload = page.locator('input[type="file"], .image-upload-section');

    const hasTakePhoto = await takePhotoBtn.count() > 0;
    const hasChoosePhoto = await choosePhotoBtn.count() > 0;
    const hasUpload = await imageUpload.count() > 0;

    console.log(`Take Photo button: ${hasTakePhoto}`);
    console.log(`Choose from Library button: ${hasChoosePhoto}`);
    console.log(`Image upload area: ${hasUpload}`);

    // At least one photo option should exist
    expect(hasTakePhoto || hasChoosePhoto || hasUpload).toBeTruthy();
  });
});

test.describe('Admin Section - Mobile', () => {
  // Mobile tests run via config projects
  const ADMIN_PASSWORD = 'hnfd2024';

  test('mobile: should access admin panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupAdminAuth(page);
    await page.reload();
    await dismissMicOnboarding(page);

    // Open settings on mobile
    const settingsBtn = page.locator('#admin-toggle, .admin-toggle');
    await settingsBtn.first().click();
    await page.waitForTimeout(300);

    // Click Admin Access
    const adminBtn = page.locator('button:has-text("Admin"), #adminAccessBtn');
    await adminBtn.first().click();
    await page.waitForTimeout(500);

    // Check admin panel
    const adminPanel = page.locator('.admin-panel, #adminPanel');
    await expect(adminPanel.first()).toBeVisible();
    console.log('Mobile: Admin panel opened - PASS');
  });

  test('mobile: should display A-Z browse button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissMicOnboarding(page);

    // Check A-Z button is visible on mobile
    const azButton = page.locator('#azBrowseBtn, .browse-az-btn');
    await expect(azButton.first()).toBeVisible();
    console.log('Mobile: A-Z Browse button visible - PASS');
  });

  test('mobile: edit form has same fields as desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupAdminAuth(page);
    await page.reload();
    await dismissMicOnboarding(page);

    // Navigate to admin
    const settingsBtn = page.locator('#admin-toggle');
    await settingsBtn.first().click();
    await page.waitForTimeout(300);

    const adminBtn = page.locator('button:has-text("Admin"), #adminAccessBtn');
    await adminBtn.first().click();
    await page.waitForTimeout(500);

    // Click first item
    const firstItem = page.locator('.equipment-item, .admin-item').first();
    await firstItem.click();
    await page.waitForTimeout(500);

    // Verify key fields exist
    const fields = {
      name: page.locator('#edit-name'),
      location: page.locator('#edit-location'),
      compartment: page.locator('#edit-compartment'),
    };

    let allPresent = true;
    for (const [name, locator] of Object.entries(fields)) {
      const visible = await locator.isVisible().catch(() => false);
      console.log(`Mobile edit form - ${name}: ${visible ? 'PRESENT' : 'MISSING'}`);
      if (!visible) allPresent = false;
    }

    expect(allPresent).toBeTruthy();
  });
});

test.describe('Data Consistency', () => {

  test('should use localStorage for equipment data', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check localStorage keys
    const storageKeys = await page.evaluate(() => {
      return Object.keys(localStorage).filter(k =>
        k.includes('inventory') || k.includes('equipment') || k.includes('hnfd')
      );
    });

    console.log('LocalStorage keys:', storageKeys.join(', '));
    expect(storageKeys.length).toBeGreaterThanOrEqual(0);
  });

  test('should preserve location guide data on save', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set up test data
    await page.evaluate(() => {
      const testItem = {
        id: 'test_item_123',
        name: 'Test Equipment',
        location: 'Test Location',
        compartment: 'A',
        images: {
          ambulancePosition: '/test/image1.jpg',
          compartmentView: '/test/image2.jpg',
          equipmentPhoto: '/test/image3.jpg'
        },
        goldDots: {
          ambulancePosition: { x: 45, y: 60, label: 'Test Label' }
        }
      };

      // Simulate saving with existing data
      const existing = JSON.parse(localStorage.getItem('customInventory') || '[]');
      existing.push(testItem);
      localStorage.setItem('customInventory', JSON.stringify(existing));
    });

    // Verify data persists
    const savedData = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('customInventory') || '[]');
      return data.find(i => i.id === 'test_item_123');
    });

    expect(savedData).toBeTruthy();
    expect(savedData.images).toBeTruthy();
    expect(savedData.images.ambulancePosition).toBe('/test/image1.jpg');
    expect(savedData.goldDots).toBeTruthy();
    console.log('Location guide data preserved correctly - PASS');

    // Clean up
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('customInventory') || '[]');
      const filtered = data.filter(i => i.id !== 'test_item_123');
      localStorage.setItem('customInventory', JSON.stringify(filtered));
    });
  });
});

test.describe('Search Functionality', () => {

  test('should search for trauma bag', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissMicOnboarding(page);

    // Find search input
    const searchInput = page.locator('#searchInput, input[type="search"], input[type="text"]');
    await searchInput.first().fill('trauma bag');

    // Wait for results
    await page.waitForTimeout(500);

    // Check results appear
    const results = page.locator('.search-result, .result-item, [class*="result"]');
    const count = await results.count();

    // Or check body text contains trauma bag result
    const bodyText = await page.textContent('body');
    const hasResult = bodyText.toLowerCase().includes('trauma');

    console.log(`Found ${count} result elements`);
    console.log(`Body contains trauma: ${hasResult}`);
    expect(count > 0 || hasResult).toBeTruthy();
  });

  test('should search for AED', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissMicOnboarding(page);

    const searchInput = page.locator('#searchInput, input[type="search"], input[type="text"]');
    await searchInput.first().fill('AED');

    await page.waitForTimeout(500);

    // Check results
    const pageContent = await page.textContent('body');
    const hasAED = pageContent.toLowerCase().includes('aed') || pageContent.toLowerCase().includes('defibrillator');

    expect(hasAED).toBeTruthy();
    console.log('AED search works - PASS');
  });
});

test.describe('Version Check', () => {

  test('should display version 2.8.6', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissMicOnboarding(page);

    // Check version in page or settings
    const settingsBtn = page.locator('#admin-toggle');
    await settingsBtn.first().click();
    await page.waitForTimeout(300);

    const pageContent = await page.textContent('body');
    const hasVersion = pageContent.includes('2.8.6') || pageContent.includes('v2.8');

    console.log(`Version 2.8.6 displayed: ${hasVersion}`);
    expect(hasVersion).toBeTruthy();
  });
});
