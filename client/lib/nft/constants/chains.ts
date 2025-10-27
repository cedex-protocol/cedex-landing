import { sepolia, bscTestnet, arbitrumSepolia } from 'wagmi/chains';
import { getEnvVar } from '@/lib/utils/env';

export const EVM_CONTRACT_ADDRESSES = {
  [sepolia.id]: getEnvVar('NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS'),
  [bscTestnet.id]: getEnvVar('NEXT_PUBLIC_BSC_TESTNET_CONTRACT_ADDRESS'),
  [arbitrumSepolia.id]: getEnvVar('NEXT_PUBLIC_ARBITRUM_SEPOLIA_CONTRACT_ADDRESS'),
} as const;

export const EVM_SUPPORTED_CHAINS = [sepolia, bscTestnet, arbitrumSepolia];

export const DEFAULT_EVM_CHAIN_ID = sepolia.id;

export type EVMChainId = typeof sepolia.id | typeof bscTestnet.id | typeof arbitrumSepolia.id;

export function getEVMContractAddress(chainId: number): string | undefined {
  return EVM_CONTRACT_ADDRESSES[chainId as keyof typeof EVM_CONTRACT_ADDRESSES];
}

export function isEVMChainSupported(chainId: number): boolean {
  return chainId in EVM_CONTRACT_ADDRESSES;
}

export function getEVMChainName(chainId: number): string {
  switch (chainId) {
    case sepolia.id:
      return 'Ethereum Sepolia';
    case bscTestnet.id:
      return 'BSC Testnet';
    case arbitrumSepolia.id:
      return 'Arbitrum Sepolia';
    default:
      return 'Unknown Network';
  }
}
