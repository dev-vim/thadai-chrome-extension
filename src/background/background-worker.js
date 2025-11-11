// Import ethers.js and contract metadata
importScripts('../core-eth/ethers.js');
importScripts('../core-eth/eth-contract-metadata.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CS_IS_ACCESS_ALLOWED') {
        isAccessAllowed().then(allowed => {
            sendResponse({ accessAllowed: allowed });
        }).catch(error => {
            console.error('[BGW] Error checking access:', error);
            sendResponse({ accessAllowed: false });
        });
        // Return true to indicate we will send a response asynchronously
        return true;
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

/**
 * Check if the user has access by querying the ThadaiCoreV1 smart contract
 * @returns {Promise<boolean>} True if user has active access, false otherwise
 */
async function isAccessAllowed() {
    try {
        const provider = new ethers.JsonRpcProvider(CHAIN_RPC_URL);        
        const contract = getThadaiContract(provider);
        const userAddress = ethers.getAddress(USER_ADDRESS);
        const [hasAccess, remainingSeconds] = await contract.checkAccess(userAddress);
        console.log('[BGW] Access check result:', {
            hasAccess,
            remainingSeconds: remainingSeconds.toString(),
            userAddress: userAddress,
            contractAddress: THADAI_ADDRESS
        });
        return hasAccess;
    } catch (error) {
        console.error('[BGW] Error in isAccessAllowed():', error);
        // Return false on error to be safe (block access if we can't verify)
        return false;
    }
}