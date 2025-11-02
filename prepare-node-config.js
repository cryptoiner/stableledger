require('dotenv').config();
const { prepareNodeConfig } = require('@arbitrum/orbit-sdk');
const fs = require('fs');

// Load deployment information
const anytrustDeployment = JSON.parse(fs.readFileSync('anytrust-deployment.json', 'utf8'));
const usdcDeployment = JSON.parse(fs.readFileSync('clean-usdc-deployment.json', 'utf8'));

console.log('🔧 Preparing AnyTrust Node Configuration...');
console.log('===============================================');

async function prepareAnyTrustNodeConfig() {
  try {
    // Chain configuration based on our deployment
    const chainName = anytrustDeployment.chainName;
    const chainId = anytrustDeployment.chainId;
    const parentChainId = 421614; // Arbitrum Sepolia
    const parentChainRpcUrl = process.env.ARBITRUM_SEPOLIA_RPC;

    console.log(`📋 Chain: ${chainName} (ID: ${chainId})`);
    console.log(`📋 Parent: Arbitrum Sepolia (ID: ${parentChainId})`);
    console.log(`📋 RPC: ${parentChainRpcUrl}`);

    // Core contracts from deployment
    const coreContracts = {
      rollup: anytrustDeployment.contracts.rollup,
      inbox: anytrustDeployment.contracts.inbox,
      outbox: anytrustDeployment.contracts.outbox,
      adminProxy: anytrustDeployment.contracts.rollupAdmin,
      sequencerInbox: anytrustDeployment.contracts.sequencerInbox,
      bridge: anytrustDeployment.contracts.bridge,
      utils: anytrustDeployment.contracts.prover,
      upgradeExecutor: anytrustDeployment.contracts.upgradeExecutor,
    };

    console.log('📦 Core Contracts:');
    Object.entries(coreContracts).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });

    // Chain configuration for AnyTrust with USDC gas token
    const chainConfig = {
      chainId: chainId,
      homesteadBlock: 0,
      daoForkBlock: null,
      daoForkSupport: true,
      eip150Block: 0,
      eip150Hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      eip155Block: 0,
      eip158Block: 0,
      byzantiumBlock: 0,
      constantinopleBlock: 0,
      petersburgBlock: 0,
      istanbulBlock: 0,
      muirGlacierBlock: 0,
      berlinBlock: 0,
      londonBlock: 0,
      clique: {
        period: 0,
        epoch: 0
      },
      arbitrum: {
        EnableArbOS: true,
        AllowDebugPrecompiles: false,
        DataAvailabilityCommittee: true, // AnyTrust mode
        InitialArbOSVersion: 20,
        InitialChainOwner: anytrustDeployment.deployment.deployer,
        GenesisBlockNum: 0
      }
    };

    // Add gas token configuration if using custom token
    if (anytrustDeployment.gasToken.type === 'MUSDC') {
      chainConfig.arbitrum.CustomGasToken = usdcDeployment.address;
      console.log(`💰 Custom Gas Token: ${usdcDeployment.address} (MUSDC)`);
    }

    // Prepare the node configuration using Orbit SDK
    const nodeConfig = {
      "chain": {
        "info-json": JSON.stringify({
          "chain-id": chainId,
          "parent-chain-id": parentChainId,
          "parent-chain-is-arbitrum": true,
          "chain-name": chainName,
          "chain-config": chainConfig,
          "rollup": {
            "bridge": coreContracts.bridge,
            "inbox": coreContracts.inbox,
            "sequencer-inbox": coreContracts.sequencerInbox,
            "rollup": coreContracts.rollup,
            "validator-utils": coreContracts.utils,
            "validator-wallet-creator": coreContracts.prover,
            "deployed-at": parseInt(anytrustDeployment.deployment.blockNumber) || 0
          }
        }),
        "name": chainName
      },
      "parent-chain": {
        "connection": {
          "url": parentChainRpcUrl
        }
      },
      "http": {
        "addr": "0.0.0.0",
        "port": 8547,
        "vhosts": "*",
        "corsdomain": "*",
        "api": ["eth", "net", "web3", "arb", "debug"]
      },
      "ws": {
        "addr": "0.0.0.0", 
        "port": 8548,
        "origins": "*",
        "api": ["eth", "net", "web3", "arb", "debug"]
      },
      "node": {
        "sequencer": {
          "enable": true,
          "dangerous": {
            "no-coordinator": true
          },
          "max-tx-data-size": 85000
        },
        "staker": {
          "enable": true,
          "strategy": "MakeNodes",
          "staker-interval": "10s"
        },
        "caching": {
          "archive": false,
          "block-count": 128,
          "block-age": "30m",
          "trie-time-limit": "5m",
          "trie-dirty-cache-size": 1024,
          "trie-clean-cache-size": 600,
          "snapshot-cache-size": 400,
          "database-cache-size": 2048,
          "trie-clean-journal": "triecache",
          "trie-clean-rejournal": "1h"
        },
        "data-availability": {
          "enable": true, // AnyTrust specific
          "rest-aggregator": {
            "enable": true,
            "urls": ["http://localhost:9877"] // Local DAS for development
          }
        }
      },
      "execution": {
        "forwarding-target": "",
        "sequencer": {
          "enable": true,
          "max-acceptable-timestamp-delta": "1h"
        },
        "caching": {
          "state-scheme": "hash"
        }
      },
      "validation": {
        "wasm": {
          "allowed-wasm-module-roots": []
        }
      }
    };

    // Save the node configuration
    const nodeConfigPath = 'anytrust-node-config.json';
    fs.writeFileSync(nodeConfigPath, JSON.stringify(nodeConfig, null, 2));
    
    console.log(`\\n✅ Node configuration saved to: ${nodeConfigPath}`);
    
    // Also create a simplified chain info file
    const chainInfo = {
      chainId: chainId,
      chainName: chainName,
      parentChainId: parentChainId,
      parentChainRpcUrl: parentChainRpcUrl,
      coreContracts: coreContracts,
      gasToken: anytrustDeployment.gasToken,
      isAnyTrust: true,
      dataAvailabilityCommittee: anytrustDeployment.dataAvailabilityCommittee
    };

    fs.writeFileSync('anytrust-chain-info.json', JSON.stringify(chainInfo, null, 2));
    console.log(`✅ Chain info saved to: anytrust-chain-info.json`);

    // Create a startup script
    const startupScript = `#!/bin/bash

# StableLedger AnyTrust Chain Local Node Startup Script
echo "🚀 Starting StableLedger AnyTrust Chain Node..."
echo "Chain ID: ${chainId}"
echo "Gas Token: MUSDC"
echo "Port: 8547 (HTTP), 8548 (WebSocket)"

# Create data directory
mkdir -p ./anytrust-data

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "🐳 Starting Nitro node with Docker..."

# Run the Nitro node
docker run \\
  --rm \\
  --name stableledger-anytrust \\
  -v $(pwd)/anytrust-data:/home/user/.arbitrum \\
  -v $(pwd)/anytrust-node-config.json:/config.json \\
  -p 8547:8547 \\
  -p 8548:8548 \\
  offchainlabs/nitro-node:v3.2.1-d81324d \\
  --conf.file=/config.json \\
  --node.data-availability.enable \\
  --node.data-availability.rest-aggregator.enable \\
  --http.addr=0.0.0.0 \\
  --http.port=8547 \\
  --http.api=eth,net,web3,arb,debug \\
  --http.corsdomain=* \\
  --ws.addr=0.0.0.0 \\
  --ws.port=8548 \\
  --ws.api=eth,net,web3,arb,debug \\
  --ws.origins=* \\
  --node.sequencer.enable \\
  --node.feed.output.enable \\
  --node.feed.output.port=9642

echo "✅ Node started successfully!"
echo "🌐 RPC URL: http://localhost:8547"
echo "🔌 WebSocket URL: ws://localhost:8548"
echo "📊 Chain ID: ${chainId}"
echo "💰 Gas Token: MUSDC"
echo ""
echo "Add to MetaMask:"
echo "  Network Name: ${chainName}"
echo "  RPC URL: http://localhost:8547"
echo "  Chain ID: ${chainId}"
echo "  Currency Symbol: MUSDC"
`;

    fs.writeFileSync('start-anytrust-node.sh', startupScript);
    fs.chmodSync('start-anytrust-node.sh', '755');
    console.log(`✅ Startup script saved to: start-anytrust-node.sh`);

    console.log('\\n🎯 Next Steps:');
    console.log('1. Install Docker if not already installed');
    console.log('2. Run: ./start-anytrust-node.sh');
    console.log('3. Wait for node to sync');
    console.log('4. Add network to MetaMask');
    console.log('5. Test the DApp connection');

    return {
      nodeConfig,
      chainInfo,
      configPath: nodeConfigPath
    };

  } catch (error) {
    console.error('❌ Failed to prepare node configuration:', error.message);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { prepareAnyTrustNodeConfig };

// Run if called directly
if (require.main === module) {
  prepareAnyTrustNodeConfig()
    .then((result) => {
      console.log('\\n🎉 AnyTrust node configuration ready!');
      console.log('You can now start the local node to enable MetaMask connection.');
    })
    .catch((error) => {
      console.error('\\n💥 Configuration failed:', error.message);
      process.exit(1);
    });
}