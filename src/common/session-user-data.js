import { ethers } from 'ethers'

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

export function getPrivateKeyFromStorage() {
  return chrome.storage.local.get('THADAI_USER_PRIVATE_KEY').then((result) => {
    return result.THADAI_USER_PRIVATE_KEY
  })
}

export function getChainRpcUrlFromStorage() {
  return chrome.storage.local.get('THADAI_CHAIN_RPC_URL').then((result) => {
    return result.THADAI_CHAIN_RPC_URL
  })
}

export function getThadaiContractAddressFromStorage() {
  return chrome.storage.local.get('THADAI_CONTRACT_ADDRESS').then((result) => {
    return result.THADAI_CONTRACT_ADDRESS
  })
}

function isValidPrivateKey(key) {
  // Must be a 0x-prefixed 64 hex chars (32 bytes)
  return typeof key === 'string' && /^0x[0-9a-fA-F]{64}$/.test(key)
}

export async function getUserAddress() {
  const userPrivateKey = await getPrivateKeyFromStorage()
  if (!userPrivateKey) throw new Error('No private key set')
  if (!isValidPrivateKey(userPrivateKey)) throw new Error('Invalid private key format')
  return ethers.computeAddress(userPrivateKey)
}
