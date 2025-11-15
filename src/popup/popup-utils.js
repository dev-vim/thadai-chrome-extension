import { BASE_ACCESS_PRICE_WEI, MIN_ETH_DISPLAY } from './popup-constants.js';

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
  const weiAmount = ethers.parseEther(ethAmount.toString());
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

/**
 * Update the usage hint display with time and ETH amount
 * @param {HTMLElement} usageHintElement - The element to update
 * @param {number} ethAmount - Amount in ETH
 */
export function updateUsageHint(usageHintElement, ethAmount) {
  try {
    // Format ETH amount
    const ethDisplay = formatEthAmount(ethAmount);
    
    // If amount is below minimum display threshold, show only ETH
    if (ethAmount < MIN_ETH_DISPLAY) {
      usageHintElement.textContent = ethDisplay;
      return;
    }
    
    // Calculate and format access time
    const accessSeconds = calculateAccessTime(ethAmount);
    const timeText = formatAccessTime(accessSeconds);
    
    usageHintElement.textContent = `${timeText} (${ethDisplay})`;
  } catch (error) {
    console.error("[PU] Error updating usage hint:", error);
    usageHintElement.textContent = "";
  }
}

