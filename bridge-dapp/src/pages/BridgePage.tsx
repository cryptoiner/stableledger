import React, { useState } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Avatar,
  Chip,
  Dialog,
} from '@mui/material'
import {
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
  Schedule,
  Security,
} from '@mui/icons-material'
import { useAccount } from 'wagmi'

import L2ToL3Bridge from '@/components/L2ToL3Bridge'
import L3ToL2Bridge from '@/components/L3ToL2Bridge'

const BridgePage = () => {
  const { isConnected } = useAccount()
  const [showL2ToL3Bridge, setShowL2ToL3Bridge] = useState(false)
  const [showL3ToL2Bridge, setShowL3ToL2Bridge] = useState(false)

  const bridgeOptions = [
    {
      title: 'L2 → L3 Bridge',
      description: 'Deposit assets from Arbitrum Sepolia to StableLedger AnyTrust',
      icon: <ArrowUpward />,
      color: 'primary',
      timeEstimate: '~10 minutes',
      gasEstimate: 'Low',
      action: () => setShowL2ToL3Bridge(true),
      features: [
        'Fast confirmation',
        'Low gas fees',
        'Secure bridging',
      ],
    },
    {
      title: 'L3 → L2 Bridge',
      description: 'Withdraw assets from StableLedger AnyTrust to Arbitrum Sepolia',
      icon: <ArrowDownward />,
      color: 'secondary',
      timeEstimate: '~7 days',
      gasEstimate: 'Medium',
      action: () => setShowL3ToL2Bridge(true),
      features: [
        'Challenge period',
        'Maximum security',
        'Fraud proof protection',
      ],
    },
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
          Bridge Operations
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
          Transfer assets securely between L2 and L3 chains using our AnyTrust bridge infrastructure.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {bridgeOptions.map((option, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${option.color}.main`, 
                      width: 64, 
                      height: 64 
                    }}
                  >
                    {option.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip 
                      icon={<Schedule />}
                      label={option.timeEstimate}
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      label={`${option.gasEstimate} Gas`}
                      variant="outlined"
                      size="small"
                      color={option.gasEstimate === 'Low' ? 'success' : 'warning'}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Features:
                    </Typography>
                    {option.features.map((feature, featureIndex) => (
                      <Typography 
                        key={featureIndex}
                        variant="body2" 
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                      >
                        <Box 
                          sx={{ 
                            width: 6, 
                            height: 6, 
                            bgcolor: `${option.color}.main`, 
                            borderRadius: '50%' 
                          }} 
                        />
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  color={option.color as any}
                  fullWidth
                  size="large"
                  startIcon={option.icon}
                  onClick={option.action}
                  disabled={!isConnected}
                  sx={{ py: 2 }}
                >
                  {isConnected ? `Start ${option.title}` : 'Connect Wallet First'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Information Section */}
      <Box sx={{ mt: 6 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                <Security />
              </Avatar>
              <Typography variant="h5" fontWeight="600">
                Bridge Security & Information
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  How it Works
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Our bridge uses AnyTrust technology to provide secure, fast, and cost-effective 
                  transfers between Arbitrum Sepolia (L2) and StableLedger AnyTrust (L3).
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  L2 → L3 deposits are processed quickly with minimal fees, while L3 → L2 
                  withdrawals include a security challenge period for maximum protection.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  Important Notes
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="600" color="warning.main">
                    ⚠️ Testnet Environment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is a testnet deployment. Do not use mainnet assets.
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="600" color="info.main">
                    🔄 Bridge Contracts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bridge contracts are in development. Demo functionality is available.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Bridge Dialogs */}
      <Dialog 
        open={showL2ToL3Bridge} 
        onClose={() => setShowL2ToL3Bridge(false)}
        maxWidth="sm"
        fullWidth
      >
        <L2ToL3Bridge onClose={() => setShowL2ToL3Bridge(false)} />
      </Dialog>

      <Dialog 
        open={showL3ToL2Bridge} 
        onClose={() => setShowL3ToL2Bridge(false)}
        maxWidth="sm"
        fullWidth
      >
        <L3ToL2Bridge onClose={() => setShowL3ToL2Bridge(false)} />
      </Dialog>
    </Container>
  )
}

export default BridgePage