import {
  updateUsageHint,
  showInputSection,
  hideInputSection,
  showSpinner,
  hideSpinner,
  hidePopupAfterDelay,
  setUserDepositIntentButtonText,
  displayTransactionSuccessMessage,
  displaySetConfigurationMessage,
  displayConnectionIssueMessage,
  updateAmountSliderRange,
} from './ui.js'
import {
  purchaseAccess,
  withdrawFunds,
  getAccessInfo,
  getAccessPricingInfo,
} from '../core/eth/thadai-contract.js'
import {
  isThadaiConfigurationSet,
  getPrivateKeyFromStorage,
  getChainRpcUrlFromStorage,
  getUserAddress,
  getThadaiContractAddressFromStorage,
} from '../common/session-user-data.js'
import { formatContractError, convertWeiToEth } from './utils.js'
import { PU_ON_PURCHASE_ACCESS_SUCCESS, PU_ON_TOPUP_SUCCESS } from '../common/message-types.js'

document.addEventListener('DOMContentLoaded', async function () {
  const isConfigurationSet = await isThadaiConfigurationSet()
  if (!isConfigurationSet) {
    hideInputSection()
    displaySetConfigurationMessage()
    return
  }
  try {
    const chainRpcUrl = await getChainRpcUrlFromStorage()
    const userAddress = await getUserAddress()
    const thadaiContractAddress = await getThadaiContractAddressFromStorage()
    const [
      balance,
      accessUntil,
      lastPurchaseTime,
      lastRedemptionTime,
      totalAccessSecondsPurchased,
      totalPaid,
      canWithdraw,
      cooldownRemaining,
      applicableInflationPercent,
    ] = await getAccessInfo(chainRpcUrl, userAddress, thadaiContractAddress)
    console.log('[PU] getAccessInfo: ', {
      balance: balance.toString(),
      accessUntil: accessUntil.toString(),
      lastPurchaseTime: lastPurchaseTime.toString(),
      lastRedemptionTime: lastRedemptionTime.toString(),
      totalAccessSecondsPurchased: totalAccessSecondsPurchased.toString(),
      totalPaid: totalPaid.toString(),
      canWithdraw: canWithdraw,
      cooldownRemaining: cooldownRemaining.toString(),
      applicableInflationPercent: applicableInflationPercent.toString(),
    })
    const [
      baseAccessPrice,
      minimumPaymentAmount,
      withdrawCooldownInDays,
      inflationWindowInHours,
      inflationPercent,
    ] = await getAccessPricingInfo(chainRpcUrl, thadaiContractAddress)
    console.log('[PU] getAccessPricingInfo: ', {
      baseAccessPrice: baseAccessPrice.toString(),
      minimumPaymentAmount: minimumPaymentAmount.toString(),
      withdrawCooldownInDays: withdrawCooldownInDays.toString(),
      inflationWindowInHours: inflationWindowInHours.toString(),
      inflationPercent: inflationPercent.toString(),
    })
    showInputSection()
    const minPaymentAmountEth = convertWeiToEth(minimumPaymentAmount)
    updateAmountSliderRange(minPaymentAmountEth, 5 * minPaymentAmountEth) // TOOD: What is a better way to set max?
    await setUserDepositIntentButtonText()
    if (!canWithdraw) {
      const withdrawButton = document.getElementById('popup-user-withdraw-intent-button')
      withdrawButton.style.display = 'none'
    }
  } catch (error) {
    hideInputSection()
    displayConnectionIssueMessage()
  }
})

document.getElementById('settings-btn').addEventListener('click', function () {
  const settingsUrl = chrome.runtime.getURL('src/popup/settings.html')
  window.open(
    settingsUrl,
    '_blank',
    'width=330,height=550,left=100,top=100,menubar=no,toolbar=no,location=no,status=no',
  )
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

async function processUserDepositIntent() {
  try {
    const popupLogic = await chrome.storage.local.get('POPUP_OPENED_PROGRAMATICALLY')
    if (popupLogic.POPUP_OPENED_PROGRAMATICALLY) {
      await userPurchaseAccess()
      chrome.storage.local.remove('POPUP_OPENED_PROGRAMATICALLY')
    } else {
      await userTopup()
    }
  } catch (error) {
    console.error('[PU] Error processUserDepositIntent() :', error)
  }
}

async function processUserWithdrawIntent() {
  const chainRpcUrl = await getChainRpcUrlFromStorage()
  const userAddress = await getUserAddress()
  const thadaiContractAddress = await getThadaiContractAddressFromStorage()
  const [, , , , , , canWithdraw, , ,] = await getAccessInfo(
    chainRpcUrl,
    userAddress,
    thadaiContractAddress,
  )
  if (!canWithdraw) {
    alert('Withdrawal not allowed at this time. Please check your balance and cooldown period.')
    return
  }
  hideInputSection()
  showSpinner()
  try {
    const userPrivateKey = await getPrivateKeyFromStorage()
    const thadaiContractAddress = await getThadaiContractAddressFromStorage()
    const receipt = await withdrawFunds(chainRpcUrl, userPrivateKey, thadaiContractAddress)
    console.log('[PU] withdrawFunds receipt', receipt)
    alert('Withdrawal successful!')
    hideSpinner()
    displayTransactionSuccessMessage()
    hidePopupAfterDelay(1000)
  } catch (error) {
    hideSpinner()
    showInputSection()
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
  hideInputSection()
  showSpinner()
  try {
    const amount = getSliderAmount()
    const userPrivateKey = await getPrivateKeyFromStorage()
    const chainRpcUrl = await getChainRpcUrlFromStorage()
    const thadaiContractAddress = await getThadaiContractAddressFromStorage()
    const receipt = await purchaseAccess(amount, chainRpcUrl, userPrivateKey, thadaiContractAddress)
    console.log('[PU] purchaseAccess receipt', receipt)
    notifyOnPurchaseAccessSuccess()
    hideSpinner()
    displayTransactionSuccessMessage()
    hidePopupAfterDelay(1000)
  } catch (error) {
    hideSpinner()
    showInputSection()
    if (error.message === 'Invalid amount') {
      alert('Invalid amount')
    } else {
      const formattedError = await formatContractError(error)
      alert('Purchase access failed: ' + formattedError)
    }
  }
}

function notifyOnPurchaseAccessSuccess() {
  const request = { type: PU_ON_PURCHASE_ACCESS_SUCCESS }
  chrome.runtime.sendMessage(request, (response) => {
    if (response && !response.success) {
      console.log(
        '[PU] Internal error: Purchase access succeeded notification not processed as expected',
      )
    }
  })
}

async function userTopup() {
  const button = document.getElementById('popup-user-deposit-intent-button')
  hideInputSection()
  showSpinner()
  try {
    const amount = getSliderAmount()
    const userPrivateKey = await getPrivateKeyFromStorage()
    const chainRpcUrl = await getChainRpcUrlFromStorage()
    const thadaiContractAddress = await getThadaiContractAddressFromStorage()
    const receipt = await purchaseAccess(amount, chainRpcUrl, userPrivateKey, thadaiContractAddress)
    console.log('[PU] topup receipt', receipt)
    notifyOnTopupSuccess()
    hideSpinner()
    displayTransactionSuccessMessage()
    hidePopupAfterDelay(1000)
  } catch (error) {
    hideSpinner()
    showInputSection()
    if (error.message === 'Invalid amount') {
      alert('Invalid amount')
    } else {
      const formattedError = await formatContractError(error)
      alert('User top up failed: ' + formattedError)
    }
  }
}

function notifyOnTopupSuccess() {
  const request = { type: PU_ON_TOPUP_SUCCESS }
  chrome.runtime.sendMessage(request, (response) => {
    if (response && !response.success) {
      console.log('[PU] Internal error: Topup succeeded notification not processed as expected')
    }
  })
}
