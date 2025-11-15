import { SLIDER_CONFIG } from './popup-constants.js';
import { updateUsageHint } from './popup-utils.js';

document.addEventListener("DOMContentLoaded", async function () {
    await updatePopupContext();
    
    // Setup slider
    const slider = document.getElementById("popup-amount-slider");
    const usageHint = document.getElementById("popup-usage-hint");
    
    // Update usage hint when slider changes
    slider.addEventListener("input", function() {
      const value = parseFloat(slider.value);
      updateUsageHint(usageHint, value);
    });
    
    // Initialize usage hint with slider value
    const initialValue = parseFloat(slider.value);
    updateUsageHint(usageHint, initialValue);
    
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
      inputSection.classList.add("visible");
  
      if (popupLogic.popupOpenedProgrammatically) {
        button.textContent = "Purchase access";
      } else {
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
        userPurchaseAccess()
        chrome.storage.local.remove("popupOpenedProgrammatically");
      } else {
        userTopUp()
      }
    } catch (error) {
      console.error("[PU] Error processUserDepositIntent() :", error);
    }
  }
  
  /**
   * Get the current amount from the slider
   * @returns {number} Amount in ETH
   */
  function getSliderAmount() {
    const slider = document.getElementById("popup-amount-slider");
    const amount = parseFloat(slider.value);
    if (!amount || isNaN(amount)) {
      throw new Error("Invalid amount");
    }
    return amount;
  }

  /**
   * Execute a purchase access transaction
   * @param {number} amount - Amount in ETH
   */
  async function executePurchaseAccess(amount) {
    const provider = new ethers.JsonRpcProvider(CHAIN_RPC_URL);
    const wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider);
    const contract = getThadaiContract(wallet);
    
    const wei = ethers.parseEther(amount.toString());
    const tx = await contract.purchaseAccess({ value: wei });
    const receipt = await tx.wait();
    console.log("[PU] purchaseAccess receipt", receipt);
    return receipt;
  }

  async function userPurchaseAccess() {
    try {
      const amount = getSliderAmount();
      await executePurchaseAccess(amount);
      notifyOnPurchaseAccessSuccess();
    } catch (error) {
      if (error.message === "Invalid amount") {
        alert("Invalid amount");
        return;
      }
      
      // Try to format contract error
      try {
        const provider = new ethers.JsonRpcProvider(CHAIN_RPC_URL);
        const wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider);
        const contract = getThadaiContract(wallet);
        const errorMessage = await formatContractError(error, contract);
        alert("Transaction failed: " + errorMessage);
      } catch (formatError) {
        alert("Transaction failed: " + error.message);
      }
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
    try {
      const amount = getSliderAmount();
      await executePurchaseAccess(amount);
      notifyOnTopUpSuccess();
    } catch (error) {
      if (error.message === "Invalid amount") {
        alert("Invalid amount");
        return;
      }
      
      // Try to format contract error
      try {
        const provider = new ethers.JsonRpcProvider(CHAIN_RPC_URL);
        const wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider);
        const contract = getThadaiContract(wallet);
        const errorMessage = await formatContractError(error, contract);
        alert("Transaction failed: " + errorMessage);
      } catch (formatError) {
        alert("Transaction failed: " + error.message);
      }
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
  