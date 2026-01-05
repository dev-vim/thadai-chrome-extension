import { getThadaiContractProvider, getThadaiContract, getThadaiContractAddress } from '../core/eth/thadai-contract.js';
import { getChainRpcUrlFromStorage, getUserAddress } from '../common/session-user-data.js';

/**
 * Check if the user has access by querying the ThadaiCoreV1 smart contract
 * @returns {Promise<boolean>} True if user has active access, false otherwise
 */
export async function isAccessAllowed() {
    try {
        const CHAIN_RPC_URL = await getChainRpcUrlFromStorage();
        const provider = getThadaiContractProvider(CHAIN_RPC_URL);
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
            contractAddress: getThadaiContractAddress()
        });
        return hasAccess;
    } catch (error) {
        console.error('[BGW] Error in isAccessAllowed():', error);
        // Return false on error to be safe (block access if we can't verify)
        return false;
    }
}