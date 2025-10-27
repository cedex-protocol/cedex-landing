# Cedex Genesis NFT Landing Page

A production-ready, multi-chain Web3 landing page for NFT collection launches. Built with Next.js 15, TypeScript, and comprehensive blockchain integration supporting EVM, Aptos, and Cedra networks.

## 🎯 Overview

This project demonstrates a complete Web3 application architecture featuring:
- **Multi-chain wallet connection** (MetaMask, Petra, Pontem, Nightly)
- **Cross-chain NFT minting** (Ethereum, BSC, Arbitrum, Aptos, Cedra)
- **Role-based NFT system** (Trader, Liquidity Provider, Holder)
- **Enterprise-grade state management** with React Context + TanStack Query
- **Optimized performance** with client-side caching and batch queries

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
cedex-landing-page/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page composition
│   └── providers.tsx      # Wagmi + TanStack Query setup
│
├── components/            # React components (organized by feature)
│   ├── common/           # Reusable UI (Button, Modal, VideoBackground)
│   ├── header/           # Navigation & header
│   ├── landing/          # Landing sections (Hero, Features, etc.)
│   ├── network-selector/ # Network switching UI
│   └── wallet-sidebar/   # Wallet connection & NFT minting flows
│
├── contexts/              # Global state management
│   ├── WalletProvider.tsx    # Wallet connection logic
│   ├── NFTProvider.tsx       # NFT data & roles
│   └── UIProvider.tsx        # UI state (modals, sidebar)
│
├── lib/                   # Core libraries
│   ├── constants/        # Network configs, query settings
│   ├── nft/              # NFT service layer (multi-chain)
│   │   ├── services/    # EVMNFTService, AptosNFTService, CedraNFTService
│   │   ├── hooks/       # useNFTQuery, useNFTData
│   │   └── utils/       # Caching, image resolution
│   └── wallet/           # Wallet connection utilities
│       ├── hooks/       # EVM, Aptos, Cedra wallet hooks
│       └── utils/       # Network validation, wallet detection
│
├── public/               # Static assets
│   ├── icons/           # Network & wallet logos
│   └── images/          # Background images
│
└── styles/              # Global SCSS
    ├── _variables.scss  # Design tokens
    └── _mixins.scss     # Reusable mixins
```

## 🔧 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 15.1.6 |
| **Language** | TypeScript | 5 |
| **UI Library** | React | 19 |
| **Styling** | SCSS/Sass | 1.90 |
| **EVM Integration** | Wagmi + Viem | 2.16 + 2.37 |
| **Aptos Integration** | @aptos-labs/ts-sdk | 5.0.0 |
| **Cedra Integration** | @cedra-labs/ts-sdk | 2.2.5 |
| **Data Fetching** | TanStack Query | 5.87 |
| **Animation** | Framer Motion | 12.23 |

## 🌐 Supported Networks

### EVM Chains
- **Ethereum Sepolia**
- **BSC Testnet**
- **Arbitrum Sepolia**

### Move-Based Chains
- **Aptos Testnet**
- **Cedra Network**

## 💼 Wallet Support

| Wallet | Chains | Installation |
|--------|--------|--------------|
| **MetaMask** | EVM (Ethereum, BSC, Arbitrum) | [metamask.io](https://metamask.io) |
| **Petra** | Aptos | [petra.app](https://petra.app) |
| **Pontem** | Aptos, Cedra | [pontem.network](https://pontem.network) |
| **Nightly** | Cedra, Aptos | [nightly.app](https://nightly.app) |

## 🎨 Key Features

### 1. Multi-Chain Wallet Connection
```typescript
// Automatic wallet detection and connection
import { useWallet } from '@/contexts/WalletProvider';

const {
  walletAddress,
  isConnected,
  chainId,
  connectedWalletType, // 'evm' | 'aptos' | 'cedra'
  connectWallet,
  disconnectWallet
} = useWallet();
```

### 2. NFT Data Fetching
```typescript
// TanStack Query integration with caching
import { useNFTQuery } from '@/lib/nft/hooks/useNFTQuery';

const { userNFTs, userRoles, isLoading, refetch } = useNFTQuery();
// Auto-fetches from correct chain based on connected wallet
```

### 3. Cross-Chain NFT Services
```typescript
// Service layer abstraction
import { EVMNFTService } from '@/lib/nft/services';

const service = new EVMNFTService(wagmiConfig, chainId);
const nfts = await service.fetchUserNFTs(address);
const roles = await service.fetchUserRoles(address);
```

## 🔌 Architecture Patterns

### State Management
- **Context API** for global state (wallet, NFT, UI)
- **TanStack Query** for server state (NFT data, roles)
- **Local state** for component-level interactions

### Service Layer Pattern
```typescript
// Abstract base class with implementations per chain
BaseNFTService (abstract)
├── EVMNFTService    // Wagmi-based (Ethereum/BSC/Arbitrum)
├── AptosNFTService  // Aptos SDK-based
└── CedraNFTService  // Cedra SDK-based
```

### Component Organization
- **Common**: Reusable UI components (`Button`, `Modal`)
- **Landing**: Marketing sections (`HeroBanner`, `EntryChoices`)
- **Wallet**: Connection flows (`WalletSidebar`, `WalletSelectionList`)
- **NFT**: Minting workflows (`NFTPreviewScreen`, `NFTMintingState`)

## 📦 Adding New Features

### Add a New Blockchain Network

1. **Update network constants** (`lib/constants/networks.ts`):
```typescript
export const YOUR_CHAIN_ID = 12345;
export const EVM_CHAIN_IDS = [..., YOUR_CHAIN_ID] as const;
```

2. **Add chain config** (`lib/nft/constants/chains.ts`):
```typescript
export const YOUR_CHAIN_CONTRACT = {
  [YOUR_CHAIN_ID]: '0xYourContractAddress'
};
```

3. **Update Wagmi config** (`lib/wagmi.ts`):
```typescript
import { yourChain } from 'wagmi/chains';
export const config = createConfig({
  chains: [sepolia, bscTestnet, arbitrumSepolia, yourChain],
  // ...
});
```

### Add a New Wallet

1. **Add wallet ID** (`lib/wallet/constants/walletIds.ts`):
```typescript
export const YOUR_WALLET_ID = 'your-wallet';
```

2. **Implement connection hook** (`lib/wallet/hooks/useYourWallet.ts`):
```typescript
export function useYourWallet() {
  const connect = async () => { /* ... */ };
  const disconnect = () => { /* ... */ };
  return { address, isConnected, connect, disconnect };
}
```

3. **Integrate in WalletProvider** (`contexts/WalletProvider.tsx`)

### Add a New NFT Service

1. **Create service class** (`lib/nft/services/YourChainNFTService.ts`):
```typescript
export class YourChainNFTService extends BaseNFTService {
  async fetchUserNFTs(address: string): Promise<NFTData[]> {
    // Your implementation
  }

  async fetchUserRoles(address: string): Promise<UserNFTRoles> {
    // Your implementation
  }
}
```

2. **Add to factory** (`lib/nft/services/NFTServiceFactory.ts`)

## 🎯 Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js build config |
| `tsconfig.json` | TypeScript compiler options |
| `lib/constants/networks.ts` | Blockchain network definitions |
| `lib/constants/queryConfig.ts` | TanStack Query defaults |
| `lib/nft/constants/` | Chain-specific NFT configs |
| `styles/_variables.scss` | Design tokens (colors, spacing) |

## 🔒 Environment Variables

Create `.env.local` for custom configuration:

```bash
# Optional: Custom RPC endpoints
NEXT_PUBLIC_ETH_RPC_URL=https://your-ethereum-rpc
NEXT_PUBLIC_BSC_RPC_URL=https://your-bsc-rpc

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## 🚦 Data Flow

### Wallet Connection Flow
```
User clicks connect
→ WalletSidebar opens (UIProvider)
→ User selects wallet (WalletProvider.connectWallet)
→ Wallet-specific connection logic
→ State updates (address, chainId, walletType)
→ NFTProvider auto-fetches user NFTs
→ UI displays NFT data
```

### NFT Minting Flow
```
User initiates mint
→ UIProvider.setPendingMintRole
→ WalletSidebar shows NFT preview
→ User confirms
→ Service-specific mint transaction
→ Wait for confirmation
→ NFTProvider.refreshNFTDataWithRetry
→ Success screen with NFT details
```

## 🎨 Customization

### Styling
- Edit `styles/_variables.scss` for colors, spacing, breakpoints
- Modify component-specific `.module.scss` files
- All styles use design tokens from `_variables.scss`

### Content
- Landing sections in `components/landing/`
- Text content directly in component JSX
- Images in `public/images/`

### Branding
- Logo/icons in `public/icons/`
- Update favicon in `app/`
- Modify color scheme in `_variables.scss`

## 📊 Performance Features

- **Client-side NFT caching** (localStorage)
- **Batch RPC calls** (Wagmi multicall)
- **TanStack Query** stale-while-revalidate
- **Next.js Image optimization**
- **Code splitting** for landing sections

## 🧪 Development

```bash
# Type checking
npm run lint

# Build production bundle
npm run build

# Test production build locally
npm run start
```

## 📝 Code Style

- **TypeScript strict mode** enabled
- **ESLint** with Next.js core web vitals rules
- **Component structure**: Props interface → Component → Export
- **Naming**: PascalCase for components, camelCase for utilities
- **File organization**: Group by feature, not by type

## 🤝 Contributing

This is an open-source template. Feel free to:
- Fork and customize for your project
- Submit PRs for improvements
- Report issues or suggest features

## 📄 License

MIT License - feel free to use this project as a template for your own Web3 applications.

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Aptos SDK](https://aptos.dev/sdks/ts-sdk/)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Built with ❤️ for the Web3 community**
