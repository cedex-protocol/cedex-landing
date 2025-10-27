import { Network } from "@aptos-labs/ts-sdk";
import { getEnvVar } from "@/lib/utils/env";

export const APTOS_CONFIG = {
  network: Network.TESTNET,
  fullnode: getEnvVar('NEXT_PUBLIC_APTOS_FULLNODE'),
  faucet: getEnvVar('NEXT_PUBLIC_APTOS_FAUCET'),
} as const;

export const APTOS_NFT_CONFIG = {
  moduleAddress: getEnvVar('NEXT_PUBLIC_APTOS_NFT_MODULE_ADDRESS'),
  moduleName: getEnvVar('NEXT_PUBLIC_APTOS_NFT_MODULE_NAME'),
  functions: {
    mint: "mint_with_role",
    getMintedDetails: "get_minted_details",
    isPaused: "is_paused",
    getUserNFTs: "get_user_nfts",
    getBalance: "get_balance",
    hasRole: "user_has_role",
  },
} as const;

export const APTOS_NETWORK_INFO = {
  name: "Aptos Testnet",
  chainId: "aptos-testnet",
  explorer: getEnvVar('NEXT_PUBLIC_APTOS_EXPLORER'),
  color: "#00D1B2",
} as const;

export function getAptosExplorerNFTURL(address: string, tokenId: string): string {
  return `${APTOS_NETWORK_INFO.explorer}/account/${APTOS_NFT_CONFIG.moduleAddress}/modules/run/${APTOS_NFT_CONFIG.moduleName}/get_token?token_id=${tokenId}&owner=${address}`;
}
