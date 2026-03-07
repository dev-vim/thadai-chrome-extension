import { THADAI_ABI } from './thadai-metadata.js'
import { Contract, JsonRpcProvider, Wallet, parseEther } from 'ethers'

/** @returns {object[]} The ABI array for ThadaiCoreV1 */
export function getThadaiContractAbi() {
  return THADAI_ABI
}

/**
 * Create a read-only JSON-RPC provider for the given chain.
 * @param {string} chainRpcUrl
 * @returns {JsonRpcProvider}
 */
export function getThadaiContractProvider(chainRpcUrl) {
  return new JsonRpcProvider(chainRpcUrl)
}

/**
 * Instantiate the ThadaiCoreV1 contract bound to a signer or provider.
 * @param {Wallet|JsonRpcProvider} signerOrProvider
 * @param {string} thadaiContractAddress
 * @returns {Contract}
 */
export function getThadaiContract(signerOrProvider, thadaiContractAddress) {
  return new Contract(thadaiContractAddress, THADAI_ABI, signerOrProvider)
}

/**
 * Send a purchaseAccess transaction to the contract.
 * @param {number|string} amount - ETH amount to send
 * @param {string} chainRpcUrl
 * @param {string} userPrivateKey
 * @param {string} thadaiContractAddress
 * @returns {Promise<TransactionReceipt>}
 */
export async function purchaseAccess(amount, chainRpcUrl, userPrivateKey, thadaiContractAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const wallet = new Wallet(userPrivateKey, provider)
  const contract = getThadaiContract(wallet, thadaiContractAddress)
  const wei = parseEther(amount.toString())
  const tx = await contract.purchaseAccess({ value: wei })
  const receipt = await tx.wait()
  return receipt
}

/**
 * Check whether a user address currently has active access.
 * @param {string} chainRpcUrl
 * @param {string} userAddress - Checksummed Ethereum address
 * @param {string} thadaiContractAddress
 * @returns {Promise<[boolean, bigint]>} [hasAccess, remainingSeconds]
 */
export async function checkAccess(chainRpcUrl, userAddress, thadaiContractAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const contract = getThadaiContract(provider, thadaiContractAddress)
  const [hasAccess, remainingSeconds] = await contract.checkAccess(userAddress)
  return [hasAccess, remainingSeconds]
}

/**
 * Withdraw available funds from the contract.
 * @param {string} chainRpcUrl
 * @param {string} userPrivateKey
 * @param {string} thadaiContractAddress
 * @returns {Promise<TransactionReceipt>}
 */
export async function withdrawFunds(chainRpcUrl, userPrivateKey, thadaiContractAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const wallet = new Wallet(userPrivateKey, provider)
  const contract = getThadaiContract(wallet, thadaiContractAddress)
  const tx = await contract.withdrawFunds()
  const receipt = await tx.wait()
  return receipt
}

/**
 * Fetch full access info for a user from the contract (calls `getUserAccessInfo`).
 * @param {string} chainRpcUrl
 * @param {string} userAddress
 * @param {string} thadaiContractAddress
 * @returns {Promise<[bigint, bigint, bigint, bigint, bigint, bigint, boolean, bigint, bigint]>}
 *   [balance, accessUntil, lastPurchaseTime, lastRedemptionTime,
 *    totalAccessSecondsPurchased, totalPaid, canWithdraw, cooldownRemaining, applicableInflationPercent]
 */
export async function getAccessInfo(chainRpcUrl, userAddress, thadaiContractAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const contract = getThadaiContract(provider, thadaiContractAddress)
  const [
    balance,
    accessUntil,
    lastPurchaseTime,
    lastRedemptionTime,
    totalAccessSecondsPurchased,
    totalPaid,
    canWithdraw,
    cooldownRemaining,
    applicableInflationPercent,
  ] = await contract.getUserAccessInfo(userAddress)
  return [
    balance,
    accessUntil,
    lastPurchaseTime,
    lastRedemptionTime,
    totalAccessSecondsPurchased,
    totalPaid,
    canWithdraw,
    cooldownRemaining,
    applicableInflationPercent,
  ]
}

/**
 * Fetch pricing configuration from the contract (calls `getAccessPricingInfo`).
 * @param {string} chainRpcUrl
 * @param {string} thadaiContractAddress
 * @returns {Promise<[bigint, bigint, bigint, bigint, bigint]>}
 *   [baseAccessPrice, minimumPaymentAmount, withdrawCooldownInDays, inflationWindowInHours, inflationPercent]
 */
export async function getAccessPricingInfo(chainRpcUrl, thadaiContractAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const contract = getThadaiContract(provider, thadaiContractAddress)
  const [basePrice, minimumPayment, withdrawCooldown, inflationWindow, inflationPercent] =
    await contract.getAccessPricingInfo()
  return [basePrice, minimumPayment, withdrawCooldown, inflationWindow, inflationPercent]
}
