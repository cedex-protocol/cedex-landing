import type { NFTData, UserNFTRoles, MintResult, NetworkType } from '../types';
import { NFTRole, MAX_NFTS_PER_WALLET, getRoleName } from '../types';
import { parseNFTError, NFTErrorCode, createNFTError } from '../types';

export abstract class BaseNFTService {
  protected abstract networkType: NetworkType;

  abstract fetchUserNFTs(address: string): Promise<NFTData[]>;

  async userHasRole(address: string, role: NFTRole): Promise<boolean> {
    try {
      const nfts = await this.fetchUserNFTs(address);
      return nfts.some(nft => nft.role === role);
    } catch (error) {
      console.error(`[${this.networkType}] Failed to check role:`, error);
      return false;
    }
  }

  async fetchUserRoles(address: string): Promise<UserNFTRoles> {
    try {
      const nfts = await this.fetchUserNFTs(address);

      return {
        hasTrader: nfts.some(nft => nft.role === NFTRole.TRADER),
        hasLiquidityProvider: nfts.some(nft => nft.role === NFTRole.LIQUIDITY_PROVIDER),
        hasHolder: nfts.some(nft => nft.role === NFTRole.HOLDER),
        count: nfts.length,
        nfts,
      };
    } catch (error) {
      console.error(`[${this.networkType}] Failed to fetch roles:`, error);
      return {
        hasTrader: false,
        hasLiquidityProvider: false,
        hasHolder: false,
        count: 0,
        nfts: [],
      };
    }
  }

  protected async validateMintEligibility(
    address: string,
    role: NFTRole
  ): Promise<{ valid: boolean; error?: string }> {
    const nfts = await this.fetchUserNFTs(address);

    if (nfts.some(nft => nft.role === role)) {
      return {
        valid: false,
        error: `You already have ${getRoleName(role)} role!`,
      };
    }

    if (nfts.length >= MAX_NFTS_PER_WALLET) {
      return {
        valid: false,
        error: `Maximum ${MAX_NFTS_PER_WALLET} NFTs per wallet reached`,
      };
    }

    return { valid: true };
  }

  protected parseRoleFromText(text: string): NFTRole {
    const normalized = text.toLowerCase();

    if (normalized.includes('trader')) {
      return NFTRole.TRADER;
    }
    if (normalized.includes('liquidity') || normalized.includes('provider')) {
      return NFTRole.LIQUIDITY_PROVIDER;
    }
    if (normalized.includes('holder') || normalized.includes('builder')) {
      return NFTRole.HOLDER;
    }

    return NFTRole.TRADER;
  }

  protected convertIpfsUrl(uri?: string): string | undefined {
    if (!uri) return undefined;

    if (uri.startsWith('ipfs://')) {
      return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    return uri;
  }

  protected handleError(error: unknown, context: string): MintResult {
    console.error(`[${this.networkType}] ${context}:`, error);

    const nftError = parseNFTError(error, this.networkType);

    if (
      nftError.code !== NFTErrorCode.USER_REJECTED &&
      nftError.code !== NFTErrorCode.MAX_SUPPLY_REACHED
    ) {
      console.error(`[${this.networkType}] NFT Error:`, nftError);
    }

    return {
      success: false,
      error: nftError.message,
    };
  }
}
