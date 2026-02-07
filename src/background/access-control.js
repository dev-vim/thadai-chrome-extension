import { checkAccess } from '../core/eth/thadai-contract.js'
import {
  getChainRpcUrlFromStorage,
  getUserAddress,
  getThadaiContractAddressFromStorage,
  isThadaiConfigurationSet,
} from '../common/session-user-data.js'

/**
 * Check if the user has access by querying the ThadaiCoreV1 smart contract
 * @returns {Promise<boolean>} True if user has active access, false otherwise
 */
export async function isAccessAllowed() {
  if (!(await isThadaiConfigurationSet())) {
    console.warn('[BGW] Thadai configuration is not set. Access denied.')
    return false
  }
  try {
    const chainRpcUrl = await getChainRpcUrlFromStorage()
    const userAddress = await getUserAddress()
    const thadaiContractAddress = await getThadaiContractAddressFromStorage()
    const [hasAccess, remainingSeconds] = await checkAccess(
      chainRpcUrl,
      userAddress,
      thadaiContractAddress,
    )
    console.log(
      '[BGW] checkAccess result for user',
      userAddress,
      ': hasAccess =',
      hasAccess,
      ', remainingSeconds =',
      remainingSeconds.toString(),
    )
    return hasAccess
  } catch (error) {
    if (error.message == 'Failed to fetch') {
      console.error(
        '[BGW] Network error: Unable to reach the RPC URL. Please check your internet connection or the RPC URL configuration.',
      )
    } else {
      console.error('[BGW] Error in isAccessAllowed():', error)
    }
    return false
  }
}
