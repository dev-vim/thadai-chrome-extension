import { checkAccess, getAccessInfo } from '../core/eth/thadai-contract.js'
import { getChainRpcUrlFromStorage, getUserAddress } from '../common/session-user-data.js'

/**
 * Check if the user has access by querying the ThadaiCoreV1 smart contract
 * @returns {Promise<boolean>} True if user has active access, false otherwise
 */
export async function isAccessAllowed() {
  try {
    let userAddress, chainRpcUrl
    try {
      chainRpcUrl = await getChainRpcUrlFromStorage()
      userAddress = await getUserAddress()
    } catch (error) {
      console.log('[BGW] Error retrieving user data from storage:', error)
      return false
    }
    const [hasAccess, remainingSeconds] = await checkAccess(chainRpcUrl, userAddress)
    console.log('[BGW] checkAccess result:', {
      hasAccess,
      remainingSeconds: remainingSeconds.toString(),
    })
    const [accessUntil, balance, totalPaid, lastRedemptionTime, canWithdraw, cooldownRemaining] =
      await getAccessInfo(chainRpcUrl, userAddress)
    console.log('[BGW] getAccessInfo result: ', {
      accessUntil: accessUntil.toString(),
      balance: balance.toString(),
      totalPaid: totalPaid.toString(),
      lastRedemptionTime: lastRedemptionTime.toString(),
      canWithdraw,
      cooldownRemaining: cooldownRemaining.toString(),
    })
    return hasAccess
  } catch (error) {
    console.error('[BGW] Error in isAccessAllowed():', error)
    // Return false on error to be safe (block access if we can't verify)
    return false
  }
}
