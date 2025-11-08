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
const USER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const USER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// THADAI CONTRACT STUFF
const THADAI_ADDRESS = "0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519"; // my local anvil contract address
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
