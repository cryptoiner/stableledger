import React from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from '@mui/material'
import {
  Info,
  AccountTree,
  Security,
  Speed,
  MonetizationOn,
  OpenInNew,
} from '@mui/icons-material'
import { CHAIN_IDS, CONTRACTS } from '@/lib/config'

const NetworkPage = () => {
  const contractData = [
    {
      name: 'USDC Token (L2)',
      address: CONTRACTS.USDC_PARENT,
      type: 'ERC-20 Token',
      chain: 'Arbitrum Sepolia',
    },
    {
      name: 'Rollup Contract',
      address: CONTRACTS.ROLLUP,
      type: 'Core Contract',
      chain: 'Arbitrum Sepolia',
    },
    {
      name: 'Inbox Contract',
      address: '0x...', // Placeholder
      type: 'Bridge Contract',
      chain: 'Arbitrum Sepolia',
    },
    {
      name: 'Outbox Contract',
      address: '0x...', // Placeholder
      type: 'Bridge Contract',
      chain: 'Arbitrum Sepolia',
    },
  ]

  const networkSpecs = [
    {
      property: 'Chain ID',
      value: CHAIN_IDS.STABLELEDGER_ANYTRUST,
      description: 'Unique identifier for the AnyTrust chain',
    },
    {
      property: 'Consensus',
      value: 'AnyTrust',
      description: 'Data Availability Committee with fraud proofs',
    },
    {
      property: 'Gas Token',
      value: 'USDC',
      description: 'Transaction fees paid in USDC',
    },
    {
      property: 'Block Time',
      value: '~2 seconds',
      description: 'Average time between blocks',
    },
    {
      property: 'Finality',
      value: '~10 minutes',
      description: 'Time to L2 finality (L2→L3)',
    },
    {
      property: 'Challenge Period',
      value: '7 days',
      description: 'Withdrawal challenge period (L3→L2)',
    },
  ]

  const features = [
    {
      icon: <MonetizationOn />,
      title: 'USDC Gas Token',
      description: 'Pay transaction fees directly with USDC, eliminating the need for ETH',
      status: 'Active',
      color: 'success',
    },
    {
      icon: <Security />,
      title: 'Data Availability Committee',
      description: 'Trusted committee ensures data availability with fraud proof fallback',
      status: 'Active',
      color: 'success',
    },
    {
      icon: <Speed />,
      title: 'Fast Finality',
      description: 'Near-instant transactions with L2 security guarantees',
      status: 'Active',
      color: 'success',
    },
    {
      icon: <AccountTree />,
      title: 'Bridge Infrastructure',
      description: 'Seamless asset transfers between L2 and L3',
      status: 'In Development',
      color: 'warning',
    },
  ]

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getExplorerUrl = (address: string) => {
    return `https://sepolia.arbiscan.io/address/${address}`
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
          Network Information
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
          Detailed information about StableLedger AnyTrust, deployed contracts, 
          and network specifications.
        </Typography>
      </Box>

      {/* Status Banner */}
      <Card sx={{ mb: 4, borderColor: 'success.main', borderWidth: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
              <Info />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h5" fontWeight="600">
                  🔬 Testnet Environment
                </Typography>
                <Chip label="Live" color="success" size="small" />
              </Box>
              <Typography variant="body1" color="text.secondary">
                StableLedger AnyTrust is currently running on testnet. 
                All contracts and features are for testing purposes only.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Network Specifications */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Network Specifications
              </Typography>
              
              <Box sx={{ space: 2 }}>
                {networkSpecs.map((spec, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight="600">
                        {spec.property}
                      </Typography>
                      <Typography variant="body1" color="primary.main" fontWeight="600">
                        {spec.value}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {spec.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Features */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Key Features
              </Typography>
              
              {features.map((feature, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${feature.color}.main`, 
                        width: 40, 
                        height: 40,
                        mt: 0.5,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="600">
                          {feature.title}
                        </Typography>
                        <Chip 
                          label={feature.status}
                          color={feature.color as any}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deployed Contracts */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
              Deployed Contracts
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Contract Name</strong></TableCell>
                    <TableCell><strong>Address</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Chain</strong></TableCell>
                    <TableCell align="center"><strong>Explorer</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contractData.map((contract, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {contract.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {formatAddress(contract.address)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={contract.type}
                          size="small"
                          variant="outlined"
                          color={contract.type === 'ERC-20 Token' ? 'success' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {contract.chain}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Link
                          href={getExplorerUrl(contract.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <OpenInNew fontSize="small" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Additional Information */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
              Additional Resources
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                    <AccountTree />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                    Documentation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Learn more about AnyTrust technology and implementation details.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                    <Security />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                    Security Audits
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View security audit reports and verification details.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                    <Speed />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                    Performance Metrics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time network performance and transaction statistics.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default NetworkPage