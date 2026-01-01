function isValidPrivateKey(key) {
    // Must be a 0x-prefixed 64 hex chars (32 bytes)
    return typeof key === 'string' && /^0x[0-9a-fA-F]{64}$/.test(key);
}
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
    } else if (request.type === 'OPEN_POPUP_FROM_SETTINGS') {
        chrome.action.openPopup();
        sendResponse({ success: true });
    }
})

function notifyAcccessAllowed() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'BGW_ON_ACCESS_ALLOWED' });
    });
}

function getPrivateKeyFromStorage() {
  return chrome.storage.local.get("THADAI_USER_PRIVATE_KEY").then((result) => {
    return result.THADAI_USER_PRIVATE_KEY;
  });
}


async function getUserAddress() {
    const USER_PRIVATE_KEY = await getPrivateKeyFromStorage();
    if (!USER_PRIVATE_KEY) throw new Error("No private key set");
    if (!isValidPrivateKey(USER_PRIVATE_KEY)) throw new Error("Invalid private key format");
    return ethers.computeAddress(USER_PRIVATE_KEY);
}

/**
 * Check if the user has access by querying the ThadaiCoreV1 smart contract
 * @returns {Promise<boolean>} True if user has active access, false otherwise
 */
async function isAccessAllowed() {
    try {
        const provider = new ethers.JsonRpcProvider(CHAIN_RPC_URL);        
        const contract = getThadaiContract(provider);
        let userAddress;
        try {
            userAddress = await getUserAddress();
        } catch (error) {
            console.log('[BGW] Error getting user address in isAccessAllowed():', error);
            return false;
        }
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