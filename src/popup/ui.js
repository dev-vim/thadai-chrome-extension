import { formatAccessTime, formatEthAmount, calculateAccessTime } from './utils.js'
import { MIN_ETH_DISPLAY } from './constants.js'

/**
 * Update the usage hint text below the slider to reflect the current ETH amount and access time.
 * @param {number} ethAmount - ETH amount selected on the slider
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
 * Set the min/max bounds of the ETH amount slider and reset its value to the minimum.
 * @param {number} minEthAmount - Minimum ETH amount (inclusive)
 * @param {number} maxEthAmount - Maximum ETH amount (inclusive)
 */
export function updateAmountSliderRange(minEthAmount, maxEthAmount) {
  const slider = document.getElementById('popup-amount-slider')
  slider.min = minEthAmount.toString()
  slider.max = maxEthAmount.toString()
  slider.value = minEthAmount.toString()
  const amountLimits = document.querySelectorAll('.amount-limits span')
  amountLimits[0].textContent = '$2'
  amountLimits[1].textContent = '$10'
  updateUsageHint(parseFloat(slider.value))
}

/** Show the main user input section (slider + buttons) in the popup. */
export function showInputSection() {
  const inputSection = document.getElementById('popup-user-inputs-section')
  if (inputSection) {
    inputSection.style.display = 'block'
  }
}

/** Hide the main user input section (slider + buttons) in the popup. */
export function hideInputSection() {
  const inputSection = document.getElementById('popup-user-inputs-section')
  if (inputSection) {
    inputSection.style.display = 'none'
  }
}

/** Show the loading spinner overlay while a transaction is in progress. */
export function showSpinner() {
  const spinnerOverlay = document.getElementById('popup-spinner-overlay')
  if (spinnerOverlay) {
    spinnerOverlay.style.display = 'flex'
  }
}

/** Hide the loading spinner overlay. */
export function hideSpinner() {
  const spinnerOverlay = document.getElementById('popup-spinner-overlay')
  if (spinnerOverlay) {
    spinnerOverlay.style.display = 'none'
  }
}

/**
 * Close the popup window after a short delay, typically shown after a successful transaction.
 * @param {number} delayMs - Delay in milliseconds before closing
 */
export function hidePopupAfterDelay(delayMs) {
  setTimeout(() => {
    window.close()
  }, delayMs)
}

/**
 * Set the label of the deposit intent button based on how the popup was opened.
 * Shows "Purchase access" if opened programmatically (triggered by a blocked site),
 * or "Topup access" if opened manually by the user.
 * @returns {Promise<void>}
 */
export async function setUserDepositIntentButtonText() {
  const button = document.getElementById('popup-user-deposit-intent-button')
  const popupLogic = await chrome.storage.local.get('POPUP_OPENED_PROGRAMATICALLY')
  if (popupLogic.POPUP_OPENED_PROGRAMATICALLY) {
    button.textContent = 'Purchase access'
  } else {
    button.textContent = 'Topup access'
  }
}

function displayBannerMessage(message) {
  const banner = document.getElementById('popup-banner-message')
  if (banner) {
    banner.textContent = message
    banner.classList.add('visible')
  }
}

/** Display a success banner after a transaction completes. */
export function displayTransactionSuccessMessage() {
  displayBannerMessage('Transaction successful! Enjoy winding down')
}

/** Display a banner prompting the user to complete their settings configuration. */
export function displaySetConfigurationMessage() {
  displayBannerMessage('Kindly set up your configuration in the settings to proceed')
}

/** Display a banner indicating a blockchain connection or configuration error. */
export function displayConnectionIssueMessage() {
  displayBannerMessage(
    'Unable to connect to the blockchain network - check connection or configuration',
  )
}
