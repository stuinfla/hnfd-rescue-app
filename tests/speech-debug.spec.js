// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Debug test for speech recognition issues
 */
test.describe('Speech Recognition Debug', () => {

  test('Debug: Capture console output when tapping microphone', async ({ page }) => {
    // Collect all console messages
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Collect any page errors
    const pageErrors = [];
    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for app to initialize
    await page.waitForTimeout(3000);

    // Check for any startup errors
    console.log('\n=== STARTUP LOGS ===');
    consoleLogs.forEach(log => {
      if (log.includes('Speech') || log.includes('Mic') || log.includes('Voice') || log.includes('Init') || log.includes('AutoStart')) {
        console.log(log);
      }
    });

    // Dismiss onboarding modal if present
    const skipBtn = page.locator('text=Skip for now');
    if (await skipBtn.isVisible({ timeout: 2000 })) {
      console.log('\n>>> Onboarding modal visible - clicking Skip');
      await skipBtn.click();
      await page.waitForTimeout(1000);
    }

    // Check what the transcript text says
    const transcript = page.locator('#transcript');
    const transcriptText = await transcript.textContent();
    console.log('\n=== TRANSCRIPT TEXT ===');
    console.log('Current transcript:', transcriptText);

    // Check the voice label
    const voiceLabel = page.locator('#voiceLabel');
    const labelText = await voiceLabel.textContent();
    console.log('Voice label:', labelText);

    // Check localStorage state
    const localStorageState = await page.evaluate(() => {
      return {
        permissionKey: localStorage.getItem('hnfd-mic-permission-status'),
        setupShown: localStorage.getItem('hnfd-mic-setup-shown')
      };
    });
    console.log('\n=== LOCALSTORAGE STATE ===');
    console.log('Permission status:', localStorageState.permissionKey);
    console.log('Setup shown:', localStorageState.setupShown);

    // Check recognition state
    const recognitionState = await page.evaluate(() => {
      return {
        isListening: window.isListening,
        recognitionStarting: window.recognitionStarting,
        recognitionInitialized: window.recognitionInitialized,
        hasRecognition: !!window.recognition
      };
    });
    console.log('\n=== RECOGNITION STATE ===');
    console.log('isListening:', recognitionState.isListening);
    console.log('recognitionStarting:', recognitionState.recognitionStarting);
    console.log('recognitionInitialized:', recognitionState.recognitionInitialized);
    console.log('hasRecognition:', recognitionState.hasRecognition);

    // Clear logs before clicking
    consoleLogs.length = 0;

    // Now click the microphone button
    console.log('\n=== CLICKING MICROPHONE BUTTON ===');
    const voiceBtn = page.locator('#voiceBtn');
    await expect(voiceBtn).toBeVisible();
    await voiceBtn.click({ force: true });

    // Wait for things to happen
    await page.waitForTimeout(3000);

    // Print all logs after clicking
    console.log('\n=== LOGS AFTER CLICK ===');
    consoleLogs.forEach(log => console.log(log));

    // Check if any errors occurred
    console.log('\n=== PAGE ERRORS ===');
    if (pageErrors.length === 0) {
      console.log('No page errors');
    } else {
      pageErrors.forEach(err => console.log('ERROR:', err));
    }

    // Check recognition state after click
    const stateAfter = await page.evaluate(() => {
      return {
        isListening: window.isListening,
        recognitionStarting: window.recognitionStarting,
        voiceBtnClass: document.getElementById('voiceBtn')?.className,
        transcriptText: document.getElementById('transcript')?.textContent
      };
    });
    console.log('\n=== STATE AFTER CLICK ===');
    console.log('isListening:', stateAfter.isListening);
    console.log('recognitionStarting:', stateAfter.recognitionStarting);
    console.log('voiceBtn class:', stateAfter.voiceBtnClass);
    console.log('transcript:', stateAfter.transcriptText);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/speech-debug.png' });
    console.log('\n=== Screenshot saved to tests/screenshots/speech-debug.png ===');

    // The test should pass - we're just debugging
    expect(true).toBe(true);
  });

});
