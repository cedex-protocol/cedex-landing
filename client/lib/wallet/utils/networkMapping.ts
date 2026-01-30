import { WALLET_IDS } from '../constants/walletIds';
import type { MoveNetwork } from '../types/providers';

type WalletType = 'evm' | 'aptos' | 'cedra';

export function getWalletType(walletId: string, isCedraWallet?: (name: string) => boolean): WalletType {
  if (walletId === WALLET_IDS.METAMASK) return 'evm';
  if (isCedraWallet?.(walletId)) return 'cedra';
  return 'aptos';
}

export function getDefaultNetwork(walletId: string, isCedraWallet?: (name: string) => boolean): MoveNetwork {
  return isCedraWallet?.(walletId) ? 'cedra' : 'aptos';
}

export function getSupportedNetworks(walletId: string, isCedraWallet?: (name: string) => boolean): MoveNetwork[] {
  if (walletId === WALLET_IDS.METAMASK) return [];
  if (isCedraWallet?.(walletId)) return ['cedra'];
  return ['aptos'];
}

export function supportsNetwork(walletId: string, network: MoveNetwork, isCedraWallet?: (name: string) => boolean): boolean {
  return getSupportedNetworks(walletId, isCedraWallet).includes(network);
}

export function isEvmWallet(walletId: string): boolean {
  return walletId === WALLET_IDS.METAMASK;
}

export function isMoveWallet(walletId: string): boolean {
  return !isEvmWallet(walletId);
}
