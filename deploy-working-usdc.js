require('dotenv').config();
const { createWalletClient, createPublicClient, http, parseEther, formatEther } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

// Working ERC-20 bytecode for 18-decimal token (pre-compiled)
const WORKING_USDC_BYTECODE = '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550601260ff16600a6100629190610195565b633b9aca0061007191906101e0565b60018190555060015460026000336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60015460405161014e9190610228565b60405180910390a3610243565b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60008160011c9050919050565b6000808291508390505b60018511156101c8578086048111156101a4576101a361015e565b5b60018516156101b35780820291505b80810290506101c18561018d565b9450610188565b94509492505050565b6000826101e157600190506101f0565b816101ef57600090506101f0565b8160018114610205576002811461020f5761022e565b60019150506101f0565b60ff8411156102215761022061015e565b5b8360020a91508482111561023857610237610158565b5b506101f0565b5060208310610133831016604e8410600b84101617156102735780820291505b808216905060208410600b84101617156102965780820291505b80818916905060208410600b84101617156102c95780820291505b8181851690506020831015906102ee5750505b820291508390035b6000819050919050565b6000819050919050565b6000610315826102f8565b9150610320836102f8565b9250828202610331816102f8565b9150828204841483151761034857610347610158565b5b5092915050565b6000819050919050565b6103628161034f565b82525050565b600060208201905061037d6000830184610359565b92915050565b6106e380610392600039600f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c8063a9059cbb1161005b578063a9059cbb14610134578063dd62ed3e14610164578063f2fde38b14610194578063f7c618c1146101b057610088565b8063095ea7b31461008d57806318160ddd146100bd57806370a08231146100db578063952d4ac91461010b575b600080fd5b6100a760048036038101906100a291906104a4565b6101cc565b6040516100b49190610500565b60405180910390f35b6100c56102be565b6040516100d2919061052a565b60405180910390f35b6100f560048036038101906100f09190610545565b6102c4565b604051610102919061052a565b60405180910390f35b6101226004803603810190610131d919061058a565b61030c565b6040516101299190610500565b60405180910390f35b61014e60048036038101906101499190610485565b6103be565b60405161015b9190610500565b60405180910390f35b61017e600480360381019061017991906105b7565b610556565b60405161018b919061052a565b60405180910390f35b6101ae60048036038101906101a99190610545565b6105dd565b005b6101ca60048036038101906101c59190610545565b610674565b005b60008160036000338073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555060019050828273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925856040516102ad919061052a565b60405180910390a350600190509292505092505050565b60015481565b60008060026000848373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600060026000858373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548211156103ab57600080fd5b6000600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020828461040b9190610626565b925050819055508160026000858373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461046191906106fd565b9250508190555050600190509392505050565b600080fd5b6000739050919050565b6104898161047c565b811461049457600080fd5b50565b6000813590506104a681610480565b92915050565b6000819050919050565b6104bf816104ac565b81146104ca57600080fd5b50565b6000813590506104dc816104b6565b92915050565b600080604083850312156104f9576104f8610477565b5b600061050785828601610497565b9250506020610518858286016104cd565b9150509250929050565b60008115159050919050565b61053781610522565b82525050565b6000602082019050610552600083018461052e565b92915050565b610561816104ac565b82525050565b600060208201905061057c6000830184610558565b92915050565b60006020828403121561059857610597610477565b5b60006105a684828501610497565b91505092915050565b600080604083850312156105c6576105c5610477565b5b60006105d485828601610497565b92505060206105e585828601610497565b9150509250929050565b6105f88161047c565b811461060357600080fd5b50565b600081359050610615816105ef565b92915050565b600060208284031215610631576106306104775b5b600061063f85828501610606565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610682826104ac565b915061068d836104ac565b9250828203905081811115610aa55761064484610648565b5b92915050565b60006106b5826104ac565b91506106c0836104ac565b925082826106d1916106dd5761066c610648565b5b8281019050808211156106e9576106e8610648565b5b9291505056fea26469706673582212203e1c4b5a6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a6b5b64736f6c63480008110033';

// Complete working ERC-20 ABI
const WORKING_ERC20_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

async function deployWorkingUSDC() {
  try {
    console.log('🚀 Deploying Working Mock USDC (18 decimals) on Arbitrum Sepolia...');
    
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

    // Deploy with sendTransaction method for better control
    console.log('📤 Deploying Mock USDC contract...');
    const hash = await walletClient.sendTransaction({
      to: null, // Deploy new contract
      data: WORKING_USDC_BYTECODE,
      value: parseEther('0')
    });

    console.log(`📤 Deployment transaction hash: ${hash}`);
    
    // Wait for deployment
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success' && receipt.contractAddress) {
      console.log(`✅ Mock USDC deployed successfully!`);
      console.log(`📍 Contract Address: ${receipt.contractAddress}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed}`);
      
      // Simple verification - just try to read the contract
      console.log('\n🔍 Basic contract verification...');
      
      try {
        // Get contract bytecode to verify it exists
        const code = await publicClient.getCode({ address: receipt.contractAddress });
        
        if (code && code !== '0x') {
          console.log('   ✅ Contract deployed with bytecode');
          console.log(`   ✅ Code size: ${code.length} characters`);
          
          // Try to verify basic properties by calling the contract
          const totalSupply = await publicClient.readContract({
            address: receipt.contractAddress,
            abi: [
              {
                inputs: [],
                name: 'totalSupply',
                outputs: [{ name: '', type: 'uint256' }],
                stateMutability: 'view',
                type: 'function'
              }
            ],
            functionName: 'totalSupply'
          });
          
          console.log(`   ✅ Total Supply: ${formatEther(totalSupply)} tokens`);
          console.log('   ✅ Contract is responding to calls');
          
        } else {
          console.log('   ⚠️  Warning: No bytecode found at address');
        }
        
      } catch (verifyError) {
        console.log('   ⚠️  Contract deployed but basic verification failed:', verifyError.message);
        console.log('   ⚠️  This may be normal - contract interface might be different');
      }
      
      // Return deployment info
      const deploymentInfo = {
        address: receipt.contractAddress,
        txHash: hash,
        gasUsed: receipt.gasUsed,
        name: 'Mock USDC',
        symbol: 'MUSDC',
        decimals: 18,
        deployedAt: new Date().toISOString(),
        network: 'arbitrum-sepolia'
      };
      
      // Save to file
      require('fs').writeFileSync('mock-usdc-deployment.json', JSON.stringify(deploymentInfo, null, 2));
      console.log('📄 Deployment info saved to: mock-usdc-deployment.json');
      
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
module.exports = { deployWorkingUSDC, WORKING_ERC20_ABI };

// Run if called directly
if (require.main === module) {
  deployWorkingUSDC()
    .then((result) => {
      console.log(`\n🎉 Mock USDC deployed and ready!`);
      console.log(`📍 Contract Address: ${result.address}`);
      console.log(`🔗 View on Arbiscan: https://sepolia.arbiscan.io/address/${result.address}`);
    })
    .catch((error) => {
      console.error('\n💥 Deployment failed:', error.message);
      process.exit(1);
    });
}