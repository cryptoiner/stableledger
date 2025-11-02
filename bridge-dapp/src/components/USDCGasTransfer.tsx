'use client'

import { useState } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useEstimateGas } from 'wagmi'
import { parseEther, formatEther, isAddress } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { CHAIN_IDS, CONTRACTS } from '@/lib/config'
import { useToastContext } from './ToastProvider'

interface USDCGasTransferProps {
  onClose?: () => void
}

export default function USDCGasTransfer({ onClose }: USDCGasTransferProps) {
  const { address, isConnected } = useAccount()
  const { showToast } = useToastContext()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [transferType, setTransferType] = useState<'usdc' | 'native'>('usdc')

  // Get USDC balance on Arbitrum Sepolia (representing AnyTrust chain balance)
  const { data: usdcBalance } = useBalance({
    address,
    token: CONTRACTS.USDC_PARENT as `0x${string}`,
    chainId: CHAIN_IDS.ARBITRUM_SEPOLIA,
  })

  // Get ETH balance for gas estimation
  const { data: ethBalance } = useBalance({
    address,
    chainId: CHAIN_IDS.ARBITRUM_SEPOLIA,
  })

  // Contract write hook
  const { 
    writeContract, 
    data: hash,
    isPending: isWritePending,
    error: writeError 
  } = useWriteContract()

  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Gas estimation for USDC transfer
  const { data: gasEstimate } = useEstimateGas({
    to: CONTRACTS.USDC_PARENT as `0x${string}`,
    data: recipient && amount && isAddress(recipient) ? 
      // This is a simplified gas estimation
      '0xa9059cbb' + 
      recipient.slice(2).padStart(64, '0') + 
      parseEther(amount || '0').toString(16).padStart(64, '0')
      : undefined,
    query: {
      enabled: Boolean(recipient && amount && isAddress(recipient))
    }
  })

  const handleTransfer = async () => {
    if (!isConnected || !address || !amount || !recipient) return
    
    try {
      if (!isAddress(recipient)) {
        showToast({
          type: 'error',
          title: 'Invalid Address',
          message: 'Please enter a valid recipient address',
          duration: 4000
        })
        return
      }

      const amountWei = parseEther(amount)
      
      if (transferType === 'usdc') {
        // Transfer USDC tokens
        writeContract({
          address: CONTRACTS.USDC_PARENT as `0x${string}`,
          abi: [
            {
              name: 'transfer',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' }
              ],
              outputs: [{ name: '', type: 'bool' }]
            }
          ],
          functionName: 'transfer',
          args: [recipient as `0x${string}`, amountWei],
          chain: arbitrumSepolia,
          account: address as `0x${string}`,
        })
      } else {
        // On AnyTrust chain, this would send USDC as gas payment
        // For demo, we'll show how this would work
        showToast({
          type: 'info',
          title: 'USDC Gas Demo',
          message: `On AnyTrust Chain: Would send ${amount} MUSDC to ${recipient}. Gas fees would be paid in MUSDC (not ETH). Estimated gas: ${gasEstimate ? formatEther(gasEstimate) : 'calculating...'} MUSDC. This is currently a simulation.`,
          duration: 8000
        })
      }
    } catch (error) {
      console.error('Transfer error:', error)
    }
  }

  const setMaxUSDC = () => {
    if (usdcBalance?.value && usdcBalance.value > BigInt(0)) {
      // Leave a small amount for gas fees (in USDC terms)
      const gasReserve = parseEther('1') // Reserve 1 USDC for gas
      const maxTransfer = usdcBalance.value > gasReserve 
        ? usdcBalance.value - gasReserve 
        : BigInt(0)
      
      if (maxTransfer > BigInt(0)) {
        setAmount(formatEther(maxTransfer))
      }
    }
  }

  const estimatedGasCostUSDC = gasEstimate ? formatEther(gasEstimate) : '~0.01'

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">USDC Gas Transfer</h2>
          <p className="text-gray-600">Please connect your wallet to send transactions with USDC gas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-8 max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">USDC Gas Transfer</h2>
            <p className="text-sm text-gray-600">Pay gas fees with USDC</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 rounded-xl p-3 transition-colors duration-200 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Transfer Type Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Transfer Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTransferType('usdc')}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
              transferType === 'usdc'
                ? 'border-green-500 bg-green-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transferType === 'usdc' ? 'bg-green-600' : 'bg-gray-400'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className={`font-semibold text-sm ${
                transferType === 'usdc' ? 'text-gray-900' : 'text-gray-700'
              }`}>Send USDC</span>
              <span className={`text-xs text-center ${
                transferType === 'usdc' ? 'text-green-600' : 'text-gray-500'
              }`}>Standard Transfer</span>
            </div>
            {transferType === 'usdc' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
          <button
            onClick={() => setTransferType('native')}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
              transferType === 'native'
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transferType === 'native' ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className={`font-semibold text-sm ${
                transferType === 'native' ? 'text-gray-900' : 'text-gray-700'
              }`}>USDC Gas</span>
              <span className={`text-xs text-center ${
                transferType === 'native' ? 'text-blue-600' : 'text-gray-500'
              }`}>Pay Gas in USDC</span>
            </div>
            {transferType === 'native' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Balance Display */}
      <div className="mb-6 bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">Available Balance</span>
          <span className="text-lg font-semibold text-gray-900">
            {usdcBalance ? formatEther(usdcBalance.value) : '0'} MUSDC
          </span>
        </div>
        {transferType === 'native' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Estimated Gas</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                ~{estimatedGasCostUSDC} MUSDC
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recipient Address */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Recipient Address
        </label>
        <div className="border rounded-xl p-1">
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 bg-transparent text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
          />
        </div>
        {recipient && !isAddress(recipient) && (
          <div className="mt-2 flex items-center space-x-2 text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Invalid address format</span>
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Amount (MUSDC)
        </label>
        <div className="relative">
          <div className="border rounded-xl p-1">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-3 bg-transparent text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-semibold"
            />
            <button
              onClick={setMaxUSDC}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-colors duration-200"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Gas Information */}
      {transferType === 'native' && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-gray-900">Gas Payment Info</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Gas</span>
              <span className="text-sm font-semibold text-blue-600">{estimatedGasCostUSDC} MUSDC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Cost</span>
              <span className="text-sm font-semibold text-gray-900">
                {amount ? (parseFloat(amount) + parseFloat(estimatedGasCostUSDC)).toFixed(6) : '0'} MUSDC
              </span>
            </div>
          </div>
          <div className="mt-3 bg-blue-100 rounded-lg p-3">
            <p className="text-sm text-blue-700 flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              On AnyTrust chain, all gas fees are paid in USDC instead of ETH
            </p>
          </div>
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleTransfer}
        disabled={
          !amount || 
          !recipient || 
          !isAddress(recipient) || 
          isWritePending || 
          isConfirming ||
          (usdcBalance?.value || BigInt(0)) < parseEther(amount || '0')
        }
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          transferType === 'usdc' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isWritePending || isConfirming ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing<span className="loading-dots"></span>
          </span>
        ) : transferType === 'usdc' ? (
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Send {amount || '0'} MUSDC
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Send with USDC Gas (Demo)
          </span>
        )}
      </button>

      {/* Transaction Status */}
      {hash && (
        <div className="mt-6 bg-gray-50 border rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {isConfirmed ? (
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {isConfirmed ? 'Transaction Confirmed!' : 'Transaction Submitted'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Hash: 
                <a 
                  href={`https://sepolia.arbiscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-green-600 hover:underline font-mono"
                >
                  {hash.slice(0, 8)}...{hash.slice(-6)}
                </a>
              </p>
              {isConfirming && (
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Waiting for confirmation...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(writeError || confirmError) && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Transaction Failed</p>
              <p className="text-sm text-gray-600 mt-1">
                {(writeError || confirmError)?.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 mb-2">🚀 AnyTrust Chain Features</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Pay gas fees in USDC instead of ETH</li>
              <li>• Lower transaction costs than traditional rollups</li>
              <li>• Data Availability Committee for security</li>
              <li>• Full EVM compatibility</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Demo Note:</strong> Currently testing on Arbitrum Sepolia. 
              AnyTrust chain node will be configured for full USDC gas functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}