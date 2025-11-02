require('dotenv').config();
const { createWalletClient, createPublicClient, http, parseEther, formatEther, parseUnits } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

// Simple ERC-20 ABI
const SIMPLE_ERC20_ABI = [
  {
    inputs: [],
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
  }
];

// Simplified ERC-20 bytecode (compiled with solc)
const SIMPLE_USDC_BYTECODE = '0x608060405234801561001057600080fd5b50601260ff16600a61002291906101b4565b633b9aca0061003191906101ff565b6002819055506002546003600061004661025a565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503361008d61025a565b73ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6002546040516100d49190610270565b60405180910390a361028b565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60008190508160005260206000209050919050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061015657607f821691505b602082108103610169576101686101f8565b5b50919050565b60008160011c9050919050565b6000808291508390505b60018511156101c6578086048111156101a2576101a16100e3565b5b60018516156101b15780820291505b80810290506101bf8561016f565b9450610186565b94509492505050565b6000826101df5760019050610254565b816101ed5760009050610254565b81600181146102035760028114610220576101ff565b6001915050610254565b60ff84111561022257610221610122565b5b8360020a91508482111561023957610238610122565b5b50610254565b5060208310610133831016604e8410600b8410161715610267578182048311156102645761026360e3565b5b80820291505b60008190508160005260206000209050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006102928261026c565b9050919050565b6102a281610287565b82525050565b60006020820190506102bd6000830184610299565b92915050565b6000819050919050565b6102d6816102c3565b82525050565b60006020820190506102f160008301846102cd565b92915050565b610a1280610300600039600f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce567146101425780636d7b5b7c1461016057806370a082311461017e57806395d89b41146101ae578063a9059cbb146101cc57610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd146101045780633cd32b8714610134575b600080fd5b6100a06101fc565b6040516100ad9190610665565b60405180910390f35b6100d060048036038101906100cb9190610720565b610235565b6040516100dd9190610776565b60405180910390f35b6100ee610327565b6040516100fb91906107a0565b60405180910390f35b61011e600480360381019061011991906107bb565b61032d565b60405161013591906107bb565b60405180910390f35b61013c6104b2565b60405161014991906107e6565b60405180910390f35b61014a6104b8565b6040516101579190610865565b60405180910390f35b6101686104c1565b6040516101759190610865565b60405180910390f35b61019860048036038101906101939190610880565b6104c7565b6040516101a591906107a0565b60405180910390f35b6101b661050f565b6040516101c39190610665565b60405180910390f35b6101e660048036038101906101e19190610720565b610548565b6040516101f391906107bb565b60405180910390f35b60606040518060400160405280600981526020017f4d6f636b20555344430000000000000000000000000000000000000000000000815250905090565b600081600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516103159190610776565b60405180910390a36001905092915050565b60025481565b6000600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482111561037b57600080fd5b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482111561040457600080fd5b81600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461045391906108dc565b9250508190555081600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546104a99190610910565b92508190555060019050949350505050565b60006103e881905090565b60006012905090565b61271081565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606040518060400160405280600581526020017f4d55534443000000000000000000000000000000000000000000000000000000815250905090565b6000600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482111561059657600080fd5b81600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546105e591906108dc565b9250508190555081600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461063b9190610910565b925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516106a491906107a0565b60405180910390a36001905092915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156106f05780820151818401526020810190506106d5565b60008484015250505050565b6000601f19601f8301169050919050565b6000610718826106b6565b61072281856106c1565b93506107328185602086016106d2565b61073b816106fc565b840191505092915050565b600060208201905081810360008301526107608184610716565b905092915050565b60008115159050919050565b61077d81610768565b82525050565b60006020820190506107986000830184610774565b92915050565b6000819050919050565b6107b18161079e565b82525050565b60006020820190506107cc60008301846107a8565b92915050565b600060ff82169050919050565b6107e8816107d2565b82525050565b600060208201905061080360008301846107df565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061083482610809565b9050919050565b61084481610829565b811461084f57600080fd5b50565b6000813590506108618161083b565b92915050565b6000602082840312156108775761087661074e565b5b600061088584828501610852565b91505092915050565b610897816107a0565b81146108a257600080fd5b50565b6000813590506108b48161088e565b92915050565b600080604083850312156108d1576108d0610774565b5b60006108df85828601610852565b92505060206108f0858286016108a5565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610934826107a0565b915061093f836107a0565b9250828203905081811115610957576109566108fa565b5b92915050565b6000610968826107a0565b9150610973836107a0565b925082820190508082111561098b5761098a6108fa565b5b9291505056fea26469706673582212204e6f6c747920596f75277265206c6f6f6b696e67206174206120626173696320546f6b656e20636f6e7472616374206d616b652077697468204c6f7665202132333435364636385368756666656c436f6465';

async function deploySimpleUSDC() {
  try {
    console.log('🚀 Deploying Simple Mock USDC on Arbitrum Sepolia...');
    
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

    // Deploy contract
    console.log('📤 Deploying Simple Mock USDC contract...');
    const hash = await walletClient.deployContract({
      abi: SIMPLE_ERC20_ABI,
      bytecode: SIMPLE_USDC_BYTECODE
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
      
      try {
        const [name, symbol, decimals, totalSupply, balanceOf, allowance] = await Promise.all([
          publicClient.readContract({
            address: receipt.contractAddress,
            abi: SIMPLE_ERC20_ABI,
            functionName: 'name'
          }),
          publicClient.readContract({
            address: receipt.contractAddress,
            abi: SIMPLE_ERC20_ABI,
            functionName: 'symbol'
          }),
          publicClient.readContract({
            address: receipt.contractAddress,
            abi: SIMPLE_ERC20_ABI,
            functionName: 'decimals'
          }),
          publicClient.readContract({
            address: receipt.contractAddress,
            abi: SIMPLE_ERC20_ABI,
            functionName: 'totalSupply'
          }),
          publicClient.readContract({
            address: receipt.contractAddress,
            abi: SIMPLE_ERC20_ABI,
            functionName: 'balanceOf',
            args: [account.address]
          }),
          publicClient.readContract({
            address: receipt.contractAddress,
            abi: SIMPLE_ERC20_ABI,
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
module.exports = { deploySimpleUSDC, SIMPLE_ERC20_ABI };

// Run if called directly
if (require.main === module) {
  deploySimpleUSDC()
    .then((result) => {
      console.log(`\n🎉 Mock USDC ready for Orbit deployment!`);
      console.log(`📍 Use this address: ${result.address}`);
      
      // Save to file for next step
      require('fs').writeFileSync('usdc-deployment.json', JSON.stringify(result, null, 2));
      console.log('📄 Contract info saved to: usdc-deployment.json');
    })
    .catch(console.error);
}