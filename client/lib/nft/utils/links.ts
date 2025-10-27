import type { NetworkType } from '../types';
import { CEDRA_NETWORK_INFO, APTOS_NETWORK_INFO } from '../constants';

export interface NFTLinkConfig {
  address: string;
  tokenId?: string;
  chainId?: number;
  networkType: NetworkType;
}

const OPENSEA_NETWORKS: Record<number, string> = {
  11155111: 'sepolia',
  97: 'bsc-testnet',
  421614: 'arbitrum-sepolia',
};

export function getNFTCollectionURL(config: NFTLinkConfig): string | undefined {
  const { networkType, chainId, address } = config;

  switch (networkType) {
    case 'evm':
      if (!chainId) return undefined;
      return getOpenSeaCollectionURL(chainId);

    case 'cedra':
      return `${CEDRA_NETWORK_INFO.explorer}/account/${address}?tab=Tokens`;

    case 'aptos':
      return `${APTOS_NETWORK_INFO.explorer}/account/${address}?network=testnet`;

    default:
      return undefined;
  }
}

export function getNFTAssetURL(config: NFTLinkConfig): string | undefined {
  const { networkType, chainId, address, tokenId } = config;

  if (!tokenId) return undefined;

  switch (networkType) {
    case 'evm':
      if (!chainId) return undefined;
      return getRaribleAssetURL(chainId, address, tokenId);

    case 'cedra':
      return `${CEDRA_NETWORK_INFO.explorer}/account/${address}?tab=Tokens`;

    case 'aptos':
      return `${APTOS_NETWORK_INFO.explorer}/account/${address}?network=testnet`;

    default:
      return undefined;
  }
}

export function getMarketplaceName(networkType: NetworkType): string {
  switch (networkType) {
    case 'evm':
      return 'Rarible';
    case 'cedra':
      return 'Cedrascan';
    case 'aptos':
      return 'Aptos Explorer';
    default:
      return 'Explorer';
  }
}

function getOpenSeaCollectionURL(chainId: number): string | undefined {
  const network = OPENSEA_NETWORKS[chainId];
  if (!network) return undefined;

  return `https://${network === 'sepolia' ? 'testnets.' : ''}opensea.io/collection/cedex-genesis-${network === 'sepolia' ? 'sepolia' : 'nft'}`;
}

function getRaribleAssetURL(chainId: number, contractAddress: string, tokenId: string): string | undefined {
  if (chainId !== 11155111 && chainId !== 97 && chainId !== 421614) {
    return undefined;
  }

  return `https://testnet.rarible.com/token/${contractAddress}:${tokenId}`;
}

export function getTransactionURL(hash: string, networkType: NetworkType, chainId?: number): string | undefined {
  switch (networkType) {
    case 'evm':
      if (!chainId) return undefined;
      return getEVMTransactionURL(hash, chainId);

    case 'cedra':
      return `${CEDRA_NETWORK_INFO.explorer}/txn/${hash}`;

    case 'aptos':
      return `${APTOS_NETWORK_INFO.explorer}/txn/${hash}?network=testnet`;

    default:
      return undefined;
  }
}

function getEVMTransactionURL(hash: string, chainId: number): string | undefined {
  switch (chainId) {
    case 11155111:
      return `https://sepolia.etherscan.io/tx/${hash}`;
    case 97:
      return `https://testnet.bscscan.com/tx/${hash}`;
    case 421614:
      return `https://sepolia.arbiscan.io/tx/${hash}`;
    default:
      return undefined;
  }
}
