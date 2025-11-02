import React, { useState } from 'react'
import { useAccount, useChainId, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Alert,
  TextField,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Grid,
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab'
import {
  Close,
  ArrowDownward,
  Warning,
  Schedule,
  Security,
  PlayArrow,
  HourglassEmpty,
  CheckCircle,
  MonetizationOn,
} from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { CHAIN_IDS, CONTRACTS } from '@/lib/config'
import { useToastContext } from './ToastProvider'
import { 
  validateBridgeParams, 
  prepareWithdrawalParams,
  getBridgeConfig,
  formatBridgeError,
  encodeBridgeData,
  BRIDGE_ABIS 
} from '@/lib/bridge/bridgeHelpers'

interface L3ToL2BridgeProps {
  onClose: () => void
}

export default function L3ToL2Bridge({ onClose }: L3ToL2BridgeProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { showToast } = useToastContext()
  
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Get USDC balance on L3
  const { data: l3UsdcBalance } = useBalance({
    address,
    chainId: CHAIN_IDS.STABLELEDGER_ANYTRUST,
  })

  const { writeContract, data: hash, isPending: isWriting } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash,
  })

  // Handle transaction success
  React.useEffect(() => {
    if (isConfirmed && hash) {
      showToast({
        type: 'success',
        title: 'L3 Withdrawal Confirmed',
        message: `L3 withdrawal ${hash.slice(0, 10)}... confirmed! 7-day challenge period started. Claimable on L2 after challenge period.`,
        duration: 15000
      })
      
      // Log transaction details for debugging
      console.log('L3 Withdrawal confirmed:', {
        hash,
        receipt,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed,
        chainId: chainId,
        challengePeriodEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      
      // Show challenge period information
      showToast({
        type: 'info',
        title: 'Challenge Period Active',
        message: 'Your withdrawal is now in the 7-day challenge period. You can claim on L2 after this period ends.',
        duration: 12000
      })
    }
  }, [isConfirmed, hash, receipt, showToast])

  const handleWithdraw = async () => {
    if (!isConnected) {
      showToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet first',
        duration: 4000
      })
      return
    }

    if (chainId !== CHAIN_IDS.STABLELEDGER_ANYTRUST) {
      showToast({
        type: 'error',
        title: 'Wrong Network',
        message: 'Please switch to StableLedger AnyTrust to withdraw',
        duration: 4000
      })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
        duration: 4000
      })
      return
    }

    const targetAddress = recipient || address
    if (!targetAddress) {
      showToast({
        type: 'error',
        title: 'Invalid Recipient',
        message: 'Please enter a valid recipient address',
        duration: 4000
      })
      return
    }

    try {
      setIsProcessing(true)

      // Validate bridge parameters
      const validation = validateBridgeParams(amount, targetAddress, 'USDC')
      if (!validation.isValid) {
        showToast({
          type: 'error',
          title: 'Validation Error',
          message: formatBridgeError(validation.error!),
          duration: 4000
        })
        return
      }

      // Prepare withdrawal data
      const amountWei = parseEther(amount)
      const bridgeData = encodeBridgeData(targetAddress)

      // Execute withdrawal through L2 Gateway Router
      await writeContract({
        address: CONTRACTS.BRIDGE_CHILD.L2Router as `0x${string}`,
        abi: BRIDGE_ABIS.L2GatewayRouter,
        functionName: 'outboundTransfer',
        args: [
          CONTRACTS.USDC_PARENT, // token (L1 token address)
          targetAddress, // to
          amountWei, // amount
          bridgeData, // data
        ],
      })

      showToast({
        type: 'success',
        title: 'Withdrawal Initiated',
        message: `Successfully initiated withdrawal of ${amount} USDC to L2. Remember: 7-day challenge period required.`,
        duration: 8000
      })

      // Reset form
      setAmount('')
      setRecipient('')
      
    } catch (error: any) {
      console.error('Withdrawal error:', error)
      
      let errorMessage = 'Failed to initiate withdrawal. Please try again.'
      if (error?.message?.includes('User rejected')) {
        errorMessage = formatBridgeError('TRANSACTION_REJECTED')
      } else if (error?.message?.includes('insufficient funds')) {
        errorMessage = formatBridgeError('INSUFFICIENT_BALANCE')
      }
      
      showToast({
        type: 'error',
        title: 'Withdrawal Failed',
        message: errorMessage,
        duration: 4000
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const isWrongNetwork = chainId !== CHAIN_IDS.STABLELEDGER_ANYTRUST
  const maxAmount = l3UsdcBalance?.formatted ? parseFloat(l3UsdcBalance.formatted) : 0

  return (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
              <ArrowDownward />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="600">
                L3 → L2 Bridge
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Withdraw to Arbitrum Sepolia
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Network Warning */}
        {isWrongNetwork && (
          <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
            <Typography variant="body2" fontWeight="600">
              Wrong Network
            </Typography>
            Please switch to StableLedger AnyTrust to make withdrawals
          </Alert>
        )}

        {/* Challenge Period Warning */}
        <Alert severity="info" sx={{ mb: 3 }} icon={<Schedule />}>
          <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
            7-Day Challenge Period
          </Typography>
          <Typography variant="body2">
            Withdrawals from L3 to L2 require a 7-day challenge period before funds can be claimed on L2. 
            This is a security feature of the Arbitrum protocol.
          </Typography>
        </Alert>

        {/* Balance Display */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                  <MonetizationOn />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    USDC
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available on L3
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight="700">
                  {l3UsdcBalance?.formatted ? 
                    parseFloat(l3UsdcBalance.formatted).toFixed(2) : 
                    '0.00'
                  } USDC
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
            Amount to Withdraw
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00 USDC"
            disabled={isWrongNetwork || isProcessing}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={() => setAmount(maxAmount.toString())}
                    disabled={isWrongNetwork || isProcessing || maxAmount === 0}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    MAX
                  </Button>
                </InputAdornment>
              ),
            }}
            helperText="Enter the amount you want to withdraw to L2"
            inputProps={{ min: 0, step: 'any' }}
          />
        </Box>

        {/* Recipient Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
            Recipient Address on L2 (optional)
          </Typography>
          <TextField
            fullWidth
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={address || 'Enter recipient address...'}
            disabled={isWrongNetwork || isProcessing}
            helperText="Leave empty to withdraw to your own address"
            InputProps={{
              sx: { fontFamily: 'monospace' }
            }}
          />
        </Box>

        {/* Withdrawal Process Timeline */}
        <Card sx={{ mb: 3, bgcolor: 'warning.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Security color="warning" fontSize="small" />
              <Typography variant="subtitle1" fontWeight="600" color="warning.main">
                Withdrawal Process
              </Typography>
            </Box>
            <Timeline sx={{ mt: 0, p: 0 }}>
              <TimelineItem>
                <TimelineOppositeContent sx={{ flex: 0, minWidth: 0, display: 'none' }} />
                <TimelineSeparator>
                  <TimelineDot color="success">
                    <PlayArrow fontSize="small" />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2" fontWeight="600">
                    Initiate Withdrawal
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submit withdrawal transaction on L3 (~2 seconds)
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent sx={{ flex: 0, minWidth: 0, display: 'none' }} />
                <TimelineSeparator>
                  <TimelineDot color="warning">
                    <HourglassEmpty fontSize="small" />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2" fontWeight="600">
                    Challenge Period
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Wait 7 days for challenge period to complete
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent sx={{ flex: 0, minWidth: 0, display: 'none' }} />
                <TimelineSeparator>
                  <TimelineDot color="info">
                    <CheckCircle fontSize="small" />
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2" fontWeight="600">
                    Claim on L2
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Execute final claim transaction on Arbitrum Sepolia
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>

        {/* Fee Information */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
              Fee Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    L3 Gas Fee (USDC):
                  </Typography>
                  <Chip label="~$0.01" size="small" variant="outlined" />
                </Box>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    L2 Claim Fee (ETH):
                  </Typography>
                  <Chip label="~$2-5" size="small" variant="outlined" />
                </Box>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Bridge Fee:
                  </Typography>
                  <Chip label="0.01%" size="small" variant="outlined" />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Box sx={{ width: '100%' }}>
          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            color="warning"
            loading={isProcessing}
            disabled={!isConnected || isWrongNetwork || !amount}
            onClick={handleWithdraw}
            startIcon={!isProcessing ? <ArrowDownward /> : undefined}
            sx={{ 
              py: 2, 
              fontSize: '1.1rem', 
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {!isConnected ? (
              'Connect Wallet'
            ) : isWrongNetwork ? (
              'Switch to StableLedger AnyTrust'
            ) : isProcessing ? (
              'Processing Withdrawal...'
            ) : (
              'Initiate Withdrawal to L2'
            )}
          </LoadingButton>
          
          {/* Status Information */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {isProcessing ? 
                'Processing withdrawal transaction...' : 
                'Review details and click to confirm withdrawal'
              }
            </Typography>
          </Box>
        </Box>
      </DialogActions>
    </>
  )
}