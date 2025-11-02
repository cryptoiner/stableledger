import React, { useState } from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Avatar,
  Grid,
  Chip,
  Dialog,
  LinearProgress,
} from '@mui/material'
import {
  AccountBalance,
  Speed,
  Savings,
  SwapHoriz,
  Warning,
} from '@mui/icons-material'
import { useAccount, useChainId } from 'wagmi'
import { CHAIN_IDS } from '@/lib/config'

import L3Transfer from '@/components/L3Transfer'

const L3TransferPage = () => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [showL3Transfer, setShowL3Transfer] = useState(false)

  const isOnCorrectChain = chainId === CHAIN_IDS.STABLELEDGER_ANYTRUST

  const features = [
    {
      icon: <Savings />,
      title: 'USDC Gas Payments',
      description: 'Pay transaction fees directly with USDC tokens',
      value: '100% USDC',
      color: 'success',
    },
    {
      icon: <Speed />,
      title: 'Fast Execution',
      description: 'Near-instant transaction confirmation',
      value: '~2 seconds',
      color: 'primary',
    },
    {
      icon: <AccountBalance />,
      title: 'Lower Costs',
      description: 'Significantly reduced transaction fees',
      value: '60% cheaper',
      color: 'secondary',
    },
  ]

  const steps = [
    'Connect to StableLedger AnyTrust (L3)',
    'Enter recipient address and amount',
    'Confirm transaction with USDC gas',
    'Transaction confirmed in ~2 seconds',
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
          L3 USDC Transfers
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
          Send USDC on StableLedger AnyTrust with revolutionary USDC gas payments - 
          no ETH required for transaction fees.
        </Typography>
      </Box>

      {/* Network Warning */}
      {!isOnCorrectChain && (
        <Card sx={{ mb: 4, borderColor: 'warning.main', borderWidth: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Warning />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="600" color="warning.main">
                  Wrong Network
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please switch to StableLedger AnyTrust (L3) to use USDC transfers.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: `${feature.color}.main`, 
                    width: 64, 
                    height: 64, 
                    mx: 'auto', 
                    mb: 2 
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
                <Chip 
                  label={feature.value}
                  color={feature.color as any}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Action Card */}
      <Card sx={{ mb: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'success.main', 
                width: 80, 
                height: 80 
              }}
            >
              <SwapHoriz sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
                USDC Gas Transfers
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Send USDC on L3 using USDC for gas payments
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Gas Savings</Typography>
                  <Typography variant="body2" color="success.main" fontWeight="600">
                    60% cheaper
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Transaction Speed</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight="600">
                    ~2 seconds
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={90} 
                  color="primary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                How it works:
              </Typography>
              {steps.map((step, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {step}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<SwapHoriz />}
              onClick={() => setShowL3Transfer(true)}
              disabled={!isConnected || !isOnCorrectChain}
              sx={{ py: 2, px: 4, fontSize: '1.1rem' }}
            >
              {!isConnected 
                ? 'Connect Wallet First'
                : !isOnCorrectChain 
                ? 'Switch to L3 Chain'
                : 'Start USDC Transfer'
              }
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
            💡 Why USDC Gas?
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                Traditional blockchain networks require native tokens (like ETH) to pay for transaction fees. 
                This creates friction for users who only want to transact with stablecoins.
              </Typography>
              <Typography variant="body1" paragraph>
                StableLedger AnyTrust eliminates this friction by allowing users to pay gas fees 
                directly with USDC tokens, making DeFi more accessible and user-friendly.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: 'success.50', p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="600" color="success.main" sx={{ mb: 2 }}>
                  Benefits:
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="success.dark">
                    ✓ No need to hold ETH for gas
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="success.dark">
                    ✓ Simplified user experience
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="success.dark">
                    ✓ Lower total transaction costs
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="success.dark">
                    ✓ Predictable fee structure
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <Dialog 
        open={showL3Transfer} 
        onClose={() => setShowL3Transfer(false)}
        maxWidth="sm"
        fullWidth
      >
        <L3Transfer onClose={() => setShowL3Transfer(false)} />
      </Dialog>
    </Container>
  )
}

export default L3TransferPage