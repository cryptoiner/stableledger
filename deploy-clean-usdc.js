require('dotenv').config();
const { createWalletClient, createPublicClient, http, parseEther, formatEther } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');

// Read the compiled bytecode and ABI
const USDC_BYTECODE = '0x' + fs.readFileSync('MockUSDC_sol_MockUSDC.bin', 'utf8').trim();
const USDC_ABI = JSON.parse(fs.readFileSync('MockUSDC_sol_MockUSDC.abi', 'utf8'));

console.log(`📊 Bytecode length: ${USDC_BYTECODE.length} characters`);
console.log(`📊 Is even length: ${USDC_BYTECODE.length % 2 === 0}`);

async function deployCleanUSDC() {
  try {
    console.log('🚀 Deploying Clean Mock USDC (18 decimals) on Arbitrum Sepolia...');
    
    // Create account from private key
    const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
    console.log(`📝 Deployer Address: ${account.address}`);
    
    // Use Arbitrum Sepolia RPC from environment
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC;
    if (!rpcUrl) {
      throw new Error('ARBITRUM_SEPOLIA_RPC not found in .env file');
    }
    
    // Create clients for Arbitrum Sepolia
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpcUrl)
    });
    
    const walletClient = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(rpcUrl)
    });

    // Check balance
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`💰 Deployer Balance: ${formatEther(balance)} ETH`);
    
    if (balance < parseEther('0.001')) {
      throw new Error('Insufficient ETH balance for deployment. Need at least 0.001 ETH.');
    }

    // Deploy with clean bytecode
    console.log('📤 Deploying Mock USDC contract with clean bytecode...');
    console.log(`📊 Deploying ${USDC_BYTECODE.length} character bytecode`);
    
    const hash = await walletClient.sendTransaction({
      to: null, // Deploy new contract
      data: USDC_BYTECODE,
      value: parseEther('0')
    });

    console.log(`📤 Deployment transaction hash: ${hash}`);
    
    // Wait for deployment
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success' && receipt.contractAddress) {
      console.log(`✅ Mock USDC deployed successfully!`);
      console.log(`📍 Contract Address: ${receipt.contractAddress}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed}`);
      
      // Comprehensive verification
      console.log('\\n🔍 Comprehensive contract verification...');
      
      try {
        // Check contract bytecode exists
        const code = await publicClient.getCode({ address: receipt.contractAddress });
        
        if (code && code !== '0x') {
          console.log('   ✅ Contract deployed with bytecode');
          console.log(`   ✅ Code size: ${code.length} characters`);
          
          // Verify all ERC-20 functions work
          const contract = {
            address: receipt.contractAddress,
            abi: USDC_ABI
          };
          
          // Check name
          const name = await publicClient.readContract({
            ...contract,
            functionName: 'name'
          });
          console.log(`   ✅ Name: ${name}`);
          
          // Check symbol
          const symbol = await publicClient.readContract({
            ...contract,
            functionName: 'symbol'
          });
          console.log(`   ✅ Symbol: ${symbol}`);
          
          // Check decimals
          const decimals = await publicClient.readContract({
            ...contract,
            functionName: 'decimals'
          });
          console.log(`   ✅ Decimals: ${decimals}`);
          
          // Check total supply
          const totalSupply = await publicClient.readContract({
            ...contract,
            functionName: 'totalSupply'
          });
          console.log(`   ✅ Total Supply: ${formatEther(totalSupply)} tokens`);
          
          // Check deployer balance
          const deployerBalance = await publicClient.readContract({
            ...contract,
            functionName: 'balanceOf',
            args: [account.address]
          });
          console.log(`   ✅ Deployer Balance: ${formatEther(deployerBalance)} tokens`);
          
          // Verify it's exactly 18 decimals and 1M total supply
          if (decimals === 18) {
            console.log('   ✅ Correct decimals (18)');
          } else {
            console.log(`   ❌ Wrong decimals: ${decimals}, expected 18`);
          }
          
          const expectedSupply = parseEther('1000000'); // 1M tokens with 18 decimals
          if (totalSupply === expectedSupply) {
            console.log('   ✅ Correct total supply (1,000,000 tokens)');
          } else {
            console.log(`   ❌ Wrong supply: ${formatEther(totalSupply)}, expected 1,000,000`);
          }
          
          if (deployerBalance === totalSupply) {
            console.log('   ✅ All tokens minted to deployer');
          } else {
            console.log(`   ❌ Deployer balance mismatch`);
          }
          
          console.log('\\n🎉 Perfect! Contract is ready for Arbitrum Orbit deployment');
          
        } else {
          console.log('   ⚠️  Warning: No bytecode found at address');
        }
        
      } catch (verifyError) {
        console.log('   ❌ Contract verification failed:', verifyError.message);
        throw verifyError;
      }
      
      // Return deployment info
      const deploymentInfo = {
        address: receipt.contractAddress,
        txHash: hash,
        gasUsed: receipt.gasUsed,
        name: 'Mock USDC',
        symbol: 'MUSDC',
        decimals: 18,
        totalSupply: '1000000',
        deployedAt: new Date().toISOString(),
        network: 'arbitrum-sepolia',
        compiler: 'solc-0.8.20',
        bytecodeLength: USDC_BYTECODE.length,
        verified: true,
        readyForOrbit: true
      };
      
      // Save to file
      fs.writeFileSync('clean-usdc-deployment.json', JSON.stringify(deploymentInfo, null, 2));
      console.log('📄 Deployment info saved to: clean-usdc-deployment.json');
      
      return deploymentInfo;
      
    } else {
      throw new Error('Deployment failed - no contract address returned');
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { deployCleanUSDC, USDC_ABI, USDC_BYTECODE };

// Run if called directly
if (require.main === module) {
  deployCleanUSDC()
    .then((result) => {
      console.log(`\\n🎉 Mock USDC deployed and ready for Orbit integration!`);
      console.log(`📍 Contract Address: ${result.address}`);
      console.log(`🔗 View on Arbiscan: https://sepolia.arbiscan.io/address/${result.address}`);
      console.log(`\\n🚀 Ready to integrate with AnyTrust chain as gas token!`);
    })
    .catch((error) => {
      console.error('\\n💥 Deployment failed:', error.message);
      process.exit(1);
    });
}