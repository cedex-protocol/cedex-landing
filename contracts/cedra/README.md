# RoleBasedNFT - Cedra/Aptos Implementation

A role-based NFT collection on Cedra/Aptos with the same functionality as the EVM version.

## Features

- **3 Unique Roles**: Trader, Liquidity Provider, Holder
- **Max Supply**: 10,000 NFTs
- **Max Per Wallet**: 3 NFTs (one of each role)
- **Free Minting**: Only pay gas fees
- **Admin Controls**: Pauseable minting
- **On-chain Metadata**: Fully decentralized

## Project Structure

```
cedra/
├── Move.toml              # Project configuration
├── sources/
│   └── RoleBasedNFT.move  # Main contract module
├── scripts/
│   ├── deploy.sh          # Deploy to network
│   ├── mint.sh            # Mint NFTs
│   ├── interact.sh        # Check stats & roles
│   └── admin.sh           # Admin functions
└── tests/
    └── RoleBasedNFT_test.move  # Test suite
```

## Prerequisites

- Cedra CLI installed (`cedra` command available)
- Aptos CLI installed (optional, for cross-compatibility)
- Account with testnet/mainnet funds

## Setup

1. **Configure your account:**
```bash
# For testnet
cedra init --profile testnet

# For mainnet
cedra init --profile mainnet
```

2. **Get testnet funds:**
```bash
cedra account fund --profile testnet
```

## Deployment

Deploy the contract:
```bash
# Deploy to testnet
./scripts/deploy.sh testnet

# Deploy to mainnet
./scripts/deploy.sh mainnet
```

The collection is automatically initialized during deployment via `init_module`.

## Usage

### Minting NFTs

Mint NFTs with different roles:
```bash
# Mint TRADER role (role ID: 0)
./scripts/mint.sh 0 testnet

# Mint LIQUIDITY_PROVIDER role (role ID: 1)
./scripts/mint.sh 1 testnet

# Mint HOLDER role (role ID: 2)
./scripts/mint.sh 2 testnet
```

### Check Your NFTs

View your roles and collection stats:
```bash
./scripts/interact.sh testnet
```

This shows:
- Your owned roles
- NFT count (X/3)
- Collection statistics
- Contract status (active/paused)

### Admin Functions

Pause/unpause minting (admin only):
```bash
# Pause minting
./scripts/admin.sh pause testnet

# Resume minting
./scripts/admin.sh unpause testnet
```

## Testing

Run the test suite:
```bash
cedra move test
```

Tests cover:
- Role minting
- Duplicate prevention
- Wallet limits
- Supply limits
- Pause functionality
- Multi-user scenarios

## Contract Functions

### User Functions
- `mint_with_role(role: u8)` - Mint NFT with specified role
- `transfer_nft(from, token, to)` - Transfer NFT to another address

### View Functions
- `get_user_roles(address)` - Check which roles a user owns
- `get_user_nft_count(address)` - Get user's NFT count
- `get_minted_details()` - Get collection statistics
- `collection_exists()` - Check if collection is deployed
- `is_paused()` - Check if minting is paused
- `get_constants()` - Get max supply and max per wallet

### Admin Functions
- `pause()` - Pause minting
- `unpause()` - Resume minting

## Error Codes

- `ENOT_ADMIN (1)`: Caller is not admin
- `EMAX_SUPPLY_REACHED (2)`: Max supply of 10,000 reached
- `EMAX_PER_WALLET_REACHED (3)`: User already has 3 NFTs
- `EALREADY_HAS_ROLE (4)`: User already owns this role
- `EINVALID_ROLE (5)`: Invalid role ID (must be 0-2)
- `ECONTRACT_PAUSED (6)`: Minting is paused

## Gas Costs (Estimated)

- **Deployment**: ~0.1-0.2 APT
- **Minting**: ~0.01-0.02 APT per NFT
- **Transfer**: ~0.001 APT

## Comparison with EVM Version

| Feature | EVM | Cedra/Aptos |
|---------|-----|-------------|
| Max Supply | 10,000 | 10,000 |
| Max Per Wallet | 3 | 3 |
| Roles | 3 types | 3 types |
| Free Minting | ✅ | ✅ |
| Pauseable | ✅ | ✅ |
| Gas Cost | $5-50 | ~$0.50-1 |
| Speed | 12s | <1s |

## Security Features

- Role duplication prevention
- Wallet limit enforcement
- Supply cap enforcement
- Admin-only pause mechanism
- Input validation
- Reentrancy protection (built-in)

## Support

For issues or questions:
- Check test cases for usage examples
- Review error messages for troubleshooting
- Ensure sufficient balance for gas fees