export type NetworkType = 'evm' | 'aptos' | 'cedra';

export interface NFTData {
  tokenId: string;
  role: NFTRole;
  roleName: string;
  name?: string;
  network: NetworkType;
  chainId?: number; // For EVM only
  metadata?: NFTMetadata;
  image?: string;
}

/**
 * NFT metadata structure (flexible for different networks)
 */
export interface NFTMetadata {
  collection_id?: string;
  description?: string;
  token_name?: string;
  token_uri?: string;
  token_properties?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UserNFTRoles {
  hasTrader: boolean;
  hasLiquidityProvider: boolean;
  hasHolder: boolean;
  count: number;
  nfts: NFTData[];
}

export enum NFTRole {
  TRADER = 0,
  LIQUIDITY_PROVIDER = 1,
  HOLDER = 2,
}

export interface MintResult {
  success: boolean;
  error?: string;
  hash?: string;
}

export interface NFTCacheEntry {
  nfts: NFTData[];
  roles: UserNFTRoles;
  timestamp: number;
}
