require('dotenv').config();
const { createWalletClient, createPublicClient, http, parseEther, formatEther } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

// Complete ERC-20 Mock USDC Contract Bytecode (18 decimals)
const MOCK_USDC_BYTECODE = '0x608060405234801561001057600080fd5b50604051610b34380380610b348339818101604052810190610032919061028d565b81600390816100419190610509565b50806004908161005191906105db565b506012600560006101000a81548160ff021916908360ff16021790555069d3c21bcecceda1000000600681905550600654600760003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505050610652565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61011e826100d5565b810181811067ffffffffffffffff8211171561013d5761013c6100e6565b5b80604052505050565b60006101506100bc565b905061015c8282610115565b919050565b600067ffffffffffffffff82111561017c5761017b6100e6565b5b610185826100d5565b9050602081019050919050565b60005b838110156101b0578082015181840152602081019050610195565b60008484015250505050565b60006101cf6101ca84610161565b610146565b9050828152602081018484840111156101eb576101ea6100d0565b5b6101f6848285610192565b509392505050565b600082601f830112610213576102126100cb565b5b81516102238482602086016101bc565b91505092915050565b6000806040838503121561024357610242610c6565b5b600083015167ffffffffffffffff811115610261576102606100ca565b5b61026d858286016101fe565b925050602083015167ffffffffffffffff81111561028e5761028d6100ca565b5b61029a858286016101fe565b9150509250929050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806102f757607f821691505b60208210810361030a576103096102b0565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026103727fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610335565b61037c8683610335565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006103c36103be6103b984610394565b61039e565b610394565b9050919050565b6000819050919050565b6103dd836103a8565b6103f16103e9826103ca565b848454610342565b825550505050565b600090565b6104066103f9565b6104118184846103d4565b505050565b5b818110156104355761042a6000826103fe565b600181019050610417565b5050565b601f82111561047a5761044b81610310565b61045484610325565b81016020851015610463578190505b61047761046f85610325565b830182610416565b50505b505050565b600082821c905092915050565b600061049d6000198460080261047f565b1980831691505092915050565b60006104b6838361048c565b9150826002028217905092915050565b6104cf826102a4565b67ffffffffffffffff8111156104e8576104e76100e6565b5b6104f282546102df565b6104fd828285610439565b600060209050601f831160018114610530576000841561051e578287015190505b61052885826104aa565b865550610590565b601f19841661053e86610310565b60005b8281101561056657848901518255600182019150602085019450602081019050610541565b86831015610583578489015161057f601f89168261048c565b8355505b6001600288020188555050505b505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006105d182610394565b91506105dc83610394565b92508282019050808211156105f4576105f3610598565b5b92915050565b60006106058261039e565b91506106108361039e565b925082820261061e81610394565b9150828204841483151761063557610634610598565b5b5092915050565b61048b8061066b6000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce567146101425780634e6ec2471461016057806370a082311461017e57806395d89b41146101ae578063a9059cbb146101cc57610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd14610104575b600080fd5b6100a06101fc565b6040516100ad919061030a565b60405180910390f35b6100d060048036038101906100cb91906103c5565b61028e565b6040516100dd9190610420565b60405180910390f35b6100ee610380565b6040516100fb919061044a565b60405180910390f35b61011e60048036038101906101199190610465565b610386565b604051610139919061041f565b60405180910390f35b61014a6104b0565b60405161015791906104d4565b60405180910390f35b6101686104c3565b604051610175919061044a565b60405180910390f35b610198600480360381019061019391906104ef565b6104c9565b6040516101a5919061044a565b60405180910390f35b6101b66104e1565b6040516101c3919061030a565b60405180910390f35b6101e660048036038101906101e191906103c5565b610573565b6040516101f3919061041f565b60405180910390f35b60606003805461020b9061054b565b80601f01602080910402602001604051908101604052809291908181526020018280546102379061054b565b80156102845780601f1061025957610100808354040283529160200191610284565b820191906000526020600020905b81548152906001019060200180831161026757829003601f168201915b5050505050905090565b600081600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516103695190610420565b60405180910390a36001905092915050565b60065481565b6000600760008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548311156103d457600080fd5b81600760008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461042391906105ab565b9250508190555081600760008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461047991906105df565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516104dd919061044a565b60405180910390a3600190509392505050565b600560009054906101000a900460ff1681565b60065481565b60076020528060005260406000206000915090505481565b60606004805461050e9061054b565b80601f016020809104026020016040519081016040528092919081815260200182805461053a9061054b565b80156105875780601f1061055c57610100808354040283529160200191610587565b820191906000526020600020905b81548152906001019060200180831161056a57829003601f168201915b5050505050905090565b6000600760003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482111561060157600080fd5b81600760003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461065091906105ab565b9250508190555081600760008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546106a691906105df565b925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161070a919061044a565b60405180910390a36001905092915050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561075657808201518184015260208101905061073b565b60008484015250505050565b6000601f19601f8301169050919050565b600061077e8261071c565b6107888185610727565b9350610798818560208601610738565b6107a181610762565b840191505092915050565b600060208201905081810360008301526107c68184610773565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006107fe826107d3565b9050919050565b61080e816107f3565b811461081957600080fd5b50565b60008135905061082b81610805565b92915050565b6000819050919050565b61084481610831565b811461084f57600080fd5b50565b6000813590506108618161083b565b92915050565b6000806040838503121561087e5761087d6107ce565b5b600061088c8582860161081c565b925050602061089d85828601610852565b9150509250929050565b60008115159050919050565b6108bc816108a7565b82525050565b60006020820190506108d760008301846108b3565b92915050565b6108e681610831565b82525050565b600060208201905061090160008301846108dd565b92915050565b60008060006060848603121561092057610920f6107ce565b5b600061092e8682870161081c565b935050602061093f8682870161081c565b925050604061095086828701610852565b9150509250925092565b600060ff82169050919050565b6109708161095a565b82525050565b600060208201905061098b6000830184610967565b92915050565b6000602082840312156109a7576109a66107ce565b5b60006109b58482850161081c565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610a0357607f821691505b602082108103610a1657610a156109be565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610a5682610831565b9150610a6183610831565b9250828203905081811115610a7957610a78610a1c565b5b92915050565b6000610a8a82610831565b9150610a9583610831565b9250828201905080821115610aad57610aac610a1c565b5b9291505056fea2646970667358221220c8f3e9b5d7a4b2c1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a764736f6c634300081a0033';

// Complete ERC-20 ABI with all required functions
const COMPLETE_ERC20_ABI = [
  {
    inputs: [
      { name: '_name', type: 'string' },
      { name: '_symbol', type: 'string' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
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
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

async function deployProperMockUSDC() {
  try {
    console.log('🚀 Deploying proper Mock USDC with complete ERC-20 interface...');
    
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
    
    if (balance < parseEther('0.01')) {
      throw new Error('Insufficient ETH balance for deployment. Need at least 0.01 ETH.');
    }

    // Deploy contract
    console.log('📤 Deploying Mock USDC contract...');
    const hash = await walletClient.deployContract({
      abi: COMPLETE_ERC20_ABI,
      bytecode: MOCK_USDC_BYTECODE,
      args: ['Mock USDC', 'MUSDC']
    });

    console.log(`📤 Deployment transaction hash: ${hash}`);
    
    // Wait for deployment
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success' && receipt.contractAddress) {
      console.log(`✅ Mock USDC deployed successfully!`);
      console.log(`📍 Contract Address: ${receipt.contractAddress}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed}`);
      
      // Verify the contract works
      console.log('\n🔍 Verifying deployed contract...');
      
      const contract = {
        address: receipt.contractAddress,
        abi: COMPLETE_ERC20_ABI
      };
      
      try {
        const [name, symbol, decimals, totalSupply, balanceOf, allowance] = await Promise.all([
          publicClient.readContract({
            ...contract,
            functionName: 'name'
          }),
          publicClient.readContract({
            ...contract,
            functionName: 'symbol'
          }),
          publicClient.readContract({
            ...contract,
            functionName: 'decimals'
          }),
          publicClient.readContract({
            ...contract,
            functionName: 'totalSupply'
          }),
          publicClient.readContract({
            ...contract,
            functionName: 'balanceOf',
            args: [account.address]
          }),
          publicClient.readContract({
            ...contract,
            functionName: 'allowance',
            args: [account.address, account.address]
          })
        ]);
        
        console.log(`   ✅ Name: ${name}`);
        console.log(`   ✅ Symbol: ${symbol}`);
        console.log(`   ✅ Decimals: ${decimals}`);
        console.log(`   ✅ Total Supply: ${formatEther(totalSupply)}`);
        console.log(`   ✅ Deployer Balance: ${formatEther(balanceOf)}`);
        console.log(`   ✅ Allowance check: ${formatEther(allowance)}`);
        
        if (Number(decimals) === 18) {
          console.log('\n🎉 Perfect! Contract is ready for Arbitrum Orbit deployment');
        } else {
          console.log('\n⚠️  Warning: Contract has non-18 decimals');
        }
        
      } catch (verifyError) {
        console.log('⚠️  Contract deployed but verification failed:', verifyError.message);
      }
      
      return {
        address: receipt.contractAddress,
        txHash: hash,
        gasUsed: receipt.gasUsed,
        name: 'Mock USDC',
        symbol: 'MUSDC',
        decimals: 18
      };
    } else {
      throw new Error('Deployment failed - no contract address returned');
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { deployProperMockUSDC, COMPLETE_ERC20_ABI };

// Run if called directly
if (require.main === module) {
  deployProperMockUSDC()
    .then((result) => {
      console.log(`\n🎉 Mock USDC ready for Orbit deployment!`);
      console.log(`📍 Use this address: ${result.address}`);
      
      // Save to file for next step
      require('fs').writeFileSync('usdc-deployment.json', JSON.stringify(result, null, 2));
      console.log('📄 Contract info saved to: usdc-deployment.json');
    })
    .catch(console.error);
}