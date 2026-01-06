import { parseEther } from 'ethers';
import { BASE_ACCESS_PRICE_WEI, MIN_ETH_DISPLAY } from './constants.js';

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
    const hours = Math.floor(accessMinutes / 60);
    const minutes = Math.round(accessMinutes % 60);
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
  const weiAmount = parseEther(ethAmount.toString());
  const weiAmountNum = Number(weiAmount);
  const basePriceNum = Number(BASE_ACCESS_PRICE_WEI);
  return weiAmountNum / basePriceNum;
}

/**
 * Format ETH amount for display
 * @param {number} ethAmount - Amount in ETH
 * @returns {string} Formatted ETH string
 */
export function formatEthAmount(ethAmount) {
  if (ethAmount < MIN_ETH_DISPLAY) {
    return "~0.0001 ETH";
  }
  const ethRounded = parseFloat(ethAmount.toFixed(4));
  return `${ethRounded.toFixed(4)} ETH`;
}

// User-friendly contract error formatter
export function formatContractError(error) {
  if (!error) return "Unknown error";
  // ethers.js invalid private key
  if (error.code === 'INVALID_ARGUMENT' && error.argument === 'privateKey') {
    return "Your private key is invalid. Please check and re-enter it in settings.";
  }
  // ethers.js insufficient funds
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return "Insufficient funds in your wallet to complete this transaction.";
  }
  // ethers.js revert
  if (error.code === 'CALL_EXCEPTION' && error.reason) {
    return `Smart contract error: ${error.reason}`;
  }
  // Fallback: show message or stringified error
  if (error.message) {
    return error.message;
  }
  return String(error);
}
