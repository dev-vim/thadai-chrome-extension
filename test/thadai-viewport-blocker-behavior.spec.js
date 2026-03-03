// @ts-check
import { test, expect } from './fixtures/extension';

test('viewport blocked as expected on a listed website', async ({ page, extensionId }) => {
    await page.goto('https://reddit.com');
    await page.waitForSelector('#thadai-viewport-blocker', { timeout: 10000 });
    // Check if the blocker element exists in the DOM
    const blocker = await page.$('#thadai-viewport-blocker');
    expect(blocker).not.toBeNull();
    // Optionally, check if it is visible
    const isVisible = await blocker.isVisible();
    expect(isVisible).toBe(true);
    // If you want to check inside the shadow DOM:
    const shadowRoot = await blocker.evaluateHandle(el => el.shadowRoot);
    // For example, check for a button inside the shadow root
    const unblockButton = await shadowRoot.$('#thadai-viewport-blocker-unblock-button');
    expect(unblockButton).not.toBeNull();
});

test ('viewport blocker is not injected on unlisted websites', async ({ page, extensionId }) => {
    await page.goto('https://example.com');
    // Check that the blocker element does not exist in the DOM
    const blocker = await page.$('#thadai-viewport-blocker');
    expect(blocker).toBeNull();
});