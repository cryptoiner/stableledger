import { injected } from 'wagmi/connectors'

// Simple, reliable connector setup that avoids external dependencies
export const getReliableConnectors = () => {
  return [
    injected({
      target: {
        id: 'injected',
        name: 'Browser Wallet',
        provider: typeof window !== 'undefined' ? window.ethereum : undefined,
      },
    }),
  ]
}

// Fallback for MetaMask specifically
export const getMetaMaskConnector = () => {
  if (typeof window === 'undefined') return null
  
  return injected({
    target: {
      id: 'metaMask',
      name: 'MetaMask',
      provider: window.ethereum,
    },
  })
}