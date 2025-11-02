import React, { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  LinearProgress,
  Skeleton,
} from '@mui/material'
import {
  AccountBalance,
  TrendingUp,
  Speed,
  Security,
  SwapHoriz,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { formatEther } from 'viem'
import { CHAIN_IDS, CONTRACTS } from '@/lib/config'

const DashboardPage = () => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  // Get balances
  const { data: l2EthBalance, isLoading: l2EthLoading } = useBalance({
    address,
    chainId: CHAIN_IDS.ARBITRUM_SEPOLIA,
  })
  
  const { data: l2UsdcBalance, isLoading: l2UsdcLoading } = useBalance({
    address,
    token: CONTRACTS.USDC_PARENT as `0x${string}`,
    chainId: CHAIN_IDS.ARBITRUM_SEPOLIA,
  })

  const { data: l3UsdcBalance, isLoading: l3UsdcLoading } = useBalance({
    address,
    chainId: CHAIN_IDS.STABLELEDGER_ANYTRUST,
  })

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const isBalanceLoading = l2EthLoading || l2UsdcLoading || l3UsdcLoading

  const balanceCards = [
    {
      token: 'ETH',
      balance: l2EthBalance?.formatted || '0',
      usdValue: l2EthBalance?.formatted ? (parseFloat(l2EthBalance.formatted) * 2000).toFixed(2) : '0.00',
      chain: 'L2 • Arbitrum Sepolia',
      color: '#3b82f6',
      icon: 'ETH',
    },
    {
      token: 'USDC',
      balance: l2UsdcBalance?.formatted || '0',
      usdValue: l2UsdcBalance?.formatted || '0.00',
      chain: 'L2 • Arbitrum Sepolia',
      color: '#2563eb',
      icon: '$',
    },
    {
      token: 'USDC',
      balance: l3UsdcBalance?.formatted || '0',
      usdValue: l3UsdcBalance?.formatted || '0.00',
      chain: 'L3 • StableLedger AnyTrust',
      color: '#10b981',
      icon: '$',
    },
  ]

  const quickActions = [
    {
      title: 'Deposit to L3',
      description: 'Bridge assets from L2 to L3',
      icon: <ArrowUpward />,
      color: 'primary',
      path: '/bridge',
    },
    {
      title: 'Withdraw to L2',
      description: 'Bridge assets from L3 to L2',
      icon: <ArrowDownward />,
      color: 'secondary',
      path: '/bridge',
    },
    {
      title: 'L3 Transfer',
      description: 'Send USDC with gas on L3',
      icon: <SwapHoriz />,
      color: 'success',
      path: '/l3-transfer',
    },
  ]

  const features = [
    {
      icon: <Security />,
      title: 'Secure Bridging',
      description: 'AnyTrust technology ensures maximum security',
    },
    {
      icon: <Speed />,
      title: 'Fast Transactions',
      description: '~2 second confirmation times on L3',
    },
    {
      icon: <TrendingUp />,
      title: 'USDC Gas Payments',
      description: 'Pay transaction fees with USDC',
    },
    {
      icon: <AccountBalance />,
      title: 'Lower Costs',
      description: '~60% cheaper than traditional L2s',
    },
  ]

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip 
            label="Testnet Live" 
            color="success" 
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
          Bridge Assets to AnyTrust
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
          Seamlessly transfer your assets between L2 (Arbitrum Sepolia) and L3 (StableLedger AnyTrust) with minimal fees.
        </Typography>
      </Box>

      {/* Balance Cards */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Your Balances
        </Typography>
        <Grid container spacing={3}>
          {balanceCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              {isBalanceLoading ? (
                <Card>
                  <CardContent>
                    <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="50%" height={20} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: card.color, width: 56, height: 56 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {card.icon}
                        </Typography>
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
                          {card.token}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {card.chain}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
                      {parseFloat(card.balance).toFixed(4)} {card.token}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      ${card.usdValue}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                  }
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${action.color}.main`, 
                      width: 64, 
                      height: 64, 
                      mx: 'auto', 
                      mb: 2 
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Grid */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Why Choose StableLedger?
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ py: 4 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      width: 56, 
                      height: 56, 
                      mx: 'auto', 
                      mb: 2 
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Network Status */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            Network Status
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">L2 → L3 Bridge</Typography>
                <Typography variant="body2" color="text.secondary">75%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={75} sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">L3 → L2 Bridge</Typography>
                <Typography variant="body2" color="text.secondary">40%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={40} color="secondary" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Performance Metrics
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Avg. Confirmation Time</Typography>
                <Typography variant="body2" fontWeight="600">~2s</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Gas Savings</Typography>
                <Typography variant="body2" fontWeight="600" color="success.main">60%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Uptime</Typography>
                <Typography variant="body2" fontWeight="600" color="success.main">99.9%</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}

export default DashboardPage