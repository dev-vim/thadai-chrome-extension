import { checkAccess } from '../core/eth/thadai-contract.js'
import { getChainRpcUrlFromStorage, getUserAddress } from '../common/session-user-data.js'

/**
 * Check if the user has access by querying the ThadaiCoreV1 smart contract
 * @returns {Promise<boolean>} True if user has active access, false otherwise
 */
export async function isAccessAllowed() {
  try {
    const chainRpcUrl = await getChainRpcUrlFromStorage()
    const userAddress = await getUserAddress()
    const [hasAccess, remainingSeconds] = await checkAccess(chainRpcUrl, userAddress)
    console.log('[BGW] checkAccess result:', {
      hasAccess,
      remainingSeconds: remainingSeconds.toString(),
    })
    return hasAccess
  } catch (error) {
    console.error('[BGW] Error in isAccessAllowed():', error)
    // Return false on error to be safe (block access if we can't verify)
    return false
  }
}
