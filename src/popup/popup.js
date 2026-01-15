import {
  updateUsageHint,
  showPopupSpinner,
  hidePopupSpinner,
  showTransactionSuccess,
  showSetThadaiConfigMessage,
} from './ui.js'
import { purchaseAccess, withdrawFunds, getAccessInfo } from '../core/eth/thadai-contract.js'
import {
  getPrivateKeyFromStorage,
  getChainRpcUrlFromStorage,
  getUserAddress,
} from '../common/session-user-data.js'
import { formatContractError } from './utils.js'

document.addEventListener('DOMContentLoaded', async function () {
  await updatePopupContext()
  const chainRpcUrl = await getChainRpcUrlFromStorage()
  const userAddress = await getUserAddress()
  const [accessUntil, balance, totalPaid, lastRedemptionTime, canWithdraw, cooldownRemaining] =
    await getAccessInfo(chainRpcUrl, userAddress)
  console.log('[PU] getAccessInfo: ', {
    accessUntil: accessUntil.toString(),
    balance: balance.toString(),
    totalPaid: totalPaid.toString(),
    lastRedemptionTime: lastRedemptionTime.toString(),
    canWithdraw,
    cooldownRemaining: cooldownRemaining.toString(),
  })
  if (!canWithdraw) {
    const withdrawButton = document.getElementById('popup-user-withdraw-intent-button')
    withdrawButton.style.display = 'none'
  }
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

document.getElementById('popup-amount-slider').addEventListener('input', function () {
  const slider = document.getElementById('popup-amount-slider')
  const value = parseFloat(slider.value)
  updateUsageHint(value)
})

document
  .getElementById('popup-user-deposit-intent-button')
  .addEventListener('click', processUserDepositIntent)

document
  .getElementById('popup-user-withdraw-intent-button')
  .addEventListener('click', processUserWithdrawIntent)

async function updatePopupContext() {
  try {
    const userSettingsLogic = await chrome.storage.local.get('THADAI_USER_SETTINGS_SET')
    if (!userSettingsLogic.THADAI_USER_SETTINGS_SET) {
      showSetThadaiConfigMessage()
    } else {
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
      // TODO: collect the return value of the op, if success then hide popup after a delay
      chrome.storage.local.remove('POPUP_OPENED_PROGRAMATICALLY')
    } else {
      await userTopUp()
      // TODO: collect the return value of the op, if success then hide popup after a delay
    }
  } catch (error) {
    console.error('[PU] Error processUserDepositIntent() :', error)
  }
}

async function processUserWithdrawIntent() {
  const chainRpcUrl = await getChainRpcUrlFromStorage()
  const userAddress = await getUserAddress()
  const [, , , , canWithdraw] = await getAccessInfo(chainRpcUrl, userAddress)
  if (!canWithdraw) {
    alert('Withdrawal not allowed at this time. Please check your balance and cooldown period.')
    return
  }
  showPopupSpinner()
  try {
    const userPrivateKey = await getPrivateKeyFromStorage()
    const receipt = await withdrawFunds(chainRpcUrl, userPrivateKey)
    console.log('[PU] withdrawFunds receipt', receipt)
    alert('Withdrawal successful!')
    showTransactionSuccess()
  } catch (error) {
    hidePopupSpinner()
    const formattedError = await formatContractError(error)
    alert('Withdrawal failed: ' + formattedError)
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

async function userTopUp() {
  const button = document.getElementById('popup-user-deposit-intent-button')
  showPopupSpinner()
  try {
    const amount = getSliderAmount()
    const userPrivateKey = await getPrivateKeyFromStorage()
    const chainRpcUrl = await getChainRpcUrlFromStorage()
    const receipt = await purchaseAccess(amount, chainRpcUrl, userPrivateKey)
    console.log('[PU] topUp receipt', receipt)
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
  }
}

function notifyOnTopUpSuccess() {
  const request = { type: 'PU_ON_TOPUP_SUCCESS' }
  chrome.runtime.sendMessage(request, (response) => {
    if (response && !response.success) {
      console.log('[PU] Internal error: Topup succeeded notification not processed as expected')
    }
  })
}
