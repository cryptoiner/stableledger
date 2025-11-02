'use client'

import { createConfig, http } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { stableLedgerAnyTrust } from './config'

// Simple, reliable wagmi configuration
export const config = createConfig({
  chains: [arbitrumSepolia, stableLedgerAnyTrust],
  connectors: [
    injected({
      target: 'metaMask',
    }),
    injected({
      target: () => ({
        id: 'browser',
        name: 'Browser Wallet',
        provider: typeof window !== 'undefined' ? window.ethereum : undefined,
      }),
    }),
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
    [stableLedgerAnyTrust.id]: http('/api/node'),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}