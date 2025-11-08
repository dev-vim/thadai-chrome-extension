document.addEventListener("DOMContentLoaded", async function () {
    await updatePopupContext();
    
    document
      .getElementById("popup-user-deposit-intent-button")
      .addEventListener("click", processUserDepositIntent);
  });
  
  async function updatePopupContext() {
    try {
      const popupLogic = await chrome.storage.local.get(
        "popupOpenedProgrammatically"
      );
  
      const inputSection = document.getElementById("popup-user-inputs-section");
      const button = document.getElementById("popup-user-deposit-intent-button");
      // Show the input and button
      inputSection.classList.add("visible");
  
      if (popupLogic.popupOpenedProgrammatically) {
        // Popup was opened programmatically (via chrome.action.openPopup())
        // This is indirectly due to the user action on the blocked viewport
        // Which implies the user intends to purchase access
        button.textContent = "Purchase access";
      } else {
        // Popup was opened by user clicking the extension icon
        // Which implies the user possibly intends to topup access
        button.textContent = "Topup access";
      }
    } catch (error) {
      console.error("[PU] Error updateButtonText() :", error);
    }
  }
  
  async function processUserDepositIntent() {
    try {
      const popupLogic = await chrome.storage.local.get(
        "popupOpenedProgrammatically"
      );
  
      if (popupLogic.popupOpenedProgrammatically) {
        // Popup was opened programmatically (via chrome.action.openPopup())
        // This is indirectly due to the user action on the blocked viewport
        // Which implies the user intends to purchase access
        userPurchaseAccess()
        // Clear the flag after checking
        chrome.storage.local.remove("popupOpenedProgrammatically");
      } else {
        // Popup was opened by user clicking the extension icon
        // Which implies the user possibly intends to topup access
        userTopUp()
      }
    } catch (error) {
      console.error("[PU] Error processUserDepositIntent() :", error);
    }
  }
  
  async function userPurchaseAccess() {
    const amount = document.getElementById("popup-user-input-amount").value;
    if (!amount) {
      return alert("Enter amount in ETH");
    }
  
    const provider = new ethers.JsonRpcProvider(CHAIN_RPC_URL);
    const wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider);
    const contract = getThadaiContract(wallet);
  
    try {
      const wei = ethers.parseEther(amount);
      const tx = await contract.purchaseAccess({ value: wei });
      const receipt = await tx.wait();
      console.log("[PU] purchaseAccess receipt", receipt);
      notifyOnPurchaseAccessSuccess();
    } catch (error) {
      console.error(error);
      alert("Transaction failed: " + (error?.shortMessage || error?.message));
    }
  }
  
  function notifyOnPurchaseAccessSuccess() {
    const request = { type: "PU_ON_PURCHASE_ACCESS_SUCCESS" };
    chrome.runtime.sendMessage(request, (response) => {
      if (response && !response.success) {
        console.log(
          "[PU] Internal error: Purchase access succeeded notification not processed as expected"
        );
      }
    });
  }
  
  async function userTopUp() {
    const amount = document.getElementById("popup-user-input-amount").value;
    if (!amount) {
      return alert("Enter amount in ETH");
    }
  
    const provider = new ethers.JsonRpcProvider(CHAIN_RPC_URL);
    const wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider);
    const contract = getThadaiContract(wallet);
  
    try {
      const wei = ethers.parseEther(amount);
      const tx = await contract.purchaseAccess({ value: wei });
      const receipt = await tx.wait();
      console.log("[PU] purchaseAccess receipt", receipt);
      notifyOnTopUpSuccess();
    } catch (error) {
      console.error(error);
      alert("Transaction failed: " + (error?.shortMessage || error?.message));
    }
  }
  
  function notifyOnTopUpSuccess() {
    const request = { type: "PU_ON_TOPUP_SUCCESS" };
    chrome.runtime.sendMessage(request, (response) => {
      if (response && !response.success) {
        console.log(
          "[PU] Internal error: Topup succeeded notification not processed as expected"
        );
      }
    });
  }
  