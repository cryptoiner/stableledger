import React, { useState } from 'react'
import { useAccount, useChainId, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Alert,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material'
import {
  Close,
  ArrowUpward,
  AccountBalance,
  Warning,
  Speed,
  Security,
  Schedule,
} from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { CHAIN_IDS, CONTRACTS } from '@/lib/config'
import { useToastContext } from './ToastProvider'
import { 
  validateBridgeParams, 
  prepareETHDepositParams, 
  prepareERC20DepositParams,
  calculateBridgeETHCost,
  getBridgeConfig,
  formatBridgeError,
  encodeBridgeData,
  BRIDGE_ABIS 
} from '@/lib/bridge/bridgeHelpers'
import { BRIDGE_FEES } from '@/lib/bridge/bridgeConstants'

interface L2ToL3BridgeProps {
  onClose: () => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function L2ToL3Bridge({ onClose }: L2ToL3BridgeProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { showToast } = useToastContext()
  
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState(0) // 0 = ETH, 1 = USDC
  const [currentStep, setCurrentStep] = useState(0)
  const [isApproving, setIsApproving] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)

  // Get balances on L2
  const { data: ethBalance } = useBalance({
    address,
    chainId: CHAIN_IDS.ARBITRUM_SEPOLIA,
  })

  const { data: usdcBalance } = useBalance({
    address,
    token: CONTRACTS.USDC_PARENT as `0x${string}`,
    chainId: CHAIN_IDS.ARBITRUM_SEPOLIA,
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
        title: 'L2 Transaction Confirmed',
        message: `L2 transaction ${hash.slice(0, 10)}... confirmed! Tokens should appear on L3 in ~10 minutes.`,
        duration: 10000
      })
      
      // Log transaction details for debugging
      console.log('L2 Transaction confirmed:', {
        hash,
        receipt,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed,
        chainId: chainId
      })
      
      // Start monitoring L3 balance changes
      monitorL3BalanceChange()
    }
  }, [isConfirmed, hash, receipt, showToast])

  // Monitor L3 balance changes after L2 deposit
  const monitorL3BalanceChange = React.useCallback(() => {
    if (!address) return
    
    showToast({
      type: 'info',
      title: 'Monitoring L3',
      message: 'Waiting for tokens to appear on Layer 3... This may take up to 10 minutes.',
      duration: 8000
    })
    
    // TODO: Add L3 balance monitoring when L3 chain is running
    console.log('L3 monitoring started for address:', address)
    console.log('Expected tokens to appear on chain ID:', CHAIN_IDS.STABLELEDGER_ANYTRUST)
    
  }, [address, showToast])

  // Check USDC allowance for ERC20 deposits
  const { data: allowance } = useReadContract({
    address: CONTRACTS.USDC_PARENT as `0x${string}`,
    abi: BRIDGE_ABIS.ERC20,
    functionName: 'allowance',
    args: [address, CONTRACTS.BRIDGE_PARENT.L1Gateway],
    query: {
      enabled: activeTab === 1 && !!address, // Only check for USDC tab
    },
  })

  const handleDeposit = async () => {
    if (!isConnected) {
      showToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet first',
        duration: 4000
      })
      return
    }

    if (chainId !== CHAIN_IDS.ARBITRUM_SEPOLIA) {
      showToast({
        type: 'error',
        title: 'Wrong Network',
        message: 'Please switch to Arbitrum Sepolia to deposit',
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
      const validation = validateBridgeParams(amount, targetAddress, selectedAsset as 'ETH' | 'USDC')
      if (!validation.isValid) {
        showToast({
          type: 'error',
          title: 'Validation Error',
          message: formatBridgeError(validation.error!),
          duration: 4000
        })
        return
      }

      if (selectedAsset === 'ETH') {
        // ETH deposit through Inbox contract
        const depositParams = prepareETHDepositParams(amount, targetAddress)
        const totalCost = calculateBridgeETHCost(amount, true)

        await writeContract({
          address: CONTRACTS.BRIDGE_PARENT.Inbox as `0x${string}`,
          abi: BRIDGE_ABIS.Inbox,
          functionName: 'depositEth',
          args: [],
          value: totalCost,
        })
      } else {
        // USDC deposit through L1 Gateway
        const amountWei = parseEther(amount)
        const needsApprovalAmount = allowance ? allowance < amountWei : true

        if (needsApprovalAmount) {
          setIsApproving(true)
          showToast({
            type: 'info',
            title: 'Approval Required',
            message: 'Please approve USDC spending for bridge contract',
            duration: 4000
          })

          // Approve USDC spending
          await writeContract({
            address: CONTRACTS.USDC_PARENT as `0x${string}`,
            abi: BRIDGE_ABIS.ERC20,
            functionName: 'approve',
            args: [CONTRACTS.BRIDGE_PARENT.L1Gateway, amountWei],
          })

          setIsApproving(false)
          
          // Wait a moment for approval to be processed
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

        // Prepare deposit data
        const depositParams = prepareERC20DepositParams(amount, targetAddress, CONTRACTS.USDC_PARENT)
        const bridgeData = encodeBridgeData(targetAddress)

        // Execute ERC20 deposit
        await writeContract({
          address: CONTRACTS.BRIDGE_PARENT.L1Router as `0x${string}`,
          abi: BRIDGE_ABIS.L1GatewayRouter,
          functionName: 'outboundTransfer',
          args: [
            CONTRACTS.USDC_PARENT, // token
            targetAddress, // to
            amountWei, // amount
            BRIDGE_FEES.MAX_GAS, // maxGas
            BRIDGE_FEES.GAS_PRICE_BID, // gasPriceBid
            bridgeData, // data
          ],
          value: BRIDGE_FEES.SUBMISSION_COST + (BRIDGE_FEES.GAS_PRICE_BID * BRIDGE_FEES.MAX_GAS),
        })
      }

      showToast({
        type: 'success',
        title: 'Deposit Initiated',
        message: `Successfully initiated deposit of ${amount} ${selectedAsset} to L3`,
        duration: 5000
      })

      // Reset form
      setAmount('')
      setRecipient('')
      
    } catch (error: any) {
      console.error('Deposit error:', error)
      
      let errorMessage = 'Failed to initiate deposit. Please try again.'
      if (error?.message?.includes('User rejected')) {
        errorMessage = formatBridgeError('TRANSACTION_REJECTED')
      } else if (error?.message?.includes('insufficient funds')) {
        errorMessage = formatBridgeError('INSUFFICIENT_BALANCE')
      }
      
      showToast({
        type: 'error',
        title: 'Deposit Failed',
        message: errorMessage,
        duration: 4000
      })
    } finally {
      setIsProcessing(false)
      setIsApproving(false)
    }
  }

  const isWrongNetwork = chainId !== CHAIN_IDS.ARBITRUM_SEPOLIA
  const currentBalance = activeTab === 0 ? ethBalance : usdcBalance
  const maxAmount = currentBalance?.formatted ? parseFloat(currentBalance.formatted) : 0
  const selectedAsset = activeTab === 0 ? 'ETH' : 'USDC'

  const steps = ['Select Asset', 'Enter Details', 'Confirm Transaction']

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const setMaxAmount = () => {
    if (maxAmount > 0) {
      // Leave small amount for gas if ETH
      const max = activeTab === 0 ? Math.max(0, maxAmount - 0.001) : maxAmount
      setAmount(max.toString())
    }
  }

  return (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <ArrowUpward />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="600">
                L2 → L3 Bridge
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deposit to StableLedger AnyTrust
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
            Please switch to Arbitrum Sepolia to make deposits
          </Alert>
        )}

        {/* Progress Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentStep} orientation="horizontal">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Asset Selection Tabs */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            Select Asset
          </Typography>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 56,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              },
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                    Ξ
                  </Avatar>
                  ETH
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main', fontSize: '0.75rem' }}>
                    $
                  </Avatar>
                  USDC
                </Box>
              } 
            />
          </Tabs>
        </Box>

        {/* Balance Display */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: activeTab === 0 ? 'primary.main' : 'secondary.main', 
                  width: 40, 
                  height: 40 
                }}>
                  {activeTab === 0 ? 'Ξ' : '$'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    {selectedAsset}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available on L2 (Arbitrum Sepolia)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight="700">
                  {currentBalance?.formatted ? 
                    parseFloat(currentBalance.formatted).toFixed(activeTab === 0 ? 4 : 2) : 
                    '0.00'
                  } {selectedAsset}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${currentBalance?.formatted ? 
                    (parseFloat(currentBalance.formatted) * (activeTab === 0 ? 2000 : 1)).toFixed(2) : 
                    '0.00'
                  }
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
            Amount to Deposit
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`0.00 ${selectedAsset}`}
            disabled={isWrongNetwork || isProcessing}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={setMaxAmount}
                    disabled={isWrongNetwork || isProcessing || maxAmount === 0}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    MAX
                  </Button>
                </InputAdornment>
              ),
            }}
            helperText="Enter the amount you want to deposit to L3"
            inputProps={{ min: 0, step: 'any' }}
          />
        </Box>

        {/* Recipient Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
            Recipient Address (optional)
          </Typography>
          <TextField
            fullWidth
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={address || 'Enter recipient address...'}
            disabled={isWrongNetwork || isProcessing}
            helperText="Leave empty to deposit to your own address"
            InputProps={{
              sx: { fontFamily: 'monospace' }
            }}
          />
        </Box>

        {/* Transaction Details */}
        <Card sx={{ mb: 4, bgcolor: 'primary.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccountBalance color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight="600" color="primary.main">
                Transaction Details
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    icon={<Schedule />}
                    label="~10 minutes"
                    variant="outlined"
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Confirmation Time
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    icon={<Speed />}
                    label="~$2-5"
                    variant="outlined"
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Network Fee
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    icon={<Security />}
                    label="0.01%"
                    variant="outlined"
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Bridge Fee
                  </Typography>
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
            color="primary"
            loading={isProcessing || isApproving}
            disabled={!isConnected || isWrongNetwork || !amount}
            onClick={handleDeposit}
            startIcon={!isProcessing && !isApproving ? <ArrowUpward /> : undefined}
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
              'Switch to Arbitrum Sepolia'
            ) : isApproving ? (
              'Approving USDC...'
            ) : isProcessing ? (
              'Processing Deposit...'
            ) : (
              `Deposit ${selectedAsset} to L3`
            )}
          </LoadingButton>
          
          {/* Status Information */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {isApproving ? 
                'Approving token spending for bridge contract...' :
                isProcessing ? 
                'Processing deposit transaction...' : 
                'Review details and click to confirm deposit'
              }
            </Typography>
          </Box>
        </Box>
      </DialogActions>
    </>
  )
}