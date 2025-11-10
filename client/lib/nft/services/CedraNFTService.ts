import { Cedra, CedraConfig, parseTypeTag } from "@cedra-labs/ts-sdk";
import { BaseNFTService } from "./BaseNFTService";
import type { NFTData, MintResult, NetworkType } from "../types";
import { getRoleName, NFTRole } from "../types";
import { CEDRA_CONFIG, CEDRA_NFT_CONFIG } from "../constants";
import type { CedraProvider } from "@/lib/wallet";
import { convertIpfsUrl } from "../utils/imageResolver";

export class CedraNFTService extends BaseNFTService {
  protected networkType: NetworkType = "cedra";
  private client: Cedra;

  constructor() {
    super();
    const config = new CedraConfig({
      network: CEDRA_CONFIG.network,
      fullnode: CEDRA_CONFIG.fullnode,
      indexer: CEDRA_CONFIG.indexer,
    });
    this.client = new Cedra(config);
  }

  private determineRole(tokenName: string, tokenDescription: string): NFTRole {
    const text = `${tokenName} ${tokenDescription}`.toLowerCase();
    if (text.includes("trader")) return NFTRole.TRADER;
    if (text.includes("liquidity") || text.includes("provider"))
      return NFTRole.LIQUIDITY_PROVIDER;
    if (text.includes("holder") || text.includes("builder"))
      return NFTRole.HOLDER;
    return NFTRole.HOLDER;
  }

  private extractTokenId(tokenName: string, fallbackIndex: number): string {
    const match = tokenName.match(/#(\d+)/);
    return match ? match[1] : `${fallbackIndex + 1}`;
  }

  async fetchUserNFTs(address: string): Promise<NFTData[]> {
    try {
      const ownedTokens = await this.client.getAccountOwnedTokens({
        accountAddress: address,
      });
      const nfts: NFTData[] = [];

      for (let i = 0; i < ownedTokens.length; i++) {
        const token = ownedTokens[i];
        const tokenName = token.current_token_data?.token_name || "";
        const tokenDescription = token.current_token_data?.description || "";
        const tokenUri = token.current_token_data?.token_uri || "";

        const role = this.determineRole(tokenName, tokenDescription);

        nfts.push({
          tokenId: this.extractTokenId(tokenName, i),
          role,
          roleName: getRoleName(role),
          name: tokenName,
          network: "cedra" as const,
          metadata: {
            description: tokenDescription,
            token_name: tokenName,
            token_data_id: token.token_data_id,
          },
          image: convertIpfsUrl(tokenUri) || "",
        });
      }

      return nfts;
    } catch (error) {
      console.error("[Cedra] Failed to fetch NFTs:", error);
      throw error;
    }
  }

  async mintNFT(role: NFTRole, provider: CedraProvider): Promise<MintResult> {
    try {
      const address = await this.getAccountAddress(provider);
      if (!address) {
        return { success: false, error: "Failed to get wallet address" };
      }

      const validation = await this.validateMintEligibility(address, role);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const txHash = provider.features["cedra:signAndSubmitTransaction"]
        ? await this.signAndSubmit(provider, role)
        : await this.signThenSubmit(provider, address, role);

      await this.client.waitForTransaction({ transactionHash: txHash });
      return { success: true, hash: txHash };
    } catch (error) {
      return this.handleError(error, "Mint NFT");
    }
  }

  private async signAndSubmit(
    provider: CedraProvider,
    role: NFTRole
  ): Promise<string> {
    const feature = provider.features["cedra:signAndSubmitTransaction"]!;

    const result = await feature.signAndSubmitTransaction({
      payload: {
        function: `${CEDRA_NFT_CONFIG.moduleAddress}::${CEDRA_NFT_CONFIG.moduleName}::${CEDRA_NFT_CONFIG.functions.mint}`,
        functionArguments: [role],
        typeArguments: [],
      },
      maxGasAmount: 5000,
    });

    if (result.status !== "Approved" || !("args" in result)) {
      throw new Error("Transaction signing was rejected");
    }

    return result.args.hash;
  }

  private async signThenSubmit(
    provider: CedraProvider,
    address: string,
    role: NFTRole
  ): Promise<string> {
    const transaction = await this.client.transaction.build.simple({
      sender: address,
      data: {
        function: `${CEDRA_NFT_CONFIG.moduleAddress}::${CEDRA_NFT_CONFIG.moduleName}::${CEDRA_NFT_CONFIG.functions.mint}`,
        functionArguments: [role],
      },
      options: {
        maxGasAmount: 5000,
        faAddress: parseTypeTag("0x1::CedraCoin::cedra"),
      },
    });

    const signResult = await provider.features[
      "cedra:signTransaction"
    ]!.signTransaction(transaction);

    if (signResult.status !== "Approved" || !("args" in signResult)) {
      throw new Error("Transaction signing was rejected");
    }

    const authenticator =
      (signResult.args as any).authenticator ?? signResult.args;

    const result = await this.client.transaction.submit.simple({
      transaction,
      senderAuthenticator: authenticator,
    });

    return result.hash;
  }

  private async getAccountAddress(
    provider: CedraProvider
  ): Promise<string | null> {
    try {
      const accountFeature = provider.features["cedra:account"];
      if (!accountFeature) {
        throw new Error("Wallet does not support cedra:account");
      }

      const accountInfo = await accountFeature.account();
      return accountInfo.address.toString();
    } catch (error) {
      console.error("[Cedra] Failed to get account address:", error);
      return null;
    }
  }
}
