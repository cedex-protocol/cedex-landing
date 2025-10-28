# Role-Based NFT Contract
## Contract Details

- **Name**: Genesis
- **Symbol**: GENESIS
- **Standard**: ERC721
- **Max Supply**: 10,000
- **Max Per Wallet**: 3 (one per role)

## Roles

1. **Trader** (Role ID: 0)
2. **Liquidity Provider** (Role ID: 1)
3. **Holder** (Role ID: 2)

## Installation

```bash
cd evm
npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Add your private key and RPC URLs
3. Add block explorer API keys for contract verification

## Compile

```bash
npm run compile
```

## Test

```bash
npm run test
```

## Deploy

Deploy to local Hardhat network:
```bash
npm run deploy:local
```

Deploy to mainnet chains:
```bash
npm run deploy:ethereum
npm run deploy:arbitrum
npm run deploy:bsc
npm run deploy:polygon
```

## Security

- Ownership controls for admin functions
- Pauseable mechanism for emergency stops
- Role duplication prevention
- Wallet limit enforcement
- Supply cap enforcement