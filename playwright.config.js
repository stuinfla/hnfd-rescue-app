// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * HNFD Rescue Equipment Finder - Playwright Test Configuration
 *
 * Mobile tests: Main app (user-facing) - optimized for mobile devices
 * Desktop tests: Admin portal - optimized for PC
 */

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: 'https://hnfd-rescue.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Mobile tests for main user-facing app
    {
      name: 'mobile-app',
      testMatch: /mobile\.spec\.js/,
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-android',
      testMatch: /mobile\.spec\.js/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
        isMobile: true,
        hasTouch: true,
      },
    },

    // Desktop tests for admin portal
    {
      name: 'desktop-admin',
      testMatch: /admin\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'desktop-admin-firefox',
      testMatch: /admin\.spec\.js/,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});
