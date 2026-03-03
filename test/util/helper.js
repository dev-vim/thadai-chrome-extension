// Helper to set Thadai config in chrome.storage.local
export async function setThadaiConfig(page, overrides = {}) {
  const defaultConfig = {
    THADAI_USER_PRIVATE_KEY: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    THADAI_CHAIN_NAME: 'anvil',
    THADAI_CHAIN_ID: '31337',
    THADAI_CHAIN_RPC_URL: 'http://localhost:7777',
    THADAI_CONTRACT_ADDRESS: '0xAD523115cd35a8d4E60B3C0953E0E0ac10418309',
  };
  const config = { ...defaultConfig, ...overrides };
  await page.evaluate((cfg) => {
    chrome.storage.local.set(cfg);
  }, config);
}