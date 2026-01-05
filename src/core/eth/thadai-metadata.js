
export const THADAI_ADDRESS = "0x5fc748f1FEb28d7b76fa1c6B07D8ba2d5535177c"; // my local anvil contract address
export const THADAI_ABI = [
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