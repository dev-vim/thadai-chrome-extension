import { executeCheckAccess } from '../core/eth/thadai-contract.js';
import { getChainRpcUrlFromStorage, getUserAddress } from '../common/session-user-data.js';

/**
 * Check if the user has access by querying the ThadaiCoreV1 smart contract
 * @returns {Promise<boolean>} True if user has active access, false otherwise
 */
export async function isAccessAllowed() {
    try {
        let userAddress, chain_rpc_url;
        try {
            chain_rpc_url = await getChainRpcUrlFromStorage();
            userAddress = await getUserAddress();
        } catch (error) {
            console.log('[BGW] Error retrieving user data from storage:', error);
            return false;
        }
        const [hasAccess, remainingSeconds] = await executeCheckAccess(
            chain_rpc_url,
            userAddress
        );
        console.log('[BGW] Access check result:', {
            hasAccess,
            remainingSeconds: remainingSeconds.toString()
        });
        return hasAccess;
    } catch (error) {
        console.error('[BGW] Error in isAccessAllowed():', error);
        // Return false on error to be safe (block access if we can't verify)
        return false;
    }
}