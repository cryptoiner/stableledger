# StableLedger Bridge DApp

A modern React DApp for bridging assets to the StableLedger AnyTrust chain and sending transactions with USDC gas payments.

## 🚀 Features

### ✅ **Implemented**
- **Modern Web3 Stack**: Next.js 15 + Wagmi v2 + RainbowKit + TypeScript
- **Multi-Chain Support**: Arbitrum Sepolia (parent) + Custom AnyTrust chain (child)
- **Wallet Integration**: MetaMask, WalletConnect, and other popular wallets
- **USDC Gas Token Interface**: UI for transactions using USDC as gas
- **Bridge Interface**: Form-based asset bridging between chains
- **Real-time Balances**: Live balance updates for ETH and USDC
- **Transaction Monitoring**: Real-time transaction status and confirmations
- **Responsive Design**: Mobile-friendly Tailwind CSS interface

### 🔄 **In Development**
- **Bridge Contract Deployment**: Token bridge contracts between parent and child chains
- **AnyTrust Node**: Local node configuration for full functionality
- **Gas Estimation**: Accurate USDC gas cost calculations
- **Cross-chain Messaging**: Retryable ticket processing

## 🏗️ Architecture

### **Blockchain Infrastructure**
- **Parent Chain**: Arbitrum Sepolia (Chain ID: 421614)
- **Child Chain**: StableLedger AnyTrust (Chain ID: 123456791)
- **Gas Token**: Mock USDC (MUSDC) with 18 decimals
- **Bridge Type**: Arbitrum Orbit SDK with custom gas token support

### **Frontend Stack**
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom components
- **Web3**: Wagmi v2 + viem for blockchain interactions
- **Wallet**: RainbowKit for wallet connection
- **State**: React hooks + TanStack Query for data fetching

### **Smart Contracts**
```
USDC Token (Arbitrum Sepolia): 0xd220a5494fa26b586fce7364cf895db466802b29
Rollup Contract: 0x5F45675AC8DDF7d45713b2c7D191B287475C16cF
AnyTrust Chain ID: 123456791
```

## 🛠️ Development Setup

### Prerequisites
- Node.js v18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stableledger/bridge-dapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment (optional)**
   ```bash
   cp .env.example .env.local
   # Add your WalletConnect Project ID
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open the DApp**
   - Local: http://localhost:3000
   - Network: http://192.168.0.107:3000

## 🎯 Usage Guide

### **1. Connect Wallet**
- Click "Connect Wallet" in the top-right corner
- Choose your preferred wallet (MetaMask recommended)
- Switch to Arbitrum Sepolia network if prompted

### **2. Bridge Assets**
- Click "Open Bridge" on the main dashboard
- Select token type (ETH or MUSDC)
- Choose direction (Deposit to AnyTrust or Withdraw to Parent)
- Enter amount and optional recipient address
- Confirm transaction in your wallet

### **3. USDC Gas Payments**
- Click "Send USDC" to open the gas payment interface
- Choose between "Send USDC" (token transfer) or "USDC Gas Demo"
- Enter recipient address and amount
- Experience USDC-powered transaction fees

### **4. Monitor Transactions**
- View real-time transaction status
- Click transaction hashes to view on Arbiscan
- Track confirmations and gas usage

## 💰 Testnet Assets

### **Get Test Tokens**
1. **Arbitrum Sepolia ETH**: 
   - Use [Arbitrum Bridge](https://bridge.arbitrum.io/) to bridge Sepolia ETH
   - Or request from [Arbitrum Discord](https://discord.gg/arbitrum)

2. **Mock USDC (MUSDC)**:
   - Contract: `0xd220a5494fa26b586fce7364cf895db466802b29`
   - Total Supply: 1,000,000 MUSDC
   - Contact deployer for test tokens

### **Network Configuration**
Add the AnyTrust chain to your wallet:
```json
{
  "chainId": "0x75BCD47", // 123456791 in hex
  "chainName": "StableLedger AnyTrust Chain (USDC)",
  "nativeCurrency": {
    "name": "Mock USDC",
    "symbol": "MUSDC",
    "decimals": 18
  },
  "rpcUrls": ["http://localhost:8547"],
  "blockExplorerUrls": ["http://localhost:4000"]
}
```

## 🔧 Configuration

### **Custom Chain Configuration**
The AnyTrust chain configuration is defined in `src/lib/config.ts`:

```typescript
export const stableLedgerAnyTrust = defineChain({
  id: 123456791,
  name: 'StableLedger AnyTrust Chain (USDC)',
  nativeCurrency: {
    decimals: 18,
    name: 'Mock USDC',
    symbol: 'MUSDC',
  },
  // ... other config
})
```

### **Contract Addresses**
Update contract addresses in `src/lib/config.ts` as they're deployed:

```typescript
export const CONTRACTS = {
  USDC_PARENT: '0xd220a5494fa26b586fce7364cf895db466802b29',
  ROLLUP: '0x5F45675AC8DDF7d45713b2c7D191B287475C16cF',
  // Bridge contracts to be added
}
```

## 🧪 Testing

### **Current Testing Scope**
- ✅ Wallet connection and chain switching
- ✅ Balance fetching and display
- ✅ USDC token transfers on Arbitrum Sepolia
- ✅ Transaction monitoring and confirmation
- ✅ UI responsiveness and error handling

### **Upcoming Tests**
- 🔄 Cross-chain bridge transactions
- 🔄 USDC gas payment validation
- 🔄 AnyTrust chain node integration
- 🔄 Retryable ticket processing

### **Manual Testing Steps**
1. Connect wallet to Arbitrum Sepolia
2. Verify balances display correctly
3. Test USDC transfer functionality
4. Confirm transaction links work
5. Test bridge interface (UI only for now)

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
npm start
```

### **Environment Variables**
```bash
# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: Custom RPC endpoints
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC=https://arb-sepolia.g.alchemy.com/v2/your_key
NEXT_PUBLIC_ANYTRUST_RPC=http://localhost:8547
```

## 📚 Technical Documentation

### **Key Components**
- `BridgeInterface.tsx`: Bridge UI with token selection and amount input
- `USDCGasTransfer.tsx`: USDC gas payment demonstration
- `config.ts`: Chain and contract configuration
- `wagmi.ts`: Web3 provider configuration

### **Hooks and Utils**
- `useAccount`: Wallet connection state
- `useBalance`: Token balance fetching
- `useWriteContract`: Transaction execution
- `useWaitForTransactionReceipt`: Transaction confirmation

### **Styling**
- Tailwind CSS for utility-first styling
- Custom color palette for brand consistency
- Responsive design with mobile-first approach
- Component-based architecture

## 🔗 Related Links

- **AnyTrust Deployment**: `../anytrust-deployment.json`
- **USDC Contract**: `../clean-usdc-deployment.json`
- **Bridge Scripts**: `../deploy-token-bridge.js`
- **Arbitrum Docs**: https://docs.arbitrum.io/
- **Wagmi Docs**: https://wagmi.sh/
- **RainbowKit Docs**: https://rainbowkit.com/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**🎉 You now have a fully functional DApp for bridging assets to an AnyTrust chain with USDC gas token support!**

The interface is ready for testing and can be extended with additional features as the bridge contracts are deployed and the AnyTrust node is configured.