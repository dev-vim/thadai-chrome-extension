import { SLIDER_CONFIG } from './popup-constants.js';
import { updateUsageHint, showLoadingSpinner, hideLoadingSpinner, showTransactionSuccess } from './popup-utils.js';

document.addEventListener("DOMContentLoaded", async function () {
  await updatePopupContext();

  // Setup slider
  const slider = document.getElementById("popup-amount-slider");
  const usageHint = document.getElementById("popup-usage-hint");

  slider.addEventListener("input", function () {
    const value = parseFloat(slider.value);
    updateUsageHint(usageHint, value);
  });
  const initialValue = parseFloat(slider.value);
  updateUsageHint(usageHint, initialValue);

  document.getElementById("popup-user-deposit-intent-button").addEventListener("click", processUserDepositIntent);

  // Settings button logic
  const settingsBtn = document.getElementById("settings-btn");
  const settingsPage = document.getElementById("settings-page");
  const mainPopupContent = document.getElementById("main-popup-content");
  const backBtn = document.getElementById("settings-back-btn");
  const saveKeyBtn = document.getElementById("save-private-key-btn");
  const privateKeyInput = document.getElementById("private-key-input");

  settingsBtn.addEventListener("click", function () {
    mainPopupContent.classList.add("hidden");
    settingsPage.classList.remove("hidden");
    backBtn.classList.remove("hidden");
    settingsBtn.classList.add("hidden");
  });

  backBtn.addEventListener("click", function () {
    settingsPage.classList.add("hidden");
    mainPopupContent.classList.remove("hidden");
    backBtn.classList.add("hidden");
    settingsBtn.classList.remove("hidden");
  });

  saveKeyBtn.addEventListener("click", async function () {
    const key = privateKeyInput.value.trim();
    if (!key) {
      alert("Please enter a private key.");
      return;
    }
    await chrome.storage.local.set({ USER_PRIVATE_KEY: key });
    alert("Private key saved.");
    privateKeyInput.value = "";
  });
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
      await userPurchaseAccess();
      chrome.storage.local.remove("popupOpenedProgrammatically");
    } else {
      await userTopUp();
    }
  } catch (error) {
    console.error("[PU] Error processUserDepositIntent() :", error);
  }
}

function getSliderAmount() {
  const slider = document.getElementById("popup-amount-slider");
  const amount = parseFloat(slider.value);
  if (!amount || isNaN(amount)) {
    throw new Error("Invalid amount");
  }
  return amount;
}

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
  const button = document.getElementById("popup-user-deposit-intent-button");
  const originalText = showLoadingSpinner(button);
  try {
    const amount = getSliderAmount();
    await executePurchaseAccess(amount);
    notifyOnPurchaseAccessSuccess();
    showTransactionSuccess();
  } catch (error) {
    hideLoadingSpinner(button, originalText);
    if (error.message === "Invalid amount") {
      alert("Invalid amount");
      return;
    }
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

async function userTopUp() {
  const button = document.getElementById("popup-user-deposit-intent-button");
  const originalText = showLoadingSpinner(button);
  try {
    const amount = getSliderAmount();
    await executePurchaseAccess(amount);
    notifyOnTopUpSuccess();
    showTransactionSuccess();
  } catch (error) {
    hideLoadingSpinner(button, originalText);
    if (error.message === "Invalid amount") {
      alert("Invalid amount");
      return;
    }
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

