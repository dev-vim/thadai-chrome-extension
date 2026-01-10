import { updateUsageHint, showLoadingSpinner, hidePopUpAfterDelay, hideLoadingSpinner, showTransactionSuccess, showSetThadaiConfigMessage } from './ui.js';
import { executePurchaseAccess } from '../core/eth/thadai-contract.js';
import { getPrivateKeyFromStorage, getChainRpcUrlFromStorage } from '../common/session-user-data.js';
import { formatContractError } from './utils.js';

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
  const settingsPage = document.getElementById("popup-settings-page");
  const mainPopupContent = document.getElementById("popup-content");
  const backBtn = document.getElementById("settings-back-btn");
  const saveSettingsBtn = document.getElementById("save-settings-btn");
  const privateKeyInput = document.getElementById("private-key-input");
  const chainNameInput = document.getElementById("chain-name-input");
  const chainIdInput = document.getElementById("chain-id-input");
  const chainRpcUrlInput = document.getElementById("chain-rpc-url-input");

  settingsBtn.addEventListener("click", function () {
    const settingsUrl = chrome.runtime.getURL('src/popup/settings.html');
    window.open(
      settingsUrl,
      '_blank',
      'width=320,height=500,left=100,top=100,menubar=no,toolbar=no,location=no,status=no'
    );
  });

  backBtn.addEventListener("click", async function () {
    settingsPage.classList.add("hidden");
    const USER_PRIVATE_KEY = await getPrivateKeyFromStorage();
    const mainPopupContent = document.getElementById("popup-content");
    const inputSection = document.getElementById("popup-user-inputs-section");
    const successMessage = document.getElementById("popup-success-message");
    if (USER_PRIVATE_KEY) {
      mainPopupContent.classList.remove("hidden");
      backBtn.classList.add("hidden");
      settingsBtn.classList.remove("hidden");
      // Show the input section and hide the success message
      if (inputSection) {
        await updatePopupContext();
        inputSection.classList.add("visible");
        inputSection.style.display = "";
      }
      if (successMessage) {
        successMessage.classList.remove("visible");
        successMessage.textContent = "Enjoy winding down!";
      }
    } else {
      // If still not set, show the set key message
      showSetThadaiConfigMessage();
      backBtn.classList.add("hidden");
      settingsBtn.classList.remove("hidden");
    }
  });

  // Load settings on open
  settingsBtn.addEventListener("click", async function () {
    const { THADAI_USER_PRIVATE_KEY, THADAI_CHAIN_NAME, THADAI_CHAIN_ID, THADAI_CHAIN_RPC_URL } = await chrome.storage.local.get([
      "THADAI_USER_PRIVATE_KEY",
      "THADAI_CHAIN_NAME",
      "THADAI_CHAIN_ID",
      "THADAI_CHAIN_RPC_URL"
    ]);
    privateKeyInput.value = THADAI_USER_PRIVATE_KEY || "";
    chainNameInput.value = THADAI_CHAIN_NAME || "";
    chainIdInput.value = THADAI_CHAIN_ID || "";
    chainRpcUrlInput.value = THADAI_CHAIN_RPC_URL || "";
  });

  saveSettingsBtn.addEventListener("click", async function () {
    const key = privateKeyInput.value.trim();
    const chainName = chainNameInput.value.trim();
    const chainId = chainIdInput.value.trim();
    const chainRpcUrl = chainRpcUrlInput.value.trim();
    if (!key) {
      alert("Please enter a private key.");
      return;
    }
    if (!chainName) {
      alert("Please enter a chain name.");
      return;
    }
    if (!chainId) {
      alert("Please enter a chain ID.");
      return;
    }
    if (!chainRpcUrl) {
      alert("Please enter a chain RPC URL.");
      return;
    }
    await chrome.storage.local.set({
      THADAI_USER_PRIVATE_KEY: key,
      THADAI_CHAIN_NAME: chainName,
      THADAI_CHAIN_ID: chainId,
      THADAI_CHAIN_RPC_URL: chainRpcUrl
    });
    alert("Settings saved.");
    privateKeyInput.value = "";
    chainNameInput.value = "";
    chainIdInput.value = "";
    chainRpcUrlInput.value = "";
  });
});

async function updatePopupContext() {
  try {
    const popupLogic = await chrome.storage.local.get(
      "popupOpenedProgrammatically"
    );

    const USER_PRIVATE_KEY = await getPrivateKeyFromStorage();
    if (!USER_PRIVATE_KEY) {
      showSetThadaiConfigMessage();
    } else {
      const inputSection = document.getElementById("popup-user-inputs-section");
      const button = document.getElementById("popup-user-deposit-intent-button");
      inputSection.classList.add("visible");

      if (popupLogic.popupOpenedProgrammatically) {
        button.textContent = "Purchase access";
      } else {
        button.textContent = "Topup access";
      }
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

async function userPurchaseAccess() {
  const button = document.getElementById("popup-user-deposit-intent-button");
  const originalText = showLoadingSpinner(button);
  try {
    const amount = getSliderAmount();
    const USER_PRIVATE_KEY = await getPrivateKeyFromStorage();
    const CHAIN_RPC_URL = await getChainRpcUrlFromStorage();
    const receipt = await executePurchaseAccess(amount, CHAIN_RPC_URL, USER_PRIVATE_KEY);
    console.log("[PU] purchaseAccess receipt", receipt);
    notifyOnPurchaseAccessSuccess();
    showTransactionSuccess();
  } catch (error) {
    hideLoadingSpinner(button, originalText);
    if (error.message === "Invalid amount") {
      alert("Invalid amount");
    } else {
      alert("Purchase access failed: " + formatContractError(error));
    }
    hidePopUpAfterDelay(100);
  }
}

async function userTopUp() {
  const button = document.getElementById("popup-user-deposit-intent-button");
  const originalText = showLoadingSpinner(button);
  try {
    const amount = getSliderAmount();
    const USER_PRIVATE_KEY = await getPrivateKeyFromStorage();
    const CHAIN_RPC_URL = await getChainRpcUrlFromStorage();
    const receipt = await executePurchaseAccess(amount, CHAIN_RPC_URL, USER_PRIVATE_KEY);
    console.log("[PU] purchaseAccess receipt", receipt);
    notifyOnTopUpSuccess();
    showTransactionSuccess();
  } catch (error) {
    hideLoadingSpinner(button, originalText);
    if (error.message === "Invalid amount") {
      alert("Invalid amount");
    } else {
      alert("User top up failed: " + formatContractError(error));
    }
    hidePopUpAfterDelay(100);
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
