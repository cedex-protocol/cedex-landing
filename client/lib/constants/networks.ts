import { sepolia, bscTestnet, arbitrumSepolia } from 'wagmi/chains';

export const SEPOLIA_CHAIN_ID = sepolia.id;
export const BSC_TESTNET_CHAIN_ID = bscTestnet.id;
export const ARBITRUM_SEPOLIA_CHAIN_ID = arbitrumSepolia.id;

export const EVM_CHAIN_IDS = [
  SEPOLIA_CHAIN_ID,
  BSC_TESTNET_CHAIN_ID,
  ARBITRUM_SEPOLIA_CHAIN_ID,
] as const;

export type EVMChainId = typeof EVM_CHAIN_IDS[number];

export const CEDRA_NETWORK_ID = 999999 as const;
export const APTOS_NETWORK_ID = 2 as const;

export const MOVE_CHAIN_IDS = [
  CEDRA_NETWORK_ID,
  APTOS_NETWORK_ID,
] as const;

export type MoveChainId = typeof MOVE_CHAIN_IDS[number];

export const DEFAULT_CHAIN_ID = SEPOLIA_CHAIN_ID;
export const DEFAULT_EVM_CHAIN_ID = SEPOLIA_CHAIN_ID;

export type SupportedChainId = EVMChainId | MoveChainId;

export type NetworkType = 'evm' | 'move';

export interface NetworkConfig {
  id: SupportedChainId;
  name: string;
  icon: string;
  color: string;
  type: NetworkType;
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: CEDRA_NETWORK_ID,
    name: "Cedra Network",
    icon: "/icons/cedra-logo.svg",
    color: "#6C5CE7",
    type: 'move',
  },
  {
    id: APTOS_NETWORK_ID,
    name: "Aptos Testnet",
    icon: "/icons/aptos-logo.svg",
    color: "#FFFFFF",
    type: 'move',
  },
  {
    id: SEPOLIA_CHAIN_ID,
    name: "Ethereum Sepolia",
    icon: "/icons/eth-logo.svg",
    color: "#627EEA",
    type: 'evm',
  },
  {
    id: BSC_TESTNET_CHAIN_ID,
    name: "BSC Testnet",
    icon: "/icons/bsc-logo.svg",
    color: "#000000",
    type: 'evm',
  },
  {
    id: ARBITRUM_SEPOLIA_CHAIN_ID,
    name: "Arbitrum Sepolia",
    icon: "/icons/arb-logo.svg",
    color: "#28A0F0",
    type: 'evm',
  },
];

export const SUPPORTED_CHAINS = [sepolia, bscTestnet, arbitrumSepolia] as const;


export function isChainSupported(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return SUPPORTED_NETWORKS.some(network => network.id === chainId);
}

export function isEVMChain(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return EVM_CHAIN_IDS.includes(chainId as EVMChainId);
}

export function isMoveChain(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return MOVE_CHAIN_IDS.includes(chainId as MoveChainId);
}