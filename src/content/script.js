import { unblockViewPort, processViewPortBlock } from './viewport/viewport-ops.js'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == 'BGW_ON_ACCESS_ALLOWED') {
    sendResponse({ success: true })
    unblockViewPort()
  }
})

const defaultWebsitesToBlock = [
  'www.facebook.com',
  'www.instagram.com',
  'www.reddit.com',
  'www.youtube.com',
]
const WEBSITES_KEY = 'THADAI_BLOCKED_WEBSITES'

function isWebsiteBlocked(hostname, websites) {
  return Array.isArray(websites) && websites.includes(hostname)
}

// Check storage for blocked websites and block if needed
;(async function () {
  let websites = defaultWebsitesToBlock
  try {
    const result = await chrome.storage.local.get([WEBSITES_KEY])
    if (Array.isArray(result[WEBSITES_KEY])) {
      websites = result[WEBSITES_KEY]
    }
  } catch (e) {
    // fallback to default
  }
  if (isWebsiteBlocked(window.location.hostname, websites)) {
    processViewPortBlock()
  }
})()
