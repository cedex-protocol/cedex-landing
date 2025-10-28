# CEDEX Genesis - Multi-Chain NFT Contracts

## What is this?

These are smart contracts for **CEDEX Genesis NFTs** - a multi-chain NFT collection designed to onboard new users to the CEDEX ecosystem. Users can mint role-based NFTs on their preferred blockchain, making it easy to reach users across different communities.

## Why Multi-Chain?

By deploying on multiple blockchains, we can:
- **Reach more users** - Users on Ethereum, Arbitrum, BSC, Polygon, Cedra, and Aptos can all participate
- **Lower barriers** - Users choose networks based on their preferences for gas costs and speed
- **Flexibility** - Deploy where your community is active

## What are the NFTs?

**Genesis Collection**: 10,000 NFTs total, 3 per wallet max (one of each role)

**Three Roles:**
1. **Trader** - For active traders
2. **Liquidity Provider** - For users providing liquidity
3. **Holder** - For long-term holders

**Free minting** - Users only pay network gas fees

## Supported Networks

### EVM Chains (Solidity)
- Ethereum, Arbitrum, BSC, Polygon
- High compatibility, large user base

### Move Chains (Move Language)
- **Cedra** - High-performance Move blockchain
- **Aptos** - Fast Layer 1 with low fees

---

## Quick Start

### For EVM Deployment (Ethereum, Arbitrum, BSC, Polygon)

```bash
# 1. Install
cd evm
npm install

# 2. Setup environment
.env.example .env
# Edit .env and add your PRIVATE_KEY

# 3. Test locally
npm run test

# 4. Deploy
npm run deploy:ethereum
# or: deploy:arbitrum, deploy:bsc, deploy:polygon
```

### For Cedra Deployment

```bash
# 1. Install Cedra CLI
https://github.com/cedra-labs/cedra-network/releases/tag/cedra-cli-v1.0.4

# 2. Setup account
cd cedra
https://docs.cedra.network/getting-started/faucet

# 3. Deploy
# 4. Mint NFT
```
---

## Key Features

- **Role-based minting** - Users choose their role
- **Multi-chain support** - Deploy on 6+ networks
- **Free minting** - Only gas fees
- **Admin controls** - Pause/unpause minting
- **Security** - Role limits, supply caps, pauseable