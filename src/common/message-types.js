/**
 * Chrome runtime message type constants for inter-layer communication.
 *
 * Naming prefix convention:
 *   CS_  — sent by the Content Script
 *   BGW_ — sent by the Background Worker
 *   PU_  — sent by the Popup
 */

/**
 * Content Script → Background Worker
 * Ask whether the current user has active access to the blocked site.
 * Response: `{ accessAllowed: boolean }`
 */
export const CS_IS_ACCESS_ALLOWED = 'CS_IS_ACCESS_ALLOWED'

/**
 * Content Script → Background Worker
 * Request that the extension popup be opened so the user can purchase access.
 * No response expected.
 */
export const CS_REQUEST_TOPUP = 'CS_REQUEST_TOPUP'

/**
 * Background Worker → Content Script
 * Notify that the user's access has been confirmed; the viewport should be unblocked.
 * Response: `{ success: true }`
 */
export const BGW_ON_ACCESS_ALLOWED = 'BGW_ON_ACCESS_ALLOWED'

/**
 * Popup → Background Worker
 * Notify that a purchaseAccess (withdraw-and-purchase) transaction succeeded.
 * Response: `{ success: boolean }`
 */
export const PU_ON_PURCHASE_ACCESS_SUCCESS = 'PU_ON_PURCHASE_ACCESS_SUCCESS'

/**
 * Popup → Background Worker
 * Notify that a top-up (purchaseAccess) transaction succeeded.
 * Response: `{ success: boolean }`
 */
export const PU_ON_TOPUP_SUCCESS = 'PU_ON_TOPUP_SUCCESS'

/**
 * Settings page → Background Worker
 * Request that the main extension popup be opened.
 * Response: `{ success: boolean }`
 */
export const OPEN_PU_FROM_SETTINGS = 'OPEN_PU_FROM_SETTINGS'
