// @ts-check
import { test, expect } from './fixtures/extension'
import { setThadaiConfig } from './util/helper'

test('popup without config', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)
  await expect(page.locator('#popup-banner-message')).toHaveText(
    'Kindly set up your configuration in the settings to proceed',
  )
})

test('popup after set config', async ({ page, context, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)
  const [settingsPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click('#settings-btn'),
  ])
  await settingsPage.waitForSelector('#save-settings-btn')

  // Fill in blockchain settings
  await settingsPage.fill(
    '#private-key-input',
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  )
  await settingsPage.fill('#chain-name-input', 'anvil')
  await settingsPage.fill('#chain-id-input', '31337')
  await settingsPage.fill('#chain-rpc-url-input', 'http://localhost:7777')
  await settingsPage.fill(
    '#thadai-contract-address-input',
    '0xAD523115cd35a8d4E60B3C0953E0E0ac10418309',
  )
  await settingsPage.click('#save-settings-btn')
  await settingsPage.click('#save-settings-btn')
  // Click the back button to return to popup
  await settingsPage.click('#settings-back-btn')
  // Manually reload the popup page
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)
  // Set the configuration in the popup page's context
  await setThadaiConfig(page)
  // Reload the popup page to pick up the configuration
  await page.reload()
  await page.waitForSelector('#popup-user-inputs-section')
})

test('popup when is rpc unavailable', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)
  await expect(page.locator('#popup-banner-message')).toHaveText(
    'Kindly set up your configuration in the settings to proceed',
  )
  // Set the configuration in the popup page's context
  await setThadaiConfig(page)
  await page.evaluate(() => {
    chrome.storage.local.set({ THADAI_CHAIN_RPC_URL: 'http://localhost:1234' })
  })
  // Reload the popup page to pick up the config
  await page.reload()
  await expect(page.locator('#popup-banner-message')).toHaveText(
    'Unable to connect to the blockchain network - check connection or configuration',
  )
})

test('popup when is rpc becomes available eventually', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)
  await expect(page.locator('#popup-banner-message')).toHaveText(
    'Kindly set up your configuration in the settings to proceed',
  )
  // Set the configuration in the popup page's context
  await setThadaiConfig(page)
  await page.evaluate(() => {
    chrome.storage.local.set({ THADAI_CHAIN_RPC_URL: 'http://localhost:1234' })
  })
  await page.reload()
  await expect(page.locator('#popup-banner-message')).toHaveText(
    'Unable to connect to the blockchain network - check connection or configuration',
  )
  await page.evaluate(() => {
    chrome.storage.local.set({ THADAI_CHAIN_RPC_URL: 'http://localhost:7777' })
  })
  await page.reload()
  await page.waitForSelector('#popup-user-inputs-section')
})
