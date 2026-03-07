import { ethers } from 'ethers'

/**
 * Check whether the minimum required Thadai configuration (private key, RPC URL,
 * and contract address) has been saved to Chrome local storage.
 * @returns {Promise<boolean>}
 */
export function isThadaiConfigurationSet() {
  return Promise.all([
    chrome.storage.local.get('THADAI_USER_PRIVATE_KEY'),
    chrome.storage.local.get('THADAI_CHAIN_RPC_URL'),
    chrome.storage.local.get('THADAI_CONTRACT_ADDRESS'),
  ]).then(([privateKeyResult, rpcUrlResult, contractAddressResult]) => {
    const privateKey = privateKeyResult.THADAI_USER_PRIVATE_KEY
    const rpcUrl = rpcUrlResult.THADAI_CHAIN_RPC_URL
    const contractAddress = contractAddressResult.THADAI_CONTRACT_ADDRESS
    return Boolean(privateKey && rpcUrl && contractAddress)
  })
}

/**
 * Retrieve the user's private key from Chrome local storage.
 * @returns {Promise<string|undefined>}
 */
export function getPrivateKeyFromStorage() {
  return chrome.storage.local.get('THADAI_USER_PRIVATE_KEY').then((result) => {
    return result.THADAI_USER_PRIVATE_KEY
  })
}

/**
 * Retrieve the configured blockchain RPC URL from Chrome local storage.
 * @returns {Promise<string|undefined>}
 */
export function getChainRpcUrlFromStorage() {
  return chrome.storage.local.get('THADAI_CHAIN_RPC_URL').then((result) => {
    return result.THADAI_CHAIN_RPC_URL
  })
}

/**
 * Retrieve the ThadaiCoreV1 contract address from Chrome local storage.
 * @returns {Promise<string|undefined>}
 */
export function getThadaiContractAddressFromStorage() {
  return chrome.storage.local.get('THADAI_CONTRACT_ADDRESS').then((result) => {
    return result.THADAI_CONTRACT_ADDRESS
  })
}

function isValidPrivateKey(key) {
  // Must be a 0x-prefixed 64 hex chars (32 bytes)
  return typeof key === 'string' && /^0x[0-9a-fA-F]{64}$/.test(key)
}

/**
 * Derive the user's Ethereum address from the stored private key.
 * @returns {Promise<string>} Checksummed Ethereum address
 * @throws {Error} If the private key is missing or has an invalid format
 */
export async function getUserAddress() {
  const userPrivateKey = await getPrivateKeyFromStorage()
  if (!userPrivateKey) throw new Error('No private key set')
  if (!isValidPrivateKey(userPrivateKey)) throw new Error('Invalid private key format')
  return ethers.computeAddress(userPrivateKey)
}
