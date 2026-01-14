import {
  updateUsageHint,
  showPopupSpinner,
  hidePopupSpinner,
  hidePopUpAfterDelay,
  showTransactionSuccess,
  showSetThadaiConfigMessage,
} from './ui.js'
import { purchaseAccess, getAccessInfo } from '../core/eth/thadai-contract.js'
import {
  getPrivateKeyFromStorage,
  getChainRpcUrlFromStorage,
  getUserAddress,
} from '../common/session-user-data.js'
import { formatContractError } from './utils.js'

document.addEventListener('DOMContentLoaded', async function () {
  await updatePopupContext()
  const slider = document.getElementById('popup-amount-slider')
  const usageHint = document.getElementById('popup-usage-hint')
  slider.addEventListener('input', function () {
    const value = parseFloat(slider.value)
    updateUsageHint(usageHint, value)
  })
  const initialValue = parseFloat(slider.value)
  updateUsageHint(usageHint, initialValue)
  document
    .getElementById('popup-user-deposit-intent-button')
    .addEventListener('click', processUserDepositIntent)
  const settingsBtn = document.getElementById('settings-btn')
  settingsBtn.addEventListener('click', function () {
    const settingsUrl = chrome.runtime.getURL('src/popup/settings.html')
    window.open(
      settingsUrl,
      '_blank',
      'width=320,height=500,left=100,top=100,menubar=no,toolbar=no,location=no,status=no',
    )
  })
})

async function updatePopupContext() {
  try {
    const userSettingsLogic = await chrome.storage.local.get('THADAI_USER_SETTINGS_SET')
    if (!userSettingsLogic.THADAI_USER_SETTINGS_SET) {
      showSetThadaiConfigMessage()
    } else {
      const chainRpcUrl = await getChainRpcUrlFromStorage()
      const userAddress = await getUserAddress()
      const [accessUntil, balance, totalPaid, lastRedemptionTime, canWithdraw, cooldownRemaining] =
        await getAccessInfo(chainRpcUrl, userAddress)
      console.log('[BGW] getAccessInfo result: ', {
        accessUntil: accessUntil.toString(),
        balance: balance.toString(),
        totalPaid: totalPaid.toString(),
        lastRedemptionTime: lastRedemptionTime.toString(),
        canWithdraw,
        cooldownRemaining: cooldownRemaining.toString(),
      })

      const inputSection = document.getElementById('popup-user-inputs-section')
      const button = document.getElementById('popup-user-deposit-intent-button')
      inputSection.classList.add('visible')
      const popupLogic = await chrome.storage.local.get('POPUP_OPENED_PROGRAMATICALLY')
      if (popupLogic.POPUP_OPENED_PROGRAMATICALLY) {
        button.textContent = 'Purchase access'
      } else {
        button.textContent = 'Topup access'
      }
    }
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      const successMessage = document.getElementById('popup-success-message')
      if (successMessage) {
        successMessage.classList.add('visible')
        successMessage.textContent =
          'Unable to connect to the blockchain network - check connection or configuration'
      }
      return
    }
    console.error('[PU] Error updateButtonText() :', error)
  }
}

async function processUserDepositIntent() {
  try {
    const popupLogic = await chrome.storage.local.get('POPUP_OPENED_PROGRAMATICALLY')
    if (popupLogic.POPUP_OPENED_PROGRAMATICALLY) {
      await userPurchaseAccess()
      chrome.storage.local.remove('POPUP_OPENED_PROGRAMATICALLY')
    } else {
      await userTopUp()
    }
  } catch (error) {
    console.error('[PU] Error processUserDepositIntent() :', error)
  }
}

function getSliderAmount() {
  const slider = document.getElementById('popup-amount-slider')
  const amount = parseFloat(slider.value)
  if (!amount || isNaN(amount)) {
    throw new Error('Invalid amount')
  }
  return amount
}

async function userPurchaseAccess() {
  const button = document.getElementById('popup-user-deposit-intent-button')
  showPopupSpinner()
  try {
    const amount = getSliderAmount()
    const userPrivateKey = await getPrivateKeyFromStorage()
    const chainRpcUrl = await getChainRpcUrlFromStorage()
    const receipt = await purchaseAccess(amount, chainRpcUrl, userPrivateKey)
    console.log('[PU] purchaseAccess receipt', receipt)
    notifyOnPurchaseAccessSuccess()
    showTransactionSuccess()
  } catch (error) {
    hidePopupSpinner()
    if (error.message === 'Invalid amount') {
      alert('Invalid amount')
    } else {
      const formattedError = await formatContractError(error)
      alert('Purchase access failed: ' + formattedError)
    }
    hidePopUpAfterDelay(100)
  }
}

async function userTopUp() {
  const button = document.getElementById('popup-user-deposit-intent-button')
  showPopupSpinner()
  try {
    const amount = getSliderAmount()
    const userPrivateKey = await getPrivateKeyFromStorage()
    const chainRpcUrl = await getChainRpcUrlFromStorage()
    const receipt = await purchaseAccess(amount, chainRpcUrl, userPrivateKey)
    console.log('[PU] purchaseAccess receipt', receipt)
    notifyOnTopUpSuccess()
    showTransactionSuccess()
  } catch (error) {
    hidePopupSpinner()
    if (error.message === 'Invalid amount') {
      alert('Invalid amount')
    } else {
      const formattedError = await formatContractError(error)
      alert('User top up failed: ' + formattedError)
    }
    hidePopUpAfterDelay(100)
  }
}

function notifyOnPurchaseAccessSuccess() {
  const request = { type: 'PU_ON_PURCHASE_ACCESS_SUCCESS' }
  chrome.runtime.sendMessage(request, (response) => {
    if (response && !response.success) {
      console.log(
        '[PU] Internal error: Purchase access succeeded notification not processed as expected',
      )
    }
  })
}

function notifyOnTopUpSuccess() {
  const request = { type: 'PU_ON_TOPUP_SUCCESS' }
  chrome.runtime.sendMessage(request, (response) => {
    if (response && !response.success) {
      console.log('[PU] Internal error: Topup succeeded notification not processed as expected')
    }
  })
}
