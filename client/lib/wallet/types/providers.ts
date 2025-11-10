import type { WalletContextState } from "@aptos-labs/wallet-adapter-react";
import type { CedraWallet } from '@cedra-labs/wallet-standard';

export interface TransactionPayload {
  function: string;
  type_arguments: string[];
  arguments: string[];
}

export interface TransactionResponse {
  hash?: string;
  result?: {
    hash?: string;
  };
}

export interface PetraNetworkInfo {
  chainId: number;
  name: string;
  url: string;
}

export type PetraNetworkResponse = string | PetraNetworkInfo;

export interface BaseAptosProvider {
  connect(): Promise<{ address: string; publicKey?: string }>;
  disconnect(): Promise<void>;
  account(): Promise<{ address: string } | string>;
  isConnected(): Promise<boolean>;
  network?(): Promise<PetraNetworkResponse | string>;
  changeNetwork?(network: string): Promise<void>;
  signAndSubmitTransaction?(
    transaction: TransactionPayload | { payload: TransactionPayload } | unknown
  ): Promise<TransactionResponse | { hash: string } | unknown>;
  signAndSubmit?(
    transaction: TransactionPayload | { payload: TransactionPayload }
  ): Promise<TransactionResponse>;
  signTransaction?(transaction: unknown): Promise<unknown>;
  signMessage?(message: unknown): Promise<unknown>;
  on?(event: string, callback: (data: unknown) => void): void;
  off?(event: string, callback: (data: unknown) => void): void;
  onNetworkChange?(callback: (network: unknown) => void): void;
  onAccountChange?(callback: (account: unknown) => void): void;
}

export interface PetraProvider extends BaseAptosProvider {
  network(): Promise<PetraNetworkResponse>;
}

export interface PontemProvider extends BaseAptosProvider {
  // Pontem has same interface as BaseAptosProvider
}

export interface NightlyAptosProvider extends BaseAptosProvider {
  getAccount(): Promise<{
    address: string | { data: Uint8Array };
    publicKey?: unknown;
  }>;
  getNetwork?(): Promise<{ name: string; chainId: number; url: string }>;
  signTransaction?(transaction: unknown): Promise<{
    status: 'Approved' | 'Rejected';
    args?: Record<string, unknown>;
  }>;
}

export interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, callback: (...args: unknown[]) => void): void;
  removeListener?(event: string, callback: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
}

export type WalletProvider =
  | PetraProvider
  | PontemProvider
  | NightlyAptosProvider
  | EthereumProvider
  | WalletContextState
  | null;

export function isPetraProvider(provider: unknown): provider is PetraProvider {
  return (
    provider !== null &&
    typeof provider === 'object' &&
    'connect' in provider &&
    'network' in provider
  );
}

export function isEthereumProvider(provider: unknown): provider is EthereumProvider {
  return (
    provider !== null &&
    typeof provider === 'object' &&
    'request' in provider
  );
}

export function isNightlyProvider(provider: unknown): provider is NightlyAptosProvider {
  return (
    provider !== null &&
    typeof provider === 'object' &&
    'getAccount' in provider
  );
}

export type CedraProvider = CedraWallet;
export type MoveNetwork = 'cedra' | 'aptos';
export type AptosProvider = BaseAptosProvider;

declare global {
  interface Window {
    aptos?: AptosProvider;
    petra?: PetraProvider;
    pontem?: PontemProvider;
    ethereum?: EthereumProvider;
    nightly?: {
      aptos?: NightlyAptosProvider;
      solana?: unknown;
      near?: unknown;
      sui?: unknown;
    };
  }
}
