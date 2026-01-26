import { parseEther } from 'ethers'
import { BASE_ACCESS_PRICE_WEI, MIN_ETH_DISPLAY } from './constants.js'
import { getThadaiContractAbi } from '../core/eth/thadai-contract.js'
import { ErrorDecoder } from 'ethers-decode-error'

/**
 * Format time duration in a human-readable format
 * @param {number} accessSeconds - Access time in seconds
 * @returns {string} Formatted time string (e.g., "24 min", "2 hr 15 min")
 */
export function formatAccessTime(accessSeconds) {
  const accessMinutes = accessSeconds / 60;

  if (accessMinutes < 1) {
    return `${Math.round(accessSeconds)} sec`;
  } else if (accessMinutes < 60) {
    return `${Math.round(accessMinutes)} min`;
  } else {
    let hours = Math.floor(accessMinutes / 60);
    let minutes = Math.round(accessMinutes % 60);
    // Handle rounding up to next hour if minutes == 60
    if (minutes === 60) {
      hours += 1;
      minutes = 0;
    }
    if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  }
}

/**
 * Calculate access time from ETH amount
 * @param {number} ethAmount - Amount in ETH
 * @returns {number} Access time in seconds
 */
export function calculateAccessTime(ethAmount) {
  const weiAmount = parseEther(ethAmount.toString())
  const weiAmountNum = Number(weiAmount)
  const basePriceNum = Number(BASE_ACCESS_PRICE_WEI)
  return weiAmountNum / basePriceNum
}

export function convertWeiToEth(weiAmount) {
  const ethAmount = parseFloat(weiAmount.toString()) / 1e18
  return ethAmount
}

/**
 * Format ETH amount for display
 * @param {number} ethAmount - Amount in ETH
 * @returns {string} Formatted ETH string
 */
export function formatEthAmount(ethAmount) {
  if (ethAmount < MIN_ETH_DISPLAY) {
    return '~0.0001 ETH'
  }
  const ethRounded = parseFloat(ethAmount.toFixed(4))
  return `${ethRounded.toFixed(4)} ETH`
}

export async function formatContractError(error) {
  if (error.message === 'Failed to fetch') {
    return 'Unable to connect to the blockchain network.'
  }
  const contractAbi = getThadaiContractAbi()
  const errorDecoder = ErrorDecoder.create([contractAbi])
  const { reason, type } = await errorDecoder.decode(error)
  
  if (reason === 'PaymentBelowMinimumAmount') {
    return 'The payment amount is below the minimum required.'
  } else if (reason === 'NoBalanceToWithdraw') {
    return 'There is no balance available to withdraw.'
  } else if (reason === 'WithdrawalCooldownActive') {
    return 'Withdrawal cooldown period is still active.'
  }
  return error
}
