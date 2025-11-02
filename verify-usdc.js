require('dotenv').config();
const { createPublicClient, http, formatUnits } = require('viem');
const { sepolia } = require('viem/chains');

// Mock USDC contract address on Sepolia
const MOCK_USDC_ADDRESS = '0x2C032Aa43D119D7bf4Adc42583F1f94f3bf3023a';

// ERC-20 ABI for decimals and basic info
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
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

async function verifyMockUSDC() {
  try {
    // Create public client for Sepolia
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http('https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'),
    });

    console.log('🔍 Verifying Mock USDC contract on Sepolia...');
    console.log(`📍 Contract Address: ${MOCK_USDC_ADDRESS}`);

    // Get contract info
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      publicClient.readContract({
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'name',
      }),
      publicClient.readContract({
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      publicClient.readContract({
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
      publicClient.readContract({
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      }),
    ]);

    console.log('\n📊 Contract Information:');
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Total Supply: ${formatUnits(totalSupply, decimals)}`);

    // Check if it meets Arbitrum requirements
    if (decimals === 18) {
      console.log('\n✅ Contract has 18 decimals - Compatible with Arbitrum Orbit!');
      return { 
        address: MOCK_USDC_ADDRESS, 
        compatible: true, 
        name, 
        symbol, 
        decimals 
      };
    } else {
      console.log(`\n❌ Contract has ${decimals} decimals - NOT compatible (requires 18 decimals)`);
      return { 
        address: MOCK_USDC_ADDRESS, 
        compatible: false, 
        name, 
        symbol, 
        decimals 
      };
    }

  } catch (error) {
    console.error('❌ Error verifying contract:', error.message);
    console.log('\n🏗️  Contract may not exist. We may need to deploy a new mock USDC...');
    return { compatible: false, error: error.message };
  }
}

// Run verification
if (require.main === module) {
  verifyMockUSDC()
    .then((result) => {
      if (result.compatible) {
        console.log('\n🎉 Ready to use this contract for Arbitrum Orbit deployment!');
      } else {
        console.log('\n⚠️  Need to deploy a compatible mock USDC contract.');
      }
    })
    .catch(console.error);
}

module.exports = { verifyMockUSDC, MOCK_USDC_ADDRESS };