import React from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import {
  Box,
  Chip,
  Button,
  Typography,
  CircularProgress,
  Tooltip,
  useTheme,
} from '@mui/material'
import { Warning } from '@mui/icons-material'
import { arbitrumSepolia } from 'viem/chains'
import { stableLedgerAnyTrust } from '@/lib/config'
import { useToastContext } from './ToastProvider'

const SUPPORTED_CHAINS = [
  {
    chain: arbitrumSepolia,
    name: 'Arbitrum Sepolia',
    shortName: 'L2',
    description: 'Parent Chain',
    color: 'primary',
  },
  {
    chain: stableLedgerAnyTrust,
    name: 'StableLedger AnyTrust',
    shortName: 'L3',
    description: 'USDC Gas Chain',
    color: 'success',
  },
] as const

export default function ChainSwitcher() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  const { showToast } = useToastContext()
  const theme = useTheme()

  const currentChain = SUPPORTED_CHAINS.find(c => c.chain.id === chainId)
  const isUnsupportedChain = isConnected && !currentChain

  const handleChainSwitch = async (targetChainId: number) => {
    if (!isConnected) {
      showToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet first',
        duration: 4000
      })
      return
    }

    try {
      await switchChain({ chainId: targetChainId as any })
      showToast({
        type: 'success',
        title: 'Chain Switched',
        message: `Successfully switched to ${SUPPORTED_CHAINS.find(c => c.chain.id === targetChainId)?.name}`,
        duration: 3000
      })
    } catch (error) {
      console.error('Chain switch error:', error)
      showToast({
        type: 'error',
        title: 'Chain Switch Failed',
        message: 'Failed to switch chains. Please try again.',
        duration: 4000
      })
    }
  }

  if (!isConnected) {
    return (
      <Typography variant="body2" color="text.secondary">
        Connect wallet
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Current Chain Indicator */}
      {currentChain ? (
        <Chip
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: `${currentChain.color}.main`,
                }}
              />
              <Typography variant="body2" fontWeight="600">
                {currentChain.shortName}
              </Typography>
              <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {currentChain.description}
              </Typography>
            </Box>
          }
          variant="outlined"
          color={currentChain.color}
          size="small"
        />
      ) : (
        <Chip
          icon={<Warning />}
          label="Unsupported"
          color="error"
          variant="outlined"
          size="small"
        />
      )}

      {/* Chain Switch Buttons */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {SUPPORTED_CHAINS.map((supportedChain) => (
          <Tooltip
            key={supportedChain.chain.id}
            title={`Switch to ${supportedChain.name}`}
            arrow
          >
            <span>
              <Button
                onClick={() => handleChainSwitch(supportedChain.chain.id)}
                disabled={isPending || chainId === supportedChain.chain.id}
                size="small"
                variant={chainId === supportedChain.chain.id ? "contained" : "outlined"}
                color={supportedChain.color}
                sx={{
                  minWidth: 40,
                  px: 1,
                  py: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                {isPending ? (
                  <CircularProgress size={12} />
                ) : (
                  supportedChain.shortName
                )}
              </Button>
            </span>
          </Tooltip>
        ))}
      </Box>

      {/* Unsupported Chain Warning */}
      {isUnsupportedChain && (
        <Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Warning fontSize="small" />
          Switch to supported chain
        </Typography>
      )}
    </Box>
  )
}