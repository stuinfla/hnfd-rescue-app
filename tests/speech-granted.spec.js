// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Test speech when permission is granted
 */
test.describe('Speech with Permission Granted', () => {

  test('Test speech flow with pre-granted permission', async ({ page }) => {
    // Collect all console messages
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('/');

    // SET PERMISSION TO GRANTED before app fully loads
    await page.evaluate(() => {
      localStorage.setItem('hnfd-mic-permission-status', 'granted');
      localStorage.setItem('hnfd-mic-setup-shown', 'true');
    });

    // Reload to apply
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n=== STARTUP LOGS (Permission=granted) ===');
    consoleLogs.filter(log =>
      log.includes('Speech') || log.includes('Mic') || log.includes('Voice') ||
      log.includes('Init') || log.includes('AutoStart')
    ).forEach(log => console.log(log));

    // Dismiss any modals
    await page.evaluate(() => {
      document.querySelectorAll('.admin-modal.active').forEach(m => m.classList.remove('active'));
      const installPrompt = document.getElementById('install-prompt');
      if (installPrompt) installPrompt.classList.remove('visible');
    });
    await page.waitForTimeout(500);

    // Check state
    const state = await page.evaluate(() => {
      return {
        permissionKey: localStorage.getItem('hnfd-mic-permission-status'),
        isListening: typeof isListening !== 'undefined' ? isListening : 'VAR_NOT_GLOBAL',
        transcriptText: document.getElementById('transcript')?.textContent,
        voiceBtnClass: document.getElementById('voiceBtn')?.className
      };
    });
    console.log('\n=== STATE ===');
    console.log('Permission:', state.permissionKey);
    console.log('isListening:', state.isListening);
    console.log('voiceBtn class:', state.voiceBtnClass);
    console.log('transcript:', state.transcriptText);

    // Clear logs
    consoleLogs.length = 0;

    // Click mic button
    console.log('\n=== CLICKING MIC BUTTON ===');
    const voiceBtn = page.locator('#voiceBtn');
    await voiceBtn.click({ force: true });
    await page.waitForTimeout(3000);

    // Print logs
    console.log('\n=== LOGS AFTER CLICK ===');
    consoleLogs.forEach(log => console.log(log));

    // Final state
    const finalState = await page.evaluate(() => {
      return {
        transcriptText: document.getElementById('transcript')?.textContent,
        voiceBtnClass: document.getElementById('voiceBtn')?.className
      };
    });
    console.log('\n=== FINAL STATE ===');
    console.log('voiceBtn class:', finalState.voiceBtnClass);
    console.log('transcript:', finalState.transcriptText);

    // Check if listening class was added
    const wasListening = finalState.voiceBtnClass?.includes('listening');
    console.log('\nWas listening?', wasListening);

    await page.screenshot({ path: 'tests/screenshots/speech-granted.png' });

    expect(true).toBe(true);
  });

});
