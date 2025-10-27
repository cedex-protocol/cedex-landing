import { Network } from "@cedra-labs/ts-sdk";
import { getEnvVar } from "@/lib/utils/env";

export const CEDRA_CONFIG = {
  network: Network.TESTNET,
  fullnode: getEnvVar('NEXT_PUBLIC_CEDRA_FULLNODE'),
  faucet: getEnvVar('NEXT_PUBLIC_CEDRA_FAUCET'),
} as const;

export const CEDRA_NFT_CONFIG = {
  moduleAddress: getEnvVar('NEXT_PUBLIC_CEDRA_NFT_MODULE_ADDRESS'),
  moduleName: getEnvVar('NEXT_PUBLIC_CEDRA_NFT_MODULE_NAME'),
  functions: {
    mint: "mint_with_role",
    getMintedDetails: "get_minted_details",
    isPaused: "is_paused",
    getUserNFTs: "get_user_nfts",
    getBalance: "get_balance",
    hasRole: "user_has_role",
  },
} as const;

export const CEDRA_NETWORK_INFO = {
  name: "Cedra Network",
  chainId: "cedra-testnet",
  explorer: getEnvVar('NEXT_PUBLIC_CEDRA_EXPLORER'),
  color: "#6C5CE7",
} as const;

export function getCedraExplorerNFTURL(address: string, tokenId: string): string {
  return `${CEDRA_NETWORK_INFO.explorer}/account/${CEDRA_NFT_CONFIG.moduleAddress}/modules/run/${CEDRA_NFT_CONFIG.moduleName}/get_token?token_id=${tokenId}&owner=${address}`;
}
