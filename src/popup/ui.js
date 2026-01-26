import { formatAccessTime, formatEthAmount, calculateAccessTime } from './utils.js'
import { MIN_ETH_DISPLAY } from './constants.js'

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

export function updateAmountSliderRange(minEthAmount, maxEthAmount) {
  console.log(
    '[PU] Updating amount slider range:',
    formatEthAmount(minEthAmount),
    formatEthAmount(maxEthAmount),
  )
  const slider = document.getElementById('popup-amount-slider')
  slider.min = minEthAmount.toString()
  slider.max = maxEthAmount.toString()
  slider.value = minEthAmount.toString()
  const amountLimits = document.querySelectorAll('.amount-limits span')
  amountLimits[0].textContent = '$2'
  amountLimits[1].textContent = '$10'
  updateUsageHint(parseFloat(slider.value))
}

export function showInputSection() {
  const inputSection = document.getElementById('popup-user-inputs-section')
  if (inputSection) {
    inputSection.style.display = 'block'
  }
}

export function hideInputSection() {
  const inputSection = document.getElementById('popup-user-inputs-section')
  if (inputSection) {
    inputSection.style.display = 'none'
  }
}

export function showSpinner() {
  const spinnerOverlay = document.getElementById('popup-spinner-overlay')
  if (spinnerOverlay) {
    spinnerOverlay.style.display = 'flex'
  }
}

export function hideSpinner() {
  const spinnerOverlay = document.getElementById('popup-spinner-overlay')
  if (spinnerOverlay) {
    spinnerOverlay.style.display = 'none'
  }
}

export function hidePopupAfterDelay(delayMs) {
  setTimeout(() => {
    window.close()
  }, delayMs)
}

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

export function displayTransactionSuccessMessage() {
  displayBannerMessage('Transaction successful! Enjoy winding down')
}

export function displaySetConfigurationMessage() {
  displayBannerMessage('Kindly set up your configuration in the settings to proceed')
}

export function displayConnectionIssueMessage() {
  displayBannerMessage(
    'Unable to connect to the blockchain network - check connection or configuration',
  )
}
