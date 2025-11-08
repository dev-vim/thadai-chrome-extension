chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CS_IS_ACCESS_ALLOWED') {
        const allowed = isAccessAllowed()
        sendResponse({ accessAllowed: allowed })
    } else if (request.type == 'CS_REQUEST_TOPUP') {
        chrome.storage.local.set({ popupOpenedProgrammatically: true });
        chrome.action.openPopup()
    } else if (request.type === 'PU_ON_PURCHASE_ACCESS_SUCCESS') {
        notifyAcccessAllowed()
        sendResponse({ success: true }) // unblock connection
    } else if (request.type === 'PU_ON_TOPUP_SUCCESS') {
        sendResponse({ success: true }) // unblock connection
    }
})

function notifyAcccessAllowed() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'BGW_ON_ACCESS_ALLOWED' });
    });
}

function isAccessAllowed() {
    // For demonstration, let's assume the pages are not allowed by default
    // In real implementation, check against stored settings from the smart contract for current user
    return false
}