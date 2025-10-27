import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import type { WalletContextState } from "@aptos-labs/wallet-adapter-react";
import { BaseNFTService } from './BaseNFTService';
import type { NFTData, NFTRole, MintResult, NetworkType } from '../types';
import { getRoleName } from '../types';
import { APTOS_CONFIG, APTOS_NFT_CONFIG } from '../constants';

export class AptosNFTService extends BaseNFTService {
  protected networkType: NetworkType = 'aptos';
  private client: Aptos;

  constructor() {
    super();
    const config = new AptosConfig({
      network: APTOS_CONFIG.network,
      fullnode: APTOS_CONFIG.fullnode,
    });
    this.client = new Aptos(config);
  }

  async fetchUserNFTs(address: string): Promise<NFTData[]> {
    try {
      const ownedTokens = await this.client.getAccountOwnedTokens({
        accountAddress: address,
      });

      const filteredTokens = ownedTokens.filter(token => token.current_token_data);
      const nfts: NFTData[] = [];

      for (let i = 0; i < filteredTokens.length; i++) {
        const token = filteredTokens[i];
        const tokenData = token.current_token_data;
        if (!tokenData) continue;

        const description = tokenData?.description || tokenData?.token_properties?.description || '';
        const role = this.parseRoleFromText(description);
        const roleName = getRoleName(role);

        const tokenName = tokenData?.token_name || roleName || `NFT #${i + 1}`;
        let imageUri = tokenData?.token_uri || '';

        if (tokenData?.token_properties?.image) {
          imageUri = tokenData.token_properties.image;
        }

        // Check for cdn_asset_uris if available (not in all SDK versions)
        const tokenDataWithCdn = tokenData as typeof tokenData & {
          cdn_asset_uris?: { cdn_image_uri?: string }
        };
        if (!imageUri && tokenDataWithCdn.cdn_asset_uris?.cdn_image_uri) {
          imageUri = tokenDataWithCdn.cdn_asset_uris.cdn_image_uri;
        }

        const convertedUri = this.convertIpfsUrl(imageUri);
        if (convertedUri) {
          imageUri = convertedUri;
        }

        let tokenId = `${i + 1}`;
        if (tokenName) {
          const match = tokenName.match(/#(\d+)/);
          if (match) {
            tokenId = match[1];
          }
        }

        nfts.push({
          tokenId,
          role,
          roleName,
          name: roleName,
          network: 'aptos',
          metadata: {
            collection_id: tokenData?.collection_id,
            description: description,
            token_name: tokenName,
            token_uri: tokenData?.token_uri,
            token_properties: tokenData?.token_properties,
          },
          image: imageUri,
        });
      }

      return nfts;
    } catch (error) {
      console.error('[Aptos] Failed to fetch NFTs:', error);
      throw error;
    }
  }

  async mintNFTWithPontem(address: string, role: NFTRole): Promise<MintResult> {
    try {
      if (typeof window === 'undefined' || !window.pontem) {
        return { success: false, error: 'Pontem wallet not available' };
      }

      try {
        const accountResources = await this.client.getAccountResources({ accountAddress: address });
        const coinResource = accountResources.find(
          (r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
        );

        if (coinResource) {
          const balance = (coinResource.data as any).coin.value;
          if (BigInt(balance) < BigInt(1000)) {
            return {
              success: false,
              error: 'Insufficient APT balance for gas fees. Please add APT to your wallet.',
            };
          }
        }
      } catch (balanceError) {
        console.warn('[Aptos] Could not check balance:', balanceError);
      }

      const validation = await this.validateMintEligibility(address, role);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      const transaction = {
        function: `${APTOS_NFT_CONFIG.moduleAddress}::${APTOS_NFT_CONFIG.moduleName}::${APTOS_NFT_CONFIG.functions.mint}`,
        type_arguments: [] as string[],
        arguments: [role.toString()],
      };

      const provider = window.pontem;
      if (!provider || !provider.signAndSubmit) {
        throw new Error('Pontem provider signAndSubmit method not available');
      }

      const response = await provider.signAndSubmit(transaction);
      const txHash = typeof response === 'object' && 'hash' in response ? response.hash : String(response);

      if (!txHash) {
        console.error('[Aptos] Unexpected Pontem response structure:', response);
        throw new Error('Transaction response does not contain hash');
      }

      try {
        const executedTransaction = await this.client.waitForTransaction({
          transactionHash: txHash,
        });
        return { success: true, hash: executedTransaction.hash };
      } catch (waitError) {
        console.error('[Aptos] Error waiting for Pontem transaction:', waitError);
        console.warn('[Aptos] Returning hash despite wait error. Check explorer: https://explorer.aptoslabs.com/txn/' + txHash + '?network=testnet');
        return { success: true, hash: txHash };
      }
    } catch (error) {
      return this.handleError(error, 'Pontem Mint NFT');
    }
  }

  async mintNFT(walletAdapter: WalletContextState, role: NFTRole): Promise<MintResult> {
    try {
      if (!walletAdapter.connected || !walletAdapter.account) {
        return { success: false, error: 'Wallet not connected' };
      }

      const address = String(walletAdapter.account.address);

      const validation = await this.validateMintEligibility(address, role);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      const transaction = {
        data: {
          function: `${APTOS_NFT_CONFIG.moduleAddress}::${APTOS_NFT_CONFIG.moduleName}::${APTOS_NFT_CONFIG.functions.mint}` as `${string}::${string}::${string}`,
          functionArguments: [role.toString()],
        },
      };

      const response = await walletAdapter.signAndSubmitTransaction(transaction);
      const txHash = typeof response === 'object' && 'hash' in response ? response.hash : String(response);

      if (!txHash) {
        console.error('[Aptos] Unexpected response structure:', response);
        throw new Error('Transaction response does not contain hash');
      }

      try {
        const executedTransaction = await this.client.waitForTransaction({
          transactionHash: txHash,
        });
        return { success: true, hash: executedTransaction.hash };
      } catch (waitError) {
        console.error('[Aptos] Error waiting for transaction:', waitError);
        console.warn('[Aptos] Returning hash despite wait error. Check explorer: https://explorer.aptoslabs.com/txn/' + txHash + '?network=testnet');
        return { success: true, hash: txHash };
      }
    } catch (error) {
      return this.handleError(error, 'Mint NFT');
    }
  }
}
