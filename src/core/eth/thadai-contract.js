// for Anvil testing
// from
// acc1 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// pk1 = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
// to
// acc2 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
// pk2 = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
// CHAIN STUFF
// const CHAIN_NAME = "anvil";
// const CHAIN_ID = 31337;
// const CHAIN_RPC_URL = "http://localhost:8545";

import { THADAI_ABI, THADAI_ADDRESS } from './thadai-metadata.js';
import { Contract, JsonRpcApiProvider, parseEther } from 'ethers';

export function getThadaiContractAddress() {
  return THADAI_ADDRESS;

}

export function getThadaiContractProvider(CHAIN_RPC_URL) {
  return new JsonRpcApiProvider(CHAIN_RPC_URL);
}

export function getThadaiContract(signerOrProvider) {
  return new Contract(THADAI_ADDRESS, THADAI_ABI, signerOrProvider);
}

export async function executePurchaseAccess(amount, chain_rpc_url, user_private_key) {
  const provider = new ethers.JsonRpcProvider(chain_rpc_url);
  const wallet = new ethers.Wallet(user_private_key, provider);
  const contract = getThadaiContract(wallet);
  const wei = parseEther(amount.toString());
  const tx = await contract.purchaseAccess({ value: wei });
  const receipt = await tx.wait();
  return receipt;
}