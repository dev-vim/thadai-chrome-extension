// for testing
// from
// acc1 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// pk1 = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
// to
// acc2 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
// pk2 = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

// CHAIN STUFF
const CHAIN_NAME = "anvil";
const CHAIN_ID = 31337;
const CHAIN_RPC_URL = "http://localhost:8545";

// USER STUFF
const USER_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const USER_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

// THADAI CONTRACT STUFF
const THADAI_ADDRESS = "0x5fc748f1FEb28d7b76fa1c6B07D8ba2d5535177c"; // my local anvil contract address
const THADAI_ABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_baseAccessPrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_minimumPaymentAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_withdrawCooldownInDays",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "baseAccessPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateAccessFromPayment",
    inputs: [{ name: "_payment", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "accessSeconds",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkAccess",
    inputs: [{ name: "_user", type: "address", internalType: "address" }],
    outputs: [
      { name: "hasAccess", type: "bool", internalType: "bool" },
      {
        name: "remainingSeconds",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getContractBalance",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserAccessInfo",
    inputs: [{ name: "_user", type: "address", internalType: "address" }],
    outputs: [
      { name: "accessUntil", type: "uint256", internalType: "uint256" },
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "totalPaid", type: "uint256", internalType: "uint256" },
      {
        name: "lastRedemptionTime",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "canWithdraw", type: "bool", internalType: "bool" },
      {
        name: "cooldownRemaining",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minimumPaymentAmount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "purchaseAccess",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "userAccess",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "accessUntil", type: "uint256", internalType: "uint256" },
      { name: "totalPaid", type: "uint256", internalType: "uint256" },
      {
        name: "lastRedemptionTime",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawCooldownInDays",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawFunds",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AccessPurchased",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "accessUntil",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ConfigurationUpdated",
    inputs: [
      {
        name: "newBasePrice",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newRedemptionCooldown",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UserWithdrawn",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "NoBalanceToWithdraw", inputs: [] },
  {
    type: "error",
    name: "PaymentBelowMinimumAmount",
    inputs: [
      {
        name: "minimumAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "WithdrawalCooldownActive",
    inputs: [
      {
        name: "cooldownRemaining",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
];


function getThadaiContract(signerOrProvider) {
  return new ethers.Contract(THADAI_ADDRESS, THADAI_ABI, signerOrProvider);
}

/**
 * Decode custom error from transaction error data
 * @param {string} errorData - The error data from the transaction (e.g., "0xcfba7ac6...")
 * @returns {Object|null} Decoded error object with name and args, or null if cannot decode
 */
function decodeCustomError(errorData) {
  if (!errorData || typeof errorData !== 'string' || !errorData.startsWith('0x')) {
    return null;
  }

  try {
    // Use ethers Interface to parse the error
    const iface = new ethers.Interface(THADAI_ABI);
    const decoded = iface.parseError(errorData);
    
    return {
      name: decoded.name,
      args: decoded.args,
      signature: decoded.signature
    };
  } catch (e) {
    // If parsing fails, try to manually match by selector
    const selector = errorData.slice(0, 10);
    
    for (const abiItem of THADAI_ABI) {
      if (abiItem.type === 'error') {
        const errorSignature = `${abiItem.name}(${abiItem.inputs.map(i => i.type).join(',')})`;
        const computedSelector = ethers.id(errorSignature).slice(0, 10);
        
        if (computedSelector.toLowerCase() === selector.toLowerCase()) {
          // Try to decode parameters manually
          try {
            const iface = new ethers.Interface([abiItem]);
            const decoded = iface.parseError(errorData);
            return {
              name: decoded.name,
              args: decoded.args,
              signature: errorSignature
            };
          } catch (decodeError) {
            // Return basic info if decoding fails
            return {
              name: abiItem.name,
              args: abiItem.inputs,
              signature: errorSignature,
              rawData: errorData.slice(10)
            };
          }
        }
      }
    }
    
    return null;
  }
}

/**
 * Format error message for display to user
 * @param {Error} error - The error object from ethers.js
 * @param {ethers.Contract} contract - The contract instance (optional, for fetching additional info)
 * @returns {Promise<string>} Formatted error message
 */
async function formatContractError(error, contract = null) {
  // Try to get error data from various possible locations
  // Error data can be in different places depending on how the error was thrown
  let errorData = null;
  
  // Check multiple possible locations for error data
  if (error.data) {
    errorData = error.data;
  } else if (error.reason) {
    if (typeof error.reason === 'string' && error.reason.startsWith('0x')) {
      errorData = error.reason;
    } else if (error.reason.data) {
      errorData = error.reason.data;
    } else if (error.reason.error && error.reason.error.data) {
      errorData = error.reason.error.data;
    }
  } else if (error.error && error.error.data) {
    errorData = error.error.data;
  }
  
  // Also check the error message for embedded data (sometimes ethers includes it)
  if (!errorData && error.message) {
    const dataMatch = error.message.match(/data="(0x[0-9a-fA-F]+)"/);
    if (dataMatch) {
      errorData = dataMatch[1];
    }
  }

  if (errorData) {
    const decoded = decodeCustomError(errorData);
    if (decoded) {
      if (decoded.name === 'PaymentBelowMinimumAmount' && decoded.args && decoded.args.length > 0) {
        const minimumAmount = decoded.args[0];
        const minimumEth = ethers.formatEther(minimumAmount);
        // Also try to get current minimum from contract if available
        if (contract) {
          try {
            const contractMinimum = await contract.minimumPaymentAmount();
            const contractMinimumEth = ethers.formatEther(contractMinimum);
            return `Payment is below the minimum amount required. Minimum payment: ${contractMinimumEth} ETH`;
          } catch (e) {
            // If we can't fetch from contract, use decoded value
          }
        }
        return `Payment is below the minimum amount required. Minimum payment: ${minimumEth} ETH`;
      } else if (decoded.name === 'NoBalanceToWithdraw') {
        return 'No balance available to withdraw';
      } else if (decoded.name === 'WithdrawalCooldownActive' && decoded.args && decoded.args.length > 0) {
        const cooldownRemaining = decoded.args[0];
        const daysRemaining = Number(cooldownRemaining) / (24 * 60 * 60);
        const hoursRemaining = Number(cooldownRemaining) / (60 * 60);
        if (daysRemaining >= 1) {
          return `Withdrawal cooldown is still active. Please wait ${daysRemaining.toFixed(2)} more days`;
        } else {
          return `Withdrawal cooldown is still active. Please wait ${hoursRemaining.toFixed(2)} more hours`;
        }
      } else {
        return `Contract error: ${decoded.name}${decoded.args ? ` (${decoded.args.map(a => a.toString()).join(', ')})` : ''}`;
      }
    }
  }

  // Fallback to ethers.js error message
  return error.shortMessage || error.message || 'Transaction failed';
}
