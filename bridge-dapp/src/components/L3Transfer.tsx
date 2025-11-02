'use client'

import { useState } from 'react'
import { useAccount, useChainId, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, isAddress } from 'viem'
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
  Grid,
  InputAdornment,
} from '@mui/material'
import {
  Close,
  SendOutlined,
  Warning,
  FlashOn,
  MonetizationOn,
  Speed,
  CheckCircle,
  Security,
  TrendingDown,
} from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { CHAIN_IDS } from '@/lib/config'
import { useToastContext } from './ToastProvider'

interface L3TransferProps {
  onClose: () => void
}

export default function L3Transfer({ onClose }: L3TransferProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { showToast } = useToastContext()
  
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Get USDC balance on L3 (native currency)
  const { data: l3Balance, refetch: refetchBalance } = useBalance({
    address,
    chainId: CHAIN_IDS.STABLELEDGER_ANYTRUST,
  })

  const { sendTransaction, data: hash, isPending: isSending } = useSendTransaction()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleTransfer = async () => {
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
        message: 'Please switch to StableLedger AnyTrust to send USDC',
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

    if (!recipient || !isAddress(recipient)) {
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

      // Send USDC as native currency on L3
      await sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      })

      showToast({
        type: 'success',
        title: 'Transfer Initiated',
        message: `Successfully sent ${amount} USDC to ${recipient}`,
        duration: 5000
      })

      // Reset form
      setAmount('')
      setRecipient('')
      
      // Refetch balance after a short delay
      setTimeout(() => {
        refetchBalance()
      }, 2000)
      
    } catch (error) {
      console.error('Transfer error:', error)
      showToast({
        type: 'error',
        title: 'Transfer Failed',
        message: 'Failed to send USDC. Please try again.',
        duration: 4000
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const isWrongNetwork = chainId !== CHAIN_IDS.STABLELEDGER_ANYTRUST
  const maxAmount = l3Balance?.formatted ? parseFloat(l3Balance.formatted) : 0
  const isValidRecipient = recipient && isAddress(recipient)

  return (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
              <SendOutlined />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="600">
                L3 USDC Transfer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send USDC with USDC gas payments
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
            Please switch to StableLedger AnyTrust to send USDC
          </Alert>
        )}

        {/* USDC Gas Feature Highlight */}
        <Alert severity="success" sx={{ mb: 3 }} icon={<FlashOn />}>
          <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
            USDC Gas Payments
          </Typography>
          <Typography variant="body2">
            On StableLedger AnyTrust, you pay transaction fees in USDC instead of ETH. 
            Gas costs are significantly lower and more predictable.
          </Typography>
        </Alert>

        {/* Balance Display */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                  <MonetizationOn />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    USDC Balance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available on L3
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight="700">
                  {l3Balance?.formatted ? 
                    parseFloat(l3Balance.formatted).toFixed(2) : 
                    '0.00'
                  } USDC
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gas fee: ~$0.01
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Recipient Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
            Recipient Address
          </Typography>
          <TextField
            fullWidth
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            disabled={isWrongNetwork || isProcessing}
            error={recipient !== '' && !isValidRecipient}
            helperText={
              recipient && !isValidRecipient 
                ? "Please enter a valid Ethereum address" 
                : "Enter a valid Ethereum address starting with 0x"
            }
            InputProps={{
              sx: { fontFamily: 'monospace' }
            }}
          />
        </Box>

        {/* Amount Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
            Amount to Send
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
                    onClick={() => setAmount((maxAmount - 0.01).toString())}
                    disabled={isWrongNetwork || isProcessing || maxAmount <= 0.01}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    MAX
                  </Button>
                </InputAdornment>
              ),
            }}
            helperText="Small amount reserved for gas fees (~$0.01)"
            inputProps={{ min: 0, step: 'any' }}
          />
        </Box>

        {/* Transaction Preview */}
        {amount && isValidRecipient && parseFloat(amount) > 0 && (
          <Card sx={{ mb: 3, bgcolor: 'success.50' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }} color="success.main">
                Transaction Preview
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Amount:</Typography>
                  <Typography variant="body2" fontWeight="600">{amount} USDC</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Gas Fee:</Typography>
                  <Typography variant="body2" fontWeight="600">~$0.01 USDC</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">To:</Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {recipient.slice(0, 6)}...{recipient.slice(-4)}
                  </Typography>
                </Box>
                <Box sx={{ borderTop: 1, borderColor: 'success.200', pt: 1, mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="600" color="success.main">Total Cost:</Typography>
                    <Typography variant="body2" fontWeight="700" color="success.main">
                      ~{(parseFloat(amount) + 0.01).toFixed(2)} USDC
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 3 }}>
              Why Use L3 for USDC Transfers?
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDown color="success" fontSize="small" />
                  <Typography variant="caption">60% cheaper gas</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Speed color="success" fontSize="small" />
                  <Typography variant="caption">~2 second finality</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonetizationOn color="success" fontSize="small" />
                  <Typography variant="caption">Pay gas in USDC</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security color="success" fontSize="small" />
                  <Typography variant="caption">Predictable fees</Typography>
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
            color="success"
            loading={isProcessing || isSending || isConfirming}
            disabled={!isConnected || isWrongNetwork || !amount || !isValidRecipient || parseFloat(amount) <= 0}
            onClick={handleTransfer}
            startIcon={!isProcessing && !isSending && !isConfirming ? <SendOutlined /> : undefined}
            sx={{ 
              py: 2, 
              fontSize: '1.1rem', 
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {isProcessing || isSending || isConfirming ? (
              isSending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Processing...'
            ) : !isConnected ? (
              'Connect Wallet'
            ) : isWrongNetwork ? (
              'Switch to StableLedger AnyTrust'
            ) : !isValidRecipient ? (
              'Enter Valid Recipient'
            ) : (
              `Send ${amount || '0'} USDC`
            )}
          </LoadingButton>
          
          {/* Status Information */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {isProcessing || isSending || isConfirming ? 
                'Processing transfer transaction...' : 
                'Review details and click to confirm transfer'
              }
            </Typography>
          </Box>
        </Box>
      </DialogActions>
    </>
  )
}