export async function executePurchaseAccess(amount, chain_rpc_url, user_private_key) {
  const provider = new ethers.JsonRpcProvider(chain_rpc_url);
  const wallet = new ethers.Wallet(user_private_key, provider);
  const contract = getThadaiContract(wallet);
  const wei = ethers.parseEther(amount.toString());
  const tx = await contract.purchaseAccess({ value: wei });
  const receipt = await tx.wait();
  console.log("[PU] purchaseAccess receipt", receipt);
  return receipt;
}
