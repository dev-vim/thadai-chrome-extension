import { isAccessAllowed } from './access-control'
import {
  CS_IS_ACCESS_ALLOWED,
  CS_REQUEST_TOPUP,
  PU_ON_PURCHASE_ACCESS_SUCCESS,
  PU_ON_TOPUP_SUCCESS,
  OPEN_PU_FROM_SETTINGS,
  BGW_ON_ACCESS_ALLOWED,
} from '../common/message-types.js'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === CS_IS_ACCESS_ALLOWED) {
    isAccessAllowed()
      .then((allowed) => {
        sendResponse({ accessAllowed: allowed })
      })
      .catch((error) => {
        console.error('[BGW] Error checking access:', error)
        sendResponse({ accessAllowed: false })
      })
    // Return true to indicate we will send a response asynchronously
    return true
  } else if (request.type == CS_REQUEST_TOPUP) {
    chrome.storage.local.set({ POPUP_OPENED_PROGRAMATICALLY: true })
    chrome.action.openPopup()
  } else if (request.type === PU_ON_PURCHASE_ACCESS_SUCCESS) {
    notifyAcccessAllowed()
    sendResponse({ success: true }) // unblock connection
  } else if (request.type === PU_ON_TOPUP_SUCCESS) {
    sendResponse({ success: true }) // unblock connection
  } else if (request.type === OPEN_PU_FROM_SETTINGS) {
    chrome.action.openPopup()
    sendResponse({ success: true })
  }
})

function notifyAcccessAllowed() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: BGW_ON_ACCESS_ALLOWED })
  })
}
