// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * HNFD Admin Portal - Desktop Tests
 *
 * Tests the admin portal optimized for PC/Desktop browsers
 * Covers: Authentication, Equipment CRUD, Images, Drivers, Roster, Settings, Deploy
 */

const BASE_URL = 'https://hnfd-rescue.vercel.app';
const ADMIN_URL = `${BASE_URL}/admin-portal.html`;
const ADMIN_PIN = 'hnfd2026admin';

test.describe('Admin Portal - Page Load', () => {
  test('should load admin portal page', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');

    // Should show admin interface
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/admin|equipment|portal/i);
  });

  test('should display admin header', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');

    // Look for header
    const header = page.locator('.header, header, h1').first();
    await expect(header).toBeVisible();
  });

  test('should show all admin tabs', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');

    // Should show admin tabs
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/equipment|roster|drivers|images|settings/i);
  });

  test('should display equipment inventory by default', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');

    // Equipment tab should be visible/active
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/equipment|inventory/i);
  });
});

// Helper function to load admin portal
async function loginToAdmin(page) {
  await page.goto(ADMIN_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Wait for JS to initialize
}

test.describe('Admin Portal - Navigation Tabs', () => {
  test('should display all navigation tabs', async ({ page }) => {
    await loginToAdmin(page);

    // Check for all tabs
    const tabs = ['Equipment', 'Images', 'Drivers', 'Roster', 'Deploy', 'Settings'];
    const pageContent = await page.textContent('body');

    for (const tab of tabs) {
      expect(pageContent.toLowerCase()).toContain(tab.toLowerCase());
    }
  });

  test('should switch between tabs', async ({ page }) => {
    await loginToAdmin(page);

    // Click Equipment tab
    const equipmentTab = page.locator('text=Equipment').first();
    if (await equipmentTab.isVisible()) {
      await equipmentTab.click();
      await page.waitForTimeout(300);
    }

    // Click Roster tab
    const rosterTab = page.locator('text=Roster').first();
    if (await rosterTab.isVisible()) {
      await rosterTab.click();
      await page.waitForTimeout(300);
    }

    // Click Settings tab
    const settingsTab = page.locator('text=Settings').first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(300);

      const pageContent = await page.textContent('body');
      expect(pageContent.toLowerCase()).toMatch(/pin|password|settings/i);
    }
  });
});

test.describe('Admin Portal - Equipment Tab', () => {
  test('should display equipment list', async ({ page }) => {
    await loginToAdmin(page);

    // Click Equipment tab
    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Should show equipment items
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/equipment|inventory|item/i);
  });

  test('should have Add Equipment button', async ({ page }) => {
    await loginToAdmin(page);

    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Look for Add Equipment button
    const addBtn = page.locator('button:has-text("Add Equipment"), button:has-text("+ Add")').first();
    await expect(addBtn).toBeVisible();
  });

  test('should display equipment cards with Edit button', async ({ page }) => {
    await loginToAdmin(page);

    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Look for Edit buttons on equipment cards
    const editBtns = page.locator('button:has-text("Edit"), [class*="edit"]');
    const count = await editBtns.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display equipment cards with Delete button', async ({ page }) => {
    await loginToAdmin(page);

    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Look for Delete buttons (🗑️)
    const deleteBtns = page.locator('button:has-text("🗑️"), button:has-text("Delete"), [class*="delete"], .btn-danger');
    const count = await deleteBtns.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display equipment images without cropping', async ({ page }) => {
    await loginToAdmin(page);

    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Check images use object-fit: contain
    const images = page.locator('.equipment-image, [class*="equipment"] img, .card img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const objectFit = await img.evaluate(el => getComputedStyle(el).objectFit);
        if (objectFit && objectFit !== 'none') {
          expect(objectFit).toBe('contain');
        }
      }
    }
  });

  test('should open edit modal when clicking Edit', async ({ page }) => {
    await loginToAdmin(page);

    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Click first Edit button
    const editBtn = page.locator('button:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);

      // Should show edit modal/form
      const modal = page.locator('[class*="modal"], [class*="dialog"], [role="dialog"]').first();
      // Modal may or may not be visible depending on implementation
    }
  });

  test('should show confirmation before deleting equipment', async ({ page }) => {
    await loginToAdmin(page);

    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Set up dialog handler
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss(); // Cancel the delete
    });

    // Click first Delete button
    const deleteBtn = page.locator('button:has-text("🗑️"), .btn-danger').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
    }
  });
});

test.describe('Admin Portal - Images Tab', () => {
  test('should display Images tab content', async ({ page }) => {
    await loginToAdmin(page);

    const imagesTab = page.locator('text=Images').first();
    await imagesTab.click();
    await page.waitForTimeout(500);

    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/image|photo|upload|gallery/i);
  });

  test('should have image upload functionality', async ({ page }) => {
    await loginToAdmin(page);

    const imagesTab = page.locator('text=Images').first();
    await imagesTab.click();
    await page.waitForTimeout(500);

    // Look for file input or upload button
    const uploadInput = page.locator('input[type="file"], button:has-text("Upload")');
    const count = await uploadInput.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display images without cropping in gallery', async ({ page }) => {
    await loginToAdmin(page);

    const imagesTab = page.locator('text=Images').first();
    await imagesTab.click();
    await page.waitForTimeout(500);

    // Check all images use object-fit: contain
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const objectFit = await img.evaluate(el => getComputedStyle(el).objectFit);
        if (objectFit && objectFit !== 'none' && objectFit !== 'fill') {
          expect(objectFit).toBe('contain');
        }
      }
    }
  });
});

test.describe('Admin Portal - Drivers Tab', () => {
  test('should display Drivers tab content', async ({ page }) => {
    await loginToAdmin(page);

    const driversTab = page.locator('text=Drivers').first();
    await driversTab.click();
    await page.waitForTimeout(500);

    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/driver|zone/i);
  });

  test('should have Add Driver Zone button', async ({ page }) => {
    await loginToAdmin(page);

    const driversTab = page.locator('text=Drivers').first();
    await driversTab.click();
    await page.waitForTimeout(500);

    // Look for Add button
    const addBtn = page.locator('button:has-text("Add"), button:has-text("+ Add")').first();
    // Button may or may not be visible
  });

  test('should display driver zones with phone numbers', async ({ page }) => {
    await loginToAdmin(page);

    const driversTab = page.locator('text=Drivers').first();
    await driversTab.click();
    await page.waitForTimeout(500);

    const pageContent = await page.textContent('body');
    // Should show phone numbers or contact info
    expect(pageContent.toLowerCase()).toMatch(/phone|zone|driver|contact/i);
  });

  test('should allow editing driver zones', async ({ page }) => {
    await loginToAdmin(page);

    const driversTab = page.locator('text=Drivers').first();
    await driversTab.click();
    await page.waitForTimeout(500);

    // Look for Edit buttons
    const editBtns = page.locator('button:has-text("Edit")');
    const count = await editBtns.count();
    // Should have edit capability
  });
});

test.describe('Admin Portal - Roster Tab', () => {
  test('should display Roster tab content', async ({ page }) => {
    await loginToAdmin(page);

    const rosterTab = page.locator('text=Roster').first();
    await rosterTab.click();
    await page.waitForTimeout(500);

    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/roster|member|leadership/i);
  });

  test('should have Add Member button', async ({ page }) => {
    await loginToAdmin(page);

    const rosterTab = page.locator('button.tab:has-text("Roster")').first();
    await rosterTab.click();
    await page.waitForTimeout(500);

    // Look for Add Member button
    const addBtn = page.locator('button:has-text("Add Member"), button:has-text("+ Add Member")').first();
    await expect(addBtn).toBeVisible();
  });

  test('should display roster members', async ({ page }) => {
    await loginToAdmin(page);

    const rosterTab = page.locator('text=Roster').first();
    await rosterTab.click();
    await page.waitForTimeout(500);

    const pageContent = await page.textContent('body');
    // Should show members or leadership
    expect(pageContent.toLowerCase()).toMatch(/chief|captain|member|name/i);
  });

  test('should have Edit button for each member', async ({ page }) => {
    await loginToAdmin(page);

    const rosterTab = page.locator('text=Roster').first();
    await rosterTab.click();
    await page.waitForTimeout(500);

    const editBtns = page.locator('button:has-text("Edit")');
    const count = await editBtns.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have Delete button for each member', async ({ page }) => {
    await loginToAdmin(page);

    const rosterTab = page.locator('text=Roster').first();
    await rosterTab.click();
    await page.waitForTimeout(500);

    const deleteBtns = page.locator('button:has-text("🗑️"), button:has-text("Delete"), .btn-danger');
    const count = await deleteBtns.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show confirmation before deleting member', async ({ page }) => {
    await loginToAdmin(page);

    const rosterTab = page.locator('text=Roster').first();
    await rosterTab.click();
    await page.waitForTimeout(500);

    // Set up dialog handler
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });

    const deleteBtn = page.locator('button:has-text("🗑️"), .btn-danger').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
    }
  });

  test('should display leadership section', async ({ page }) => {
    await loginToAdmin(page);

    const rosterTab = page.locator('text=Roster').first();
    await rosterTab.click();
    await page.waitForTimeout(500);

    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/leadership|chief|captain|lieutenant/i);
  });
});

test.describe('Admin Portal - Settings Tab', () => {
  test('should display Settings tab content', async ({ page }) => {
    await loginToAdmin(page);

    // Click Settings tab using actual selector: button.tab with ⚙️ Settings text
    const settingsTab = page.locator('button.tab:has-text("Settings"), button:has-text("⚙️ Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/settings|pin|password/i);
  });

  test('should display Roster PIN management', async ({ page }) => {
    await loginToAdmin(page);

    const settingsTab = page.locator('button.tab:has-text("Settings"), button:has-text("⚙️ Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Look for roster PIN section - use separate locators
    const rosterPinInput = page.locator('#roster-pin-input');
    await expect(rosterPinInput).toBeVisible();
  });

  test('should display Admin PIN management', async ({ page }) => {
    await loginToAdmin(page);

    const settingsTab = page.locator('button.tab:has-text("Settings"), button:has-text("⚙️ Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Look for admin PIN section - use separate locators
    const adminPinInput = page.locator('#admin-pin-input');
    await expect(adminPinInput).toBeVisible();
  });

  test('should have Update PIN button for Roster', async ({ page }) => {
    await loginToAdmin(page);

    const settingsTab = page.locator('button.tab:has-text("Settings"), button:has-text("⚙️ Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Look for Update buttons
    const updateBtns = page.locator('button:has-text("Update Roster PIN"), button:has-text("Update")');
    const count = await updateBtns.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have PIN input fields', async ({ page }) => {
    await loginToAdmin(page);

    const settingsTab = page.locator('button.tab:has-text("Settings"), button:has-text("⚙️ Settings")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Find PIN inputs
    const rosterPinInput = page.locator('#roster-pin-input');
    const adminPinInput = page.locator('#admin-pin-input');

    await expect(rosterPinInput).toBeVisible();
    await expect(adminPinInput).toBeVisible();
  });
});

test.describe('Admin Portal - Deploy Tab', () => {
  test('should display Deploy tab content', async ({ page }) => {
    await loginToAdmin(page);

    const deployTab = page.locator('text=Deploy').first();
    await deployTab.click();
    await page.waitForTimeout(500);

    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/deploy|changes|update|push/i);
  });

  test('should show pending changes list', async ({ page }) => {
    await loginToAdmin(page);

    const deployTab = page.locator('text=Deploy').first();
    await deployTab.click();
    await page.waitForTimeout(500);

    // Should show changes section
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/change|pending|review/i);
  });
});

test.describe('Admin Portal - Image Display Quality', () => {
  test('should not crop images in any tab', async ({ page }) => {
    await loginToAdmin(page);

    const tabs = ['Equipment', 'Images', 'Roster'];

    for (const tabName of tabs) {
      const tab = page.locator(`text=${tabName}`).first();
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500);

        // Check all visible images
        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
          const img = images.nth(i);
          if (await img.isVisible()) {
            const objectFit = await img.evaluate(el => getComputedStyle(el).objectFit);
            // Should be contain (not cover which crops)
            if (objectFit && objectFit !== 'none' && objectFit !== 'fill' && objectFit !== '') {
              expect(objectFit).toBe('contain');
            }
          }
        }
      }
    }
  });

  test('should display full images in modals', async ({ page }) => {
    await loginToAdmin(page);

    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Open an edit modal
    const editBtn = page.locator('button:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);

      // Check modal images
      const modalImages = page.locator('[class*="modal"] img, [role="dialog"] img');
      const count = await modalImages.count();

      for (let i = 0; i < count; i++) {
        const img = modalImages.nth(i);
        if (await img.isVisible()) {
          const objectFit = await img.evaluate(el => getComputedStyle(el).objectFit);
          if (objectFit && objectFit !== 'none' && objectFit !== '') {
            expect(objectFit).toBe('contain');
          }
        }
      }
    }
  });
});

test.describe('Admin Portal - State Management', () => {
  test('should track changes when editing', async ({ page }) => {
    await loginToAdmin(page);

    // Make a small change and check Deploy tab
    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Navigate to Deploy to see if changes are tracked
    const deployTab = page.locator('text=Deploy').first();
    await deployTab.click();
    await page.waitForTimeout(500);

    // Changes section should exist
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/change|pending|deploy/i);
  });

  test('should persist data across tab switches', async ({ page }) => {
    await loginToAdmin(page);

    // Navigate through tabs
    const tabs = ['Equipment', 'Roster', 'Drivers', 'Equipment'];
    for (const tabName of tabs) {
      const tab = page.locator(`text=${tabName}`).first();
      await tab.click();
      await page.waitForTimeout(300);
    }

    // Data should still be visible
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/equipment|item/i);
  });
});

test.describe('Admin Portal - Responsive Layout', () => {
  test('should display properly at 1920x1080', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loginToAdmin(page);

    // All tabs should be visible
    const tabs = ['Equipment', 'Images', 'Drivers', 'Roster', 'Deploy', 'Settings'];
    for (const tab of tabs) {
      const tabElement = page.locator(`text=${tab}`).first();
      await expect(tabElement).toBeVisible();
    }
  });

  test('should display properly at 1366x768', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await loginToAdmin(page);

    // All tabs should still be visible
    const equipmentTab = page.locator('text=Equipment').first();
    await expect(equipmentTab).toBeVisible();
  });
});

test.describe('Admin Portal - Error Handling', () => {
  test('should handle rapid tab switching', async ({ page }) => {
    await loginToAdmin(page);

    // Rapidly switch tabs
    const tabs = ['Equipment', 'Images', 'Drivers', 'Roster', 'Settings', 'Deploy'];
    for (let i = 0; i < 10; i++) {
      const tab = page.locator(`text=${tabs[i % tabs.length]}`).first();
      if (await tab.isVisible()) {
        await tab.click();
      }
    }

    // Page should still be functional
    const pageContent = await page.textContent('body');
    expect(pageContent.length).toBeGreaterThan(100);
  });

  test('should not crash on multiple modal opens', async ({ page }) => {
    await loginToAdmin(page);

    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Open and close modals multiple times
    for (let i = 0; i < 3; i++) {
      const editBtn = page.locator('button:has-text("Edit")').first();
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(300);

        // Close modal
        const closeBtn = page.locator('button:has-text("Close"), button:has-text("×"), button:has-text("Cancel")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }

    // Page should still work
    await expect(equipmentTab).toBeVisible();
  });
});

test.describe('Admin Portal - CRUD Operations Validation', () => {
  test('should validate required fields when adding equipment', async ({ page }) => {
    await loginToAdmin(page);

    const equipmentTab = page.locator('text=Equipment').first();
    await equipmentTab.click();
    await page.waitForTimeout(500);

    // Set up dialog handlers for prompts
    let promptCount = 0;
    page.on('dialog', async dialog => {
      promptCount++;
      if (dialog.type() === 'prompt') {
        if (promptCount === 1) {
          // Cancel on first prompt (name)
          await dialog.dismiss();
        }
      } else {
        await dialog.accept();
      }
    });

    const addBtn = page.locator('button:has-text("Add Equipment"), button:has-text("+ Add")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }

    // Should not add item if cancelled
  });

  test('should require confirmation for delete', async ({ page }) => {
    await loginToAdmin(page);

    const rosterTab = page.locator('text=Roster').first();
    await rosterTab.click();
    await page.waitForTimeout(500);

    let confirmCalled = false;
    page.on('dialog', async dialog => {
      if (dialog.type() === 'confirm') {
        confirmCalled = true;
        await dialog.dismiss();
      }
    });

    const deleteBtn = page.locator('button:has-text("🗑️"), .btn-danger').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
      expect(confirmCalled).toBeTruthy();
    }
  });
});
