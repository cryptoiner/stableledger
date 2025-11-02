require('dotenv').config();
const {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  parseEther,
  getContract
} = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const {
  prepareChainConfig,
  createRollupPrepareDeploymentParamsConfig,
  createRollup
} = require('@arbitrum/orbit-sdk');

// Configuration - Using a different approach without custom gas token first
const MOCK_USDC_ADDRESS = null; // Will deploy as regular Rollup first
const ORBIT_CHAIN_ID = 123456789; // Unique chain ID for our Orbit chain
const ORBIT_CHAIN_NAME = 'StableLedger AnyTrust Chain';

// ERC20 ABI for checking USDC contract
const ERC20_ABI = [
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  }
];

async function deployOrbitChain() {
  try {
    console.log('🚀 Starting Arbitrum Orbit Chain Deployment on Arbitrum Sepolia');
    console.log('=============================================================');
    
    // Step 1: Setup accounts and clients
    console.log('\n📝 Step 1: Setting up accounts and clients...');
    
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('DEPLOYER_PRIVATE_KEY not found in .env file');
    }
    
    // Validate private key format
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      throw new Error(`Invalid private key format. Expected 64 hex characters with 0x prefix. Got length: ${privateKey.length}`);
    }
    
    const account = privateKeyToAccount(privateKey);
    console.log(`   Deployer Address: ${account.address}`);
    
    // Use Arbitrum Sepolia RPC from environment
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC;
    if (!rpcUrl) {
      throw new Error('ARBITRUM_SEPOLIA_RPC not found in .env file');
    }
    
    console.log(`   Using RPC: ${rpcUrl.substring(0, 50)}...`);
    
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpcUrl)
    });
    
    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(rpcUrl)
    });
    
    // Check deployer balance
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`   Deployer Balance: ${formatEther(balance)} ETH`);
    
    if (balance < parseEther('0.005')) {
      throw new Error('Insufficient ETH balance. Need at least 0.005 ETH for deployment on Arbitrum Sepolia.');
    }
    
    if (balance < parseEther('0.02')) {
      console.log('   ⚠️  Warning: Balance may be insufficient for full deployment (recommended: 0.02 ETH)');
      console.log('   🔄 Proceeding anyway - Arbitrum Sepolia is much cheaper...');
    } else {
      console.log('   ✅ Sufficient balance for Arbitrum Sepolia deployment');
    }
    
    // Step 2: Skip USDC verification for now - deploy as regular Rollup
    console.log('\n⏭️  Step 2: Skipping USDC verification - deploying as regular Rollup first...');
    
    // Step 3: Prepare Chain Configuration
    console.log('\n⚙️  Step 3: Preparing chain configuration...');
    
    const chainConfig = prepareChainConfig({
      chainId: ORBIT_CHAIN_ID,
      arbitrum: {
        InitialChainOwner: account.address,
        DataAvailabilityCommittee: false, // Start with regular Rollup
      },
    });
    
    console.log(`   Chain ID: ${ORBIT_CHAIN_ID}`);
    console.log(`   Chain Owner: ${account.address}`);
    console.log(`   Parent Chain: Arbitrum Sepolia (Chain ID: 421614)`);
    console.log(`   Data Availability Committee: Disabled (Regular Rollup)`);
    console.log(`   Gas Token: ETH (default)`);
    
    // Step 4: Prepare Deployment Parameters
    console.log('\n📋 Step 4: Preparing deployment parameters...');
    
    const deploymentParams = createRollupPrepareDeploymentParamsConfig(publicClient, {
      chainId: ORBIT_CHAIN_ID,
      owner: account.address,
      chainConfig: chainConfig
    });
    
    console.log('   ✅ Deployment parameters configured');
    
    // Step 5: Deploy the Orbit Chain
    console.log('\n🏗️  Step 5: Deploying Arbitrum Orbit Chain...');
    console.log('   This may take several minutes...');
    
    // For AnyTrust, we need to set up validators and batch posters
    const validators = [account.address]; // Using deployer as initial validator
    const batchPosters = [account.address]; // Using deployer as initial batch poster
    
    console.log(`   Validators: ${validators.join(', ')}`);
    console.log(`   Batch Posters: ${batchPosters.join(', ')}`);
    
    const createRollupResult = await createRollup({
      params: {
        config: deploymentParams,
        batchPosters: batchPosters,
        validators: validators,
        // nativeToken: undefined, // Use ETH as gas token for now
      },
      account: account,
      parentChainPublicClient: publicClient,
      parentChainWalletClient: walletClient
    });
    
    console.log('\n🎉 Orbit Chain Deployment Successful!');
    console.log('=====================================');
    console.log(`   Transaction Hash: ${createRollupResult.transactionHash}`);
    console.log(`   Rollup Address: ${createRollupResult.rollupAddress}`);
    console.log(`   Inbox Address: ${createRollupResult.inboxAddress}`);
    console.log(`   Admin Proxy: ${createRollupResult.adminProxyAddress}`);
    console.log(`   Sequencer Inbox: ${createRollupResult.sequencerInboxAddress}`);
    console.log(`   Bridge: ${createRollupResult.bridgeAddress}`);
    
    // Save deployment info
    const deploymentInfo = {
      chainId: ORBIT_CHAIN_ID,
      chainName: ORBIT_CHAIN_NAME,
      parentChain: 'sepolia',
      gasToken: {
        address: MOCK_USDC_ADDRESS,
        symbol: 'MUSDC',
        decimals: 18
      },
      contracts: {
        rollup: createRollupResult.rollupAddress,
        inbox: createRollupResult.inboxAddress,
        adminProxy: createRollupResult.adminProxyAddress,
        sequencerInbox: createRollupResult.sequencerInboxAddress,
        bridge: createRollupResult.bridgeAddress,
      },
      deployment: {
        transactionHash: createRollupResult.transactionHash,
        deployer: account.address,
        timestamp: new Date().toISOString(),
        blockNumber: createRollupResult.blockNumber
      }
    };
    
    // Write deployment info to file
    require('fs').writeFileSync(
      'orbit-deployment.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log('\n📄 Deployment information saved to: orbit-deployment.json');
    
    return deploymentInfo;
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    // Log more details for debugging
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    
    throw error;
  }
}

// Export for use in other scripts
module.exports = { deployOrbitChain };

// Run if called directly
if (require.main === module) {
  deployOrbitChain()
    .then((deploymentInfo) => {
      console.log('\n✅ All done! Your Arbitrum Orbit chain is ready.');
      console.log(`\n🌐 Next steps:`);
      console.log(`   1. Configure node with chain ID: ${deploymentInfo.chainId}`);
      console.log(`   2. Deploy token bridge contracts`);
      console.log(`   3. Test transactions with ${deploymentInfo.gasToken.symbol} as gas`);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error.message);
      process.exit(1);
    });
}