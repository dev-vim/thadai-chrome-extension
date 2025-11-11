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
      const errorMessage = await formatContractError(error, contract);
      alert("Transaction failed: " + errorMessage);
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
      const errorMessage = await formatContractError(error, contract);
      alert("Transaction failed: " + errorMessage);
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
  