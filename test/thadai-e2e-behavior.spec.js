// @ts-check
import { test, expect } from './fixtures/extension'
import { setThadaiConfig } from './util/helper'

test('purchase access scenario', async ({ page, extensionId }) => {
  test.setTimeout(60_000)
  await page.goto('https://reddit.com')
  await page.waitForSelector('#thadai-viewport-blocker', { timeout: 10000 })
  // Check if the blocker element exists in the DOM
  const blocker = await page.$('#thadai-viewport-blocker')
  expect(blocker).not.toBeNull()
  // Optionally, check if it is visible
  const isVisible = await blocker.isVisible()
  expect(isVisible).toBe(true)
  // If you want to check inside the shadow DOM:
  const shadowRoot = await blocker.evaluateHandle((el) => el.shadowRoot)
  // For example, check for a button inside the shadow root
  const unblockButton = await shadowRoot.$('#thadai-viewport-blocker-unblock-button')
  expect(unblockButton).not.toBeNull()
  await unblockButton.click()
  // Navigate to the popup page
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)
  await setThadaiConfig(page)
  // Reload the popup page to pick up the configuration
  await page.reload()
  await page.waitForSelector('#popup-user-inputs-section')
  const purchaseAccessButton = await page.$('#popup-user-deposit-intent-button')
  // The deposit intent button should show Purchase Access
  expect(purchaseAccessButton).not.toBeNull()
  expect(await purchaseAccessButton.textContent()).toBe('Purchase access')
  // Before clicking, the variable POPUP_OPENED_PROGRAMATICALLY should be set to true
  await page.evaluate(() => {
    chrome.storage.local.set({ POPUP_OPENED_PROGRAMATICALLY: true })
  })
  await page.click('#popup-user-deposit-intent-button')
  const [popupClosed] = await Promise.all([page.waitForEvent('close')])
  // At this point, you know the popup closed as expected.
  // Open a new page for further actions
  const newPage = await page.context().newPage()
  await newPage.goto('https://reddit.com')
  // The viewport blocker should be gone after purchase access flow
  await newPage.waitForSelector('#thadai-viewport-blocker', { state: 'detached', timeout: 10000 })
  const blockerAfter = await newPage.$('#thadai-viewport-blocker')
  expect(blockerAfter).toBeNull()
})

test('topup access scenario', async ({ page, extensionId }) => {
  test.setTimeout(60_000)
  await page.goto('https://reddit.com')
  await page.waitForSelector('#thadai-viewport-blocker', { timeout: 10000 })
  // Check if the blocker element exists in the DOM
  const blocker = await page.$('#thadai-viewport-blocker')
  expect(blocker).not.toBeNull()
  // Optionally, check if it is visible
  const isVisible = await blocker.isVisible()
  expect(isVisible).toBe(true)
  // If you want to check inside the shadow DOM:
  const shadowRoot = await blocker.evaluateHandle((el) => el.shadowRoot)
  // For example, check for a button inside the shadow root
  const unblockButton = await shadowRoot.$('#thadai-viewport-blocker-unblock-button')
  expect(unblockButton).not.toBeNull()
  await unblockButton.click()
  // Navigate to the popup page
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)
  await setThadaiConfig(page)
  // Reload the popup page to pick up the configuration
  await page.reload()
  await page.waitForSelector('#popup-user-inputs-section')
  const purchaseAccessButton = await page.$('#popup-user-deposit-intent-button')
  // The deposit intent button should show Purchase Access
  expect(purchaseAccessButton).not.toBeNull()
  expect(await purchaseAccessButton.textContent()).toBe('Purchase access')
  // Before clicking, the variable POPUP_OPENED_PROGRAMATICALLY should be set to true
  await page.evaluate(() => {
    chrome.storage.local.set({ POPUP_OPENED_PROGRAMATICALLY: true })
  })
  await page.click('#popup-user-deposit-intent-button')
  const [popupClosed] = await Promise.all([page.waitForEvent('close')])
  // At this point, you know the popup closed as expected.
  // Open a new page for further actions
  const newPage = await page.context().newPage()
  await newPage.goto('https://reddit.com')
  // The viewport blocker should be gone after purchase access flow
  await newPage.waitForSelector('#thadai-viewport-blocker', { state: 'detached', timeout: 10000 })
  const blockerAfter = await newPage.$('#thadai-viewport-blocker')
  expect(blockerAfter).toBeNull()
  // Now, simulate the user having some access but needing to top up
  // Navigate to the popup page
  await newPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)
  await setThadaiConfig(newPage)
  await newPage.reload()
  await newPage.waitForSelector('#popup-user-inputs-section')
  const topUpButton = await newPage.$('#popup-user-deposit-intent-button')
  // The deposit intent button should now show Top Up Access
  expect(topUpButton).not.toBeNull()
  expect(await topUpButton.textContent()).toBe('Topup access')
})
