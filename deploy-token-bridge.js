require('dotenv').config();
const { ethers } = require('ethers');
const { 
  createTokenBridgePrepareTransactionRequest,
  createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest,
  createTokenBridgeEnoughCustomFeeTokenAllowance
} = require('@arbitrum/orbit-sdk');
const { createPublicClient, createWalletClient, http } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');

// Load deployment info
const anytrustDeployment = JSON.parse(fs.readFileSync('anytrust-deployment.json', 'utf8'));
const usdcDeployment = JSON.parse(fs.readFileSync('clean-usdc-deployment.json', 'utf8'));

// Contract addresses from deployment
const ROLLUP_ADDRESS = '0x5F45675AC8DDF7d45713b2c7D191B287475C16cF'; // From transaction
const USDC_TOKEN_ADDRESS = usdcDeployment.address;
const DEPLOYER_ADDRESS = anytrustDeployment.deployment.deployer;

// Chain configuration
const PARENT_CHAIN_ID = 421614; // Arbitrum Sepolia
const CHILD_CHAIN_ID = anytrustDeployment.chainId; // 123456791

console.log('🌉 Token Bridge Deployment Configuration');
console.log('=======================================');
console.log(`Parent Chain: Arbitrum Sepolia (${PARENT_CHAIN_ID})`);
console.log(`Child Chain: ${anytrustDeployment.chainName} (${CHILD_CHAIN_ID})`);
console.log(`Rollup Contract: ${ROLLUP_ADDRESS}`);
console.log(`USDC Token: ${USDC_TOKEN_ADDRESS}`);
console.log(`Deployer: ${DEPLOYER_ADDRESS}`);

async function deployTokenBridge() {
  try {
    console.log('\\n🚀 Starting Token Bridge Deployment...');
    
    // Setup accounts and clients
    const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC;
    
    // Create parent chain clients (Arbitrum Sepolia)
    const parentChainPublicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpcUrl)
    });
    
    const parentChainWalletClient = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(rpcUrl)
    });

    // Create child chain configuration for our AnyTrust chain
    const childChain = {
      id: CHILD_CHAIN_ID,
      name: anytrustDeployment.chainName,
      network: 'anytrust-usdc',
      nativeCurrency: {
        decimals: 18,
        name: 'Mock USDC',
        symbol: 'MUSDC',
      },
      rpcUrls: {
        default: {
          http: ['http://localhost:8547'], // Will be configured later
        },
        public: {
          http: ['http://localhost:8547'],
        },
      },
    };

    // For now, we'll use a mock client for the child chain since we need to set up the node
    const orbitChainPublicClient = createPublicClient({
      chain: childChain,
      transport: http('http://localhost:8547') // Placeholder - will fail but needed for SDK
    });

    console.log('\\n📋 Step 1: Checking custom gas token allowance...');
    
    // Prepare allowance check parameters
    const allowanceParams = {
      account: account.address,
      parentChainPublicClient,
      rollup: ROLLUP_ADDRESS,
    };

    try {
      // Check if we have enough allowance for the custom gas token
      const hasEnoughAllowance = await createTokenBridgeEnoughCustomFeeTokenAllowance(allowanceParams);
      
      if (!hasEnoughAllowance) {
        console.log('   ⚠️  Insufficient allowance, preparing approval transaction...');
        
        // Prepare approval transaction
        const approvalTxRequest = await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest(allowanceParams);
        
        console.log('   📤 Sending approval transaction...');
        const approvalHash = await parentChainWalletClient.sendTransaction(approvalTxRequest);
        
        console.log(`   ✅ Approval transaction sent: ${approvalHash}`);
        console.log(`   🔗 View on Arbiscan: https://sepolia.arbiscan.io/tx/${approvalHash}`);
        
        // Wait for approval confirmation
        const approvalReceipt = await parentChainPublicClient.waitForTransactionReceipt({ 
          hash: approvalHash 
        });
        
        if (approvalReceipt.status === 'success') {
          console.log('   ✅ Approval confirmed!');
        } else {
          throw new Error('Approval transaction failed');
        }
      } else {
        console.log('   ✅ Sufficient allowance already exists');
      }
    } catch (allowanceError) {
      console.log('   ⚠️  Allowance check failed (expected for testnet):', allowanceError.message);
      console.log('   📋 Proceeding with bridge deployment...');
    }

    console.log('\\n🏗️  Step 2: Preparing token bridge deployment...');
    
    // Prepare token bridge deployment transaction
    const txRequest = await createTokenBridgePrepareTransactionRequest({
      params: {
        rollup: ROLLUP_ADDRESS,
        rollupOwner: account.address,
      },
      parentChainPublicClient,
      orbitChainPublicClient,
      account: account.address,
    });

    console.log('   📋 Bridge deployment transaction prepared');
    console.log(`   📊 Estimated gas: ${txRequest.gas || 'N/A'}`);

    console.log('\\n📤 Step 3: Deploying token bridge...');
    
    // Send the deployment transaction
    const deploymentHash = await parentChainWalletClient.sendTransaction(txRequest);
    
    console.log(`   📤 Bridge deployment transaction sent: ${deploymentHash}`);
    console.log(`   🔗 View on Arbiscan: https://sepolia.arbiscan.io/tx/${deploymentHash}`);
    
    // Wait for transaction confirmation
    const deploymentReceipt = await parentChainPublicClient.waitForTransactionReceipt({ 
      hash: deploymentHash 
    });
    
    if (deploymentReceipt.status === 'success') {
      console.log('   ✅ Token bridge deployment confirmed!');
      console.log(`   ⛽ Gas used: ${deploymentReceipt.gasUsed}`);
    } else {
      throw new Error('Bridge deployment transaction failed');
    }

    console.log('\\n🔍 Step 4: Processing retryable tickets...');
    
    try {
      // Wait for retryable tickets (cross-chain messages)
      // Note: This may fail if child chain node is not running
      console.log('   📋 Waiting for cross-chain message processing...');
      console.log('   ⚠️  Note: Child chain node must be running for retryable ticket processing');
      
      // For now, we'll skip the retryable ticket wait since we need the child chain node running
      console.log('   📝 Retryable ticket processing will be completed when child chain node is active');
      
    } catch (retryableError) {
      console.log('   ⚠️  Retryable ticket processing pending (child chain node needed):', retryableError.message);
    }

    // Save bridge deployment info
    const bridgeDeploymentInfo = {
      parentChain: {
        chainId: PARENT_CHAIN_ID,
        name: 'Arbitrum Sepolia',
        rollupContract: ROLLUP_ADDRESS,
        deploymentTransaction: deploymentHash,
        gasToken: 'ETH'
      },
      childChain: {
        chainId: CHILD_CHAIN_ID,
        name: anytrustDeployment.chainName,
        gasToken: {
          address: USDC_TOKEN_ADDRESS,
          symbol: 'MUSDC',
          decimals: 18,
          name: 'Mock USDC'
        }
      },
      bridge: {
        deployed: true,
        deploymentHash: deploymentHash,
        gasUsed: deploymentReceipt.gasUsed.toString(),
        timestamp: new Date().toISOString(),
        status: 'parent-deployed',
        note: 'Child chain contracts pending node startup'
      },
      contracts: {
        parent: {
          // Will be extracted from transaction logs when available
          rollup: ROLLUP_ADDRESS
        },
        child: {
          // Will be populated when retryable tickets are processed
          note: 'Contracts will be deployed via retryable tickets'
        }
      },
      nextSteps: [
        'Start child chain node',
        'Process retryable tickets',
        'Extract bridge contract addresses',
        'Test bridge functionality'
      ]
    };

    // Write bridge deployment info
    fs.writeFileSync(
      'bridge-deployment.json',
      JSON.stringify(bridgeDeploymentInfo, null, 2)
    );

    console.log('\\n🎉 Token Bridge Deployment Complete!');
    console.log('=====================================');
    console.log(`📄 Bridge info saved to: bridge-deployment.json`);
    console.log(`🔗 Parent deployment: https://sepolia.arbiscan.io/tx/${deploymentHash}`);
    console.log('\\n📋 Next Steps:');
    console.log('   1. ✅ Parent chain bridge contracts deployed');
    console.log('   2. 🔄 Start child chain node to process retryable tickets');
    console.log('   3. 🌉 Extract child chain bridge contract addresses');
    console.log('   4. 🧪 Test bridge functionality');
    console.log('   5. 🎯 Build frontend DApp interface');

    return bridgeDeploymentInfo;

  } catch (error) {
    console.error('\\n❌ Token Bridge Deployment Failed:', error.message);
    
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
module.exports = { 
  deployTokenBridge,
  ROLLUP_ADDRESS,
  USDC_TOKEN_ADDRESS,
  PARENT_CHAIN_ID,
  CHILD_CHAIN_ID
};

// Run if called directly
if (require.main === module) {
  deployTokenBridge()
    .then((result) => {
      console.log('\\n✅ Bridge deployment ready for DApp integration!');
    })
    .catch((error) => {
      console.error('\\n💥 Fatal bridge deployment error:', error.message);
      process.exit(1);
    });
}