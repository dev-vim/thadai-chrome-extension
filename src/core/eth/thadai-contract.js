import { THADAI_ABI } from './thadai-metadata.js'
import { Contract, JsonRpcProvider, Wallet, parseEther } from 'ethers'

export function getThadaiContractAbi() {
  return THADAI_ABI
}

export function getThadaiContractProvider(chainRpcUrl) {
  return new JsonRpcProvider(chainRpcUrl)
}

export function getThadaiContract(signerOrProvider, thadaiContractAddress) {
  return new Contract(thadaiContractAddress, THADAI_ABI, signerOrProvider)
}

export async function purchaseAccess(amount, chainRpcUrl, userPrivateKey, thadaiContractAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const wallet = new Wallet(userPrivateKey, provider)
  const contract = getThadaiContract(wallet, thadaiContractAddress)
  const wei = parseEther(amount.toString())
  const tx = await contract.purchaseAccess({ value: wei })
  const receipt = await tx.wait()
  return receipt
}

export async function checkAccess(chainRpcUrl, userAddress, thadaiContractAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const contract = getThadaiContract(provider, thadaiContractAddress)
  const [hasAccess, remainingSeconds] = await contract.checkAccess(userAddress)
  return [hasAccess, remainingSeconds]
}

export async function withdrawFunds(chainRpcUrl, userPrivateKey, thadaiContractAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const wallet = new Wallet(userPrivateKey, provider)
  const contract = getThadaiContract(wallet, thadaiContractAddress)
  const tx = await contract.withdrawFunds()
  const receipt = await tx.wait()
  return receipt
}

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

export async function getAccessPricingInfo(chainRpcUrl, thadaiContractAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const contract = getThadaiContract(provider, thadaiContractAddress)
  const [basePrice, minimumPayment, withdrawCooldown, inflationWindow, inflationPercent] =
    await contract.getAccessPricingInfo()
  return [basePrice, minimumPayment, withdrawCooldown, inflationWindow, inflationPercent]
}
