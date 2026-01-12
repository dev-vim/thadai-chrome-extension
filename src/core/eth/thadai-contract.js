import { THADAI_ABI, THADAI_ADDRESS } from './thadai-metadata.js'
import { Contract, JsonRpcProvider, Wallet, parseEther } from 'ethers'

export function getThadaiContractAddress() {
  return THADAI_ADDRESS
}

export function getThadaiContractAbi() {
  return THADAI_ABI
}

export function getThadaiContractProvider(chainRpcUrl) {
  return new JsonRpcProvider(chainRpcUrl)
}

export function getThadaiContract(signerOrProvider) {
  return new Contract(THADAI_ADDRESS, THADAI_ABI, signerOrProvider)
}

export async function purchaseAccess(amount, chainRpcUrl, userPrivateKey) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const wallet = new Wallet(userPrivateKey, provider)
  const contract = getThadaiContract(wallet)
  const wei = parseEther(amount.toString())
  const tx = await contract.purchaseAccess({ value: wei })
  const receipt = await tx.wait()
  return receipt
}

export async function checkAccess(chainRpcUrl, userAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const contract = getThadaiContract(provider)
  const [hasAccess, remainingSeconds] = await contract.checkAccess(userAddress)
  return [hasAccess, remainingSeconds]
}

export async function getAccessInfo(chainRpcUrl, userAddress) {
  const provider = getThadaiContractProvider(chainRpcUrl)
  const contract = getThadaiContract(provider)
  const [accessUntil, balance, totalPaid, lastRedemptionTime, canWithdraw, cooldownRemaining] =
    await contract.getUserAccessInfo(userAddress)
  return [accessUntil, balance, totalPaid, lastRedemptionTime, canWithdraw, cooldownRemaining]
}
