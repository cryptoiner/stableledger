import { parseEther } from 'viem'

// Gas limits for different bridge operations
export const GAS_LIMITS = {
  DEPOSIT_ETH: 250000n,
  DEPOSIT_ERC20: 300000n,
  WITHDRAWAL: 200000n,
  APPROVE: 50000n,
} as const

// Arbitrum bridge fees and parameters
export const BRIDGE_FEES = {
  // Submission cost for L1 to L2 messages (covers L2 gas)
  SUBMISSION_COST: parseEther('0.001'), // 0.001 ETH
  
  // Gas price bid for L2 execution
  GAS_PRICE_BID: parseEther('0.0000001'), // 0.1 gwei
  
  // Maximum gas for L2 execution
  MAX_GAS: 300000n,
} as const

// Bridge transaction timeouts
export const TIMEOUTS = {
  CONFIRMATION: 15000, // 15 seconds
  CHALLENGE_PERIOD: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
} as const

// Minimum amounts for bridge operations (to prevent dust)
export const MIN_AMOUNTS = {
  ETH: parseEther('0.001'), // 0.001 ETH
  ERC20: parseEther('0.01'), // 0.01 tokens (assuming 18 decimals)
} as const

// Error codes for bridge operations
export const BRIDGE_ERRORS = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_ALLOWANCE: 'INSUFFICIENT_ALLOWANCE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_RECIPIENT: 'INVALID_RECIPIENT',
  NETWORK_MISMATCH: 'NETWORK_MISMATCH',
  CONTRACT_INTERACTION_FAILED: 'CONTRACT_INTERACTION_FAILED',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
} as const