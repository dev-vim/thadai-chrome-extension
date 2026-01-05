import { ethers } from 'ethers';

// TODO: Remove occurence of this, NOT GOOD. Figure out an alternative - maybe encoded PK? Check other occurences too
export function getPrivateKeyFromStorage() {
  return chrome.storage.local.get("THADAI_USER_PRIVATE_KEY").then((result) => {
    return result.THADAI_USER_PRIVATE_KEY;
  });
}

export function getChainRpcUrlFromStorage() {
  return chrome.storage.local.get("THADAI_CHAIN_RPC_URL").then((result) => {
    return result.THADAI_CHAIN_RPC_URL;
  })
}

function isValidPrivateKey(key) {
    // Must be a 0x-prefixed 64 hex chars (32 bytes)
    return typeof key === 'string' && /^0x[0-9a-fA-F]{64}$/.test(key);
}

export async function getUserAddress() {
    const USER_PRIVATE_KEY = await getPrivateKeyFromStorage();
    if (!USER_PRIVATE_KEY) throw new Error("No private key set");
    if (!isValidPrivateKey(USER_PRIVATE_KEY)) throw new Error("Invalid private key format");
    return ethers.computeAddress(USER_PRIVATE_KEY);
}
