#!/bin/bash

# StableLedger AnyTrust Chain Local Node Startup Script
echo "🚀 Starting StableLedger AnyTrust Chain Node..."
echo "Chain ID: 123456791"
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

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "Please start Docker Desktop or run 'sudo service docker start'"
    echo "On macOS: Start Docker Desktop application"
    echo "On Linux: sudo systemctl start docker"
    exit 1
fi

echo "🐳 Starting Nitro node with Docker..."

# Run the Nitro node with dev mode and CORS enabled
docker run \
  --rm \
  --name stableledger-anytrust \
  -v $(pwd)/anytrust-data:/home/user/.arbitrum \
  -p 8547:8547 \
  -p 8548:8548 \
  offchainlabs/nitro-node:v3.2.1-d81324d \
  --dev \
  --http.addr=0.0.0.0 \
  --http.port=8547 \
  --http.corsdomain="*" \
  --http.vhosts="*" \
  --http.api=eth,net,web3,debug,personal \
  --ws.addr=0.0.0.0 \
  --ws.port=8548 \
  --ws.origins="*"

echo "✅ Node started successfully!"
echo "🌐 RPC URL: http://localhost:8547"
echo "🔌 WebSocket URL: ws://localhost:8548"
echo "📊 Chain ID: 123456791"
echo "💰 Gas Token: MUSDC"
echo ""
echo "Add to MetaMask:"
echo "  Network Name: StableLedger AnyTrust Chain (USDC)"
echo "  RPC URL: http://localhost:8547"
echo "  Chain ID: 123456791"
echo "  Currency Symbol: MUSDC"
