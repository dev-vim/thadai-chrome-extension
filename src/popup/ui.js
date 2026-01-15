import { formatAccessTime, formatEthAmount, calculateAccessTime } from './utils.js'
import { MIN_ETH_DISPLAY } from './constants.js'

/**
 * Update the usage hint display with time and ETH amount
 * @param {HTMLElement} usageHintElement - The element to update
 * @param {number} ethAmount - Amount in ETH
 */
export function updateUsageHint(ethAmount) {
  try {
    const usageHintElement = document.getElementById('popup-usage-hint')
    const ethDisplay = formatEthAmount(ethAmount)
    if (ethAmount < MIN_ETH_DISPLAY) {
      usageHintElement.textContent = ethDisplay
      return
    }
    const accessSeconds = calculateAccessTime(ethAmount)
    const timeText = formatAccessTime(accessSeconds)
    usageHintElement.textContent = `${timeText} (${ethDisplay})`
  } catch (error) {
    console.error('[PU] Error updating usage hint:', error)
    usageHintElement.textContent = ''
  }
}

/**
 * Show the popup spinner overlay and hide user input section
 */
export function showPopupSpinner() {
  const inputSection = document.getElementById('popup-user-inputs-section')
  const spinnerOverlay = document.getElementById('popup-spinner-overlay')
  if (inputSection) {
    inputSection.style.display = 'none'
  }
  if (spinnerOverlay) {
    spinnerOverlay.style.display = 'flex'
  }
}

/**
 * Hide the popup spinner overlay and show user input section
 */
export function hidePopupSpinner() {
  const inputSection = document.getElementById('popup-user-inputs-section')
  const spinnerOverlay = document.getElementById('popup-spinner-overlay')
  if (spinnerOverlay) {
    spinnerOverlay.style.display = 'none'
  }
  if (inputSection) {
    inputSection.style.display = 'block'
  }
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
  hidePopupSpinner()
  const inputSection = document.getElementById('popup-user-inputs-section')
  // TODO: Rename this to something more appropriate (elsewhere too)
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
