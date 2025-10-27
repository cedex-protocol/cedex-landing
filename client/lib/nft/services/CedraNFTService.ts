import { Cedra, CedraConfig, parseTypeTag, AccountAuthenticator } from "@cedra-labs/ts-sdk";
import { BaseNFTService } from './BaseNFTService';
import type { NFTData, NFTRole, MintResult, NetworkType } from '../types';
import { getRoleName } from '../types';
import { CEDRA_CONFIG, CEDRA_NFT_CONFIG } from '../constants';
import type { CedraProvider } from "@/lib/wallet";
import type { CedraCurrentTokenData } from "../types/cedra";

export class CedraNFTService extends BaseNFTService {
  protected networkType: NetworkType = 'cedra';
  private client: Cedra;

  constructor() {
    super();
    const config = new CedraConfig({
      network: CEDRA_CONFIG.network,
      fullnode: CEDRA_CONFIG.fullnode,
    });
    this.client = new Cedra(config);
  }

  async fetchUserNFTs(address: string): Promise<NFTData[]> {
    try {
      const ownedTokens = await this.client.getAccountOwnedTokens({
        accountAddress: address,
      });

      return ownedTokens
        .filter(token => token.current_token_data)
        .map((token, index) => {
          const tokenData = token.current_token_data!;
          const role = this.extractRole(tokenData);
          const roleName = getRoleName(role);

          return {
            tokenId: `${index + 1}`,
            role,
            roleName,
            name: roleName,
            network: 'cedra',
            metadata: tokenData,
            image: this.convertIpfsUrl(tokenData.token_uri),
          };
        });
    } catch (error) {
      console.error('[Cedra] Failed to fetch NFTs:', error);
      throw error;
    }
  }

  async mintNFT(role: NFTRole, provider: CedraProvider): Promise<MintResult> {
    try {
      const address = await this.getAccountAddress(provider);

      const validation = await this.validateMintEligibility(address!, role);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const transaction = await this.client.transaction.build.simple({
        sender: address!,
        data: {
          function: `${CEDRA_NFT_CONFIG.moduleAddress}::${CEDRA_NFT_CONFIG.moduleName}::${CEDRA_NFT_CONFIG.functions.mint}`,
          typeArguments: [],
          functionArguments: [role],
        },
        options: {
          maxGasAmount: 5000,
          faAddress: parseTypeTag("0x1::CedraCoin::cedra"),
        },
      });

      const signResult = await provider.signTransaction!(transaction);
      const result = await this.client.transaction.submit.simple({
        transaction,
        senderAuthenticator: signResult.args as unknown as AccountAuthenticator,
      });

      await this.client.waitForTransaction({ transactionHash: result.hash });
      return { success: true, hash: result.hash };
    } catch (error) {
      return this.handleError(error, 'Mint NFT');
    }
  }

  private async getAccountAddress(provider: CedraProvider): Promise<string | null> {
    try {
      const account = await provider.getAccount();

      if (typeof account === 'string') {
        return account;
      }

      if (account && typeof account === 'object' && 'address' in account) {
        const addr = account.address;

        if (typeof addr === 'string') {
          return addr;
        }

        if (addr && typeof addr === 'object' && 'data' in addr) {
          const bytes = Array.from(addr.data as Uint8Array);
          return `0x${bytes.map(b => b.toString(16).padStart(2, '0')).join('')}`;
        }
      }

      return null;
    } catch (error) {
      console.error('[Cedra] Failed to get account address:', error);
      return null;
    }
  }

  private extractRole(tokenData: CedraCurrentTokenData): NFTRole {
    const properties = tokenData.token_properties || {};

    if (properties.role !== undefined) {
      return Number(properties.role) as NFTRole;
    }

    const description = tokenData.description || '';
    const tokenName = tokenData.token_name || '';
    return this.parseRoleFromText(`${description} ${tokenName}`);
  }
}
