import { formatAccessTime, formatEthAmount, calculateAccessTime } from './utils.js'
import { MIN_ETH_DISPLAY } from './constants.js'

/**
 * Update the usage hint display with time and ETH amount
 * @param {HTMLElement} usageHintElement - The element to update
 * @param {number} ethAmount - Amount in ETH
 */
export function updateUsageHint(usageHintElement, ethAmount) {
  try {
    // Format ETH amount
    const ethDisplay = formatEthAmount(ethAmount)

    // If amount is below minimum display threshold, show only ETH
    if (ethAmount < MIN_ETH_DISPLAY) {
      usageHintElement.textContent = ethDisplay
      return
    }

    // Calculate and format access time
    const accessSeconds = calculateAccessTime(ethAmount)
    const timeText = formatAccessTime(accessSeconds)

    usageHintElement.textContent = `${timeText} (${ethDisplay})`
  } catch (error) {
    console.error('[PU] Error updating usage hint:', error)
    usageHintElement.textContent = ''
  }
}

/**
 * Show loading spinner by replacing button content
 * @param {HTMLElement} buttonElement - The button element to replace
 * @returns {string} The original button text content
 */
export function showLoadingSpinner(buttonElement) {
  const originalText = buttonElement.textContent
  buttonElement.disabled = true
  buttonElement.classList.add('loading')
  buttonElement.innerHTML = '<div class="loader"></div>'
  return originalText
}

/**
 * Hide loading spinner and restore button
 * @param {HTMLElement} buttonElement - The button element to restore
 * @param {string} originalText - The original button text content
 */
export function hideLoadingSpinner(buttonElement, originalText) {
  buttonElement.disabled = false
  buttonElement.classList.remove('loading')
  buttonElement.textContent = originalText
}

export function hidePopUpAfterDelay(delayMs) {
  setTimeout(() => {
    window.close()
  }, delayMs)
}

/**
 * Hide payment-related elements and show success message
 */
export function showTransactionSuccess() {
  const inputSection = document.getElementById('popup-user-inputs-section')
  const successMessage = document.getElementById('popup-success-message')

  if (inputSection) {
    inputSection.classList.remove('visible')
    inputSection.style.display = 'none'
  }

  if (successMessage) {
    successMessage.classList.add('visible')
  }

  // Automatically close the popup after 1 second
  hidePopUpAfterDelay(1000)
}

export function showSetThadaiConfigMessage() {
  const inputSection = document.getElementById('popup-user-inputs-section')
  const successMessage = document.getElementById('popup-success-message')

  if (inputSection) {
    inputSection.classList.remove('visible')
    inputSection.style.display = 'none'
  }

  if (successMessage) {
    successMessage.classList.add('visible')
    successMessage.textContent = 'Kindly set up your configuration in the settings to proceed'
  }
}
