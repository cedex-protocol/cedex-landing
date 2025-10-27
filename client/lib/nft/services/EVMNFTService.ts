import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  switchChain,
  getChainId,
  multicall,
} from "wagmi/actions";
import { type Config } from "wagmi";
import { BaseNFTService } from './BaseNFTService';
import type { NFTData, MintResult, NetworkType, UserNFTRoles } from '../types';
import { getRoleName, NFTRole } from '../types';
import { getEVMContractAddress, isEVMChainSupported, DEFAULT_EVM_CHAIN_ID } from '../constants';
import contractABI from '../abi/GenesisNFT.json';
import { getCachedNFTs, setCachedNFTs, hasMaxNFTsInCache, clearNFTCache } from '../utils/nftCache';

const NFT_ABI = contractABI;

export class EVMNFTService extends BaseNFTService {
  protected networkType: NetworkType = 'evm';
  private pendingFetch: Promise<NFTData[]> | null = null;
  private lastFetchAddress: string | null = null;

  constructor(
    private config: Config,
    private chainId?: number
  ) {
    super();
    this.chainId = chainId || getChainId(config);
  }

  isChainSupported(): boolean {
    return isEVMChainSupported(this.chainId!);
  }

  getContractAddress(): string | undefined {
    return getEVMContractAddress(this.chainId!);
  }

  async switchToSupportedChain(): Promise<void> {
    if (!this.isChainSupported()) {
      await switchChain(this.config, { chainId: DEFAULT_EVM_CHAIN_ID });
      this.chainId = DEFAULT_EVM_CHAIN_ID;
    }
  }

  async fetchUserNFTs(address: string): Promise<NFTData[]> {
    const contractAddress = this.getContractAddress();
    if (!contractAddress) {
      throw new Error('Contract address not found for current chain');
    }

    if (this.pendingFetch && this.lastFetchAddress === address.toLowerCase()) {
      return this.pendingFetch;
    }

    try {
      const cachedNFTs = getCachedNFTs(address, this.chainId!);
      if (cachedNFTs !== null) {
        if (hasMaxNFTsInCache(address, this.chainId!)) {
          return cachedNFTs;
        }

        this.refreshNFTsInBackground(address, contractAddress, cachedNFTs);
        return cachedNFTs;
      }

      this.lastFetchAddress = address.toLowerCase();
      this.pendingFetch = this.performFetch(address, contractAddress);

      const result = await this.pendingFetch;
      this.pendingFetch = null;
      return result;
    } catch (error) {
      console.error('[EVM] Failed to fetch NFTs:', error);
      throw error;
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
      console.error('[EVM] Failed to fetch roles:', error);
      return {
        hasTrader: false,
        hasLiquidityProvider: false,
        hasHolder: false,
        count: 0,
        nfts: [],
      };
    }
  }

  private async performFetch(address: string, contractAddress: string): Promise<NFTData[]> {
    const balance = await readContract(this.config, {
      address: contractAddress as `0x${string}`,
      abi: NFT_ABI,
      functionName: 'balanceOf',
      args: [address],
    }) as bigint;

    const nftCount = Number(balance);
    if (nftCount === 0) {
      setCachedNFTs(address, this.chainId!, []);
      return [];
    }

    const nfts: NFTData[] = [];
    const BATCH_SIZE = 100;
    const MAX_SCAN = 1000;

    for (let startId = 0; startId < MAX_SCAN && nfts.length < nftCount; startId += BATCH_SIZE) {
      const endId = Math.min(startId + BATCH_SIZE, MAX_SCAN);
      const ownerOfCalls: any[] = [];
      for (let tokenId = startId; tokenId < endId; tokenId++) {
        ownerOfCalls.push({
          address: contractAddress as `0x${string}`,
          abi: NFT_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        });
      }

      try {
        const owners = await multicall(this.config, {
          contracts: ownerOfCalls as any,
          allowFailure: true,
        });

        const userTokenIds: number[] = [];
        for (let i = 0; i < owners.length; i++) {
          const result = owners[i];
          if (result.status === 'success' && result.result) {
            const owner = result.result as string;
            if (owner.toLowerCase() === address.toLowerCase()) {
              userTokenIds.push(startId + i);
            }
          }
        }

        if (userTokenIds.length > 0) {
          const roleCalls: any[] = userTokenIds.map(tokenId => ({
            address: contractAddress as `0x${string}`,
            abi: NFT_ABI,
            functionName: 'tokenRoles',
            args: [BigInt(tokenId)],
          }));

          const tokenURICalls: any[] = userTokenIds.map(tokenId => ({
            address: contractAddress as `0x${string}`,
            abi: NFT_ABI,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          }));

          const [roles, tokenURIs] = await Promise.all([
            multicall(this.config, { contracts: roleCalls as any, allowFailure: true }),
            multicall(this.config, { contracts: tokenURICalls as any, allowFailure: true }),
          ]);

          const metadataPromises = tokenURIs.map(async (uriResult, i) => {
            if (uriResult.status === 'success' && uriResult.result) {
              const uri = uriResult.result as string;
              try {
                const response = await fetch(uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'));
                if (response.ok) {
                  return await response.json();
                }
              } catch (error) {
                console.error(`[EVM] Failed to fetch metadata for token ${userTokenIds[i]}:`, error);
              }
            }
            return null;
          });

          const metadatas = await Promise.all(metadataPromises);

          for (let i = 0; i < userTokenIds.length; i++) {
            const roleResult = roles[i];
            if (roleResult.status === 'success' && roleResult.result !== undefined) {
              const role = Number(roleResult.result) as NFTRole;
              const metadata = metadatas[i];
              let imageUri = metadata?.image || '';

              if (imageUri && imageUri.startsWith('ipfs://')) {
                imageUri = imageUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
              }

              nfts.push({
                tokenId: userTokenIds[i].toString(),
                role,
                roleName: getRoleName(role),
                network: 'evm',
                chainId: this.chainId,
                metadata,
                image: imageUri || undefined,
              });
            }
          }
        }

        if (nfts.length >= nftCount) break;
      } catch (error) {
        console.error(`[EVM] Batch ${startId}-${endId} failed:`, error);
      }
    }

    setCachedNFTs(address, this.chainId!, nfts);
    return nfts;
  }

  private async refreshNFTsInBackground(
    address: string,
    contractAddress: string,
    cachedNFTs: NFTData[]
  ): Promise<void> {
    try {
      const balance = await readContract(this.config, {
        address: contractAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;

      const currentCount = Number(balance);

      if (currentCount === cachedNFTs.length) {
        return;
      }

      clearNFTCache(address, this.chainId!);
    } catch (error) {

    }
  }

  async mintNFT(role: NFTRole): Promise<MintResult> {
    const contractAddress = this.getContractAddress();
    if (!contractAddress) {
      return {
        success: false,
        error: 'Contract not available for this network',
      };
    }

    try {
      const account = await import('wagmi/actions').then(m => m.getAccount(this.config));
      if (!account.address) {
        return {
          success: false,
          error: 'Wallet not connected',
        };
      }

      const validation = await this.validateMintEligibility(account.address, role);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      const hash = await writeContract(this.config, {
        address: contractAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'mintWithRole',
        args: [BigInt(role)],
      });

      await waitForTransactionReceipt(this.config, { hash });

      clearNFTCache(account.address, this.chainId!);

      return {
        success: true,
        hash,
      };
    } catch (error) {
      return this.handleError(error, 'Mint NFT');
    }
  }
}
