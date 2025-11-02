import { defineChain } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

// Define our custom AnyTrust chain with USDC gas token
export const stableLedgerAnyTrust = defineChain({
  id: 412346,
  name: 'StableLedger AnyTrust Chain (USDC)',
  network: 'stableledger-anytrust',
  nativeCurrency: {
    decimals: 18,
    name: 'Mock USDC',
    symbol: 'MUSDC',
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8547'], // Local node - will be configured later
    },
    public: {
      http: ['http://localhost:8547'],
    },
  },
  blockExplorers: {
    default: {
      name: 'StableLedger Explorer',
      url: 'http://localhost:4000', // Local explorer - will be configured later
    },
  },
  testnet: true,
  contracts: {
    // Will be populated when bridge contracts are deployed
  },
})

// Chain configurations
export const CHAINS = [
  arbitrumSepolia, // Parent chain
  stableLedgerAnyTrust, // Our custom AnyTrust chain
] as const

// Contract addresses from deployment
export const CONTRACTS = {
  // USDC token on parent chain (Arbitrum Sepolia)
  USDC_PARENT: '0xd220a5494fa26b586fce7364cf895db466802b29',
  
  // Rollup contract on parent chain
  ROLLUP: '0x5F45675AC8DDF7d45713b2c7D191B287475C16cF',
  
  // Arbitrum Sepolia Bridge contracts
  BRIDGE_PARENT: {
    L1Gateway: '0x902b3E5f8F19571859F4AB1003B960a5dF693aFF', // L1 ERC20 Gateway
    L1Router: '0xcE18836b233C83325Cc8848CA4487e94C6288264',  // L1 Gateway Router
    Inbox: '0x6c97864CE4bEf387dE0b3310A44230f7E3F1be0D',     // Sequencer Inbox
  },
  
  BRIDGE_CHILD: {
    L2Gateway: '0x6e244cD02BBB8a6dbd7F626f05B2ef82151Ab502', // L2 ERC20 Gateway
    L2Router: '0x9fDD1C4E4AA24EEc1d913FABea925594a20d43C7',  // L2 Gateway Router
  },
} as const

// Chain IDs for easy reference
export const CHAIN_IDS = {
  ARBITRUM_SEPOLIA: 421614,
  STABLELEDGER_ANYTRUST: 412346,
} as const

// Token configurations
export const TOKENS = {
  MUSDC: {
    address: CONTRACTS.USDC_PARENT,
    symbol: 'MUSDC',
    decimals: 18,
    name: 'Mock USDC',
    totalSupply: '1000000',
  },
} as const