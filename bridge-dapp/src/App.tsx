import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  SwapHoriz,
  AccountBalance,
  Info,
  DarkMode,
  LightMode,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

import DashboardPage from './pages/DashboardPage'
import BridgePage from './pages/BridgePage'
import L3TransferPage from './pages/L3TransferPage'
import NetworkPage from './pages/NetworkPage'
import ToastProvider from './components/ToastProvider'
import ChainSwitcher from './components/ChainSwitcher'

const drawerWidth = 280

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: <Dashboard /> },
  { path: '/bridge', label: 'Bridge', icon: <SwapHoriz /> },
  { path: '/l3-transfer', label: 'L3 Transfer', icon: <AccountBalance /> },
  { path: '/network', label: 'Network Info', icon: <Info /> },
]

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleThemeToggle = () => {
    setDarkMode(!darkMode)
    // You can implement theme switching logic here if needed
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <SwapHoriz />
          </Avatar>
          <Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              StableLedger
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AnyTrust Bridge
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      
      <Box sx={{ px: 2, py: 1 }}>
        <Chip 
          label="USDC Gas Token" 
          size="small" 
          color="success" 
          sx={{ fontSize: '0.75rem' }}
        />
      </Box>

      <List sx={{ px: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path)
                if (isMobile) setMobileOpen(false)
              }}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <ToastProvider>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {navigationItems.find(item => item.path === location.pathname)?.label || 'StableLedger Bridge'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ChainSwitcher />
              
              <IconButton color="inherit" onClick={handleThemeToggle}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Navigation Drawer */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          
          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: 8, // Account for AppBar height
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/bridge" element={<BridgePage />} />
            <Route path="/l3-transfer" element={<L3TransferPage />} />
            <Route path="/network" element={<NetworkPage />} />
          </Routes>
        </Box>
      </Box>
    </ToastProvider>
  )
}

export default App