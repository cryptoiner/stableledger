import { parseEther, isAddress } from 'viem'
import { CONTRACTS, CHAIN_IDS } from '../config'
import { GAS_LIMITS, BRIDGE_FEES, MIN_AMOUNTS, BRIDGE_ERRORS } from './bridgeConstants'
import type { DepositParams, WithdrawalParams } from './bridgeTypes'

// Import ABIs
import L1GatewayRouterABI from '../abis/L1GatewayRouter.json'
import L2GatewayRouterABI from '../abis/L2GatewayRouter.json'
import InboxABI from '../abis/Inbox.json'
import ERC20ABI from '../abis/ERC20.json'

export const BRIDGE_ABIS = {
  L1GatewayRouter: L1GatewayRouterABI,
  L2GatewayRouter: L2GatewayRouterABI,
  Inbox: InboxABI,
  ERC20: ERC20ABI,
} as const

/**
 * Validates bridge parameters
 */
export function validateBridgeParams(
  amount: string,
  recipient: string,
  token: 'ETH' | 'USDC'
): { isValid: boolean; error?: string } {
  // Check amount
  if (!amount || parseFloat(amount) <= 0) {
    return { isValid: false, error: BRIDGE_ERRORS.INVALID_AMOUNT }
  }

  const amountWei = parseEther(amount)
  const minAmount = token === 'ETH' ? MIN_AMOUNTS.ETH : MIN_AMOUNTS.ERC20

  if (amountWei < minAmount) {
    return { isValid: false, error: BRIDGE_ERRORS.INVALID_AMOUNT }
  }

  // Check recipient address
  if (!recipient || !isAddress(recipient)) {
    return { isValid: false, error: BRIDGE_ERRORS.INVALID_RECIPIENT }
  }

  return { isValid: true }
}

/**
 * Prepares deposit parameters for ETH
 */
export function prepareETHDepositParams(
  amount: string,
  recipient: string
): DepositParams {
  return {
    token: '0x0000000000000000000000000000000000000000', // ETH address
    amount: parseEther(amount),
    recipient,
    maxGas: BRIDGE_FEES.MAX_GAS,
    gasPriceBid: BRIDGE_FEES.GAS_PRICE_BID,
  }
}

/**
 * Prepares deposit parameters for ERC20 tokens
 */
export function prepareERC20DepositParams(
  amount: string,
  recipient: string,
  tokenAddress: string
): DepositParams {
  return {
    token: tokenAddress,
    amount: parseEther(amount),
    recipient,
    maxGas: BRIDGE_FEES.MAX_GAS,
    gasPriceBid: BRIDGE_FEES.GAS_PRICE_BID,
  }
}

/**
 * Prepares withdrawal parameters
 */
export function prepareWithdrawalParams(
  amount: string,
  recipient: string,
  tokenAddress: string
): WithdrawalParams {
  return {
    token: tokenAddress,
    amount: parseEther(amount),
    recipient,
  }
}

/**
 * Calculates total ETH needed for bridge transaction
 */
export function calculateBridgeETHCost(amount: string, isETHDeposit: boolean): bigint {
  const amountWei = isETHDeposit ? parseEther(amount) : 0n
  const gasCost = BRIDGE_FEES.SUBMISSION_COST + (BRIDGE_FEES.GAS_PRICE_BID * BRIDGE_FEES.MAX_GAS)
  
  return amountWei + gasCost
}

/**
 * Gets bridge contract configuration
 */
export function getBridgeConfig() {
  return {
    contracts: {
      l1Router: CONTRACTS.BRIDGE_PARENT.L1Router,
      l1Gateway: CONTRACTS.BRIDGE_PARENT.L1Gateway,
      l2Router: CONTRACTS.BRIDGE_CHILD.L2Router,
      l2Gateway: CONTRACTS.BRIDGE_CHILD.L2Gateway,
      inbox: CONTRACTS.BRIDGE_PARENT.Inbox,
    },
    chainIds: {
      l1: CHAIN_IDS.ARBITRUM_SEPOLIA,
      l2: CHAIN_IDS.STABLELEDGER_ANYTRUST,
    },
    tokens: {
      usdc: CONTRACTS.USDC_PARENT,
    },
  }
}

/**
 * Formats bridge error messages for user display
 */
export function formatBridgeError(error: string): string {
  switch (error) {
    case BRIDGE_ERRORS.INSUFFICIENT_BALANCE:
      return 'Insufficient balance for this transaction'
    case BRIDGE_ERRORS.INSUFFICIENT_ALLOWANCE:
      return 'Token allowance too low. Please approve tokens first'
    case BRIDGE_ERRORS.INVALID_AMOUNT:
      return 'Invalid amount. Please enter a valid amount'
    case BRIDGE_ERRORS.INVALID_RECIPIENT:
      return 'Invalid recipient address'
    case BRIDGE_ERRORS.NETWORK_MISMATCH:
      return 'Please switch to the correct network'
    case BRIDGE_ERRORS.CONTRACT_INTERACTION_FAILED:
      return 'Contract interaction failed. Please try again'
    case BRIDGE_ERRORS.TRANSACTION_REJECTED:
      return 'Transaction was rejected by user'
    default:
      return 'An unexpected error occurred'
  }
}

/**
 * Encodes data for bridge transfers
 */
export function encodeBridgeData(recipient: string): string {
  // For simple transfers, we can use empty data or encode recipient
  return '0x'
}