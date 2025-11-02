export interface BridgeTransaction {
  hash: string
  from: string
  to: string
  amount: string
  token: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  type: 'deposit' | 'withdrawal'
  chainId: number
}

export interface DepositParams {
  token: string
  amount: bigint
  recipient: string
  maxGas?: bigint
  gasPriceBid?: bigint
}

export interface WithdrawalParams {
  token: string
  amount: bigint
  recipient: string
}

export interface BridgeContractAddresses {
  l1Router: string
  l1Gateway: string
  l2Router: string
  l2Gateway: string
  inbox: string
}

export interface BridgeConfig {
  contracts: BridgeContractAddresses
  gasLimits: {
    deposit: bigint
    withdrawal: bigint
    approve: bigint
  }
  fees: {
    submissionCost: bigint
    gasPriceBid: bigint
  }
}