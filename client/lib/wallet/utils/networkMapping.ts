import { WALLET_IDS, type WalletId } from '../constants/walletIds';
import type { MoveNetwork } from '../types/providers';

export function getDefaultNetwork(walletId: WalletId): MoveNetwork {
  switch (walletId) {
    case WALLET_IDS.NIGHTLY:
    case WALLET_IDS.ZEDRA:
      return 'cedra';
    case WALLET_IDS.PETRA:
    case WALLET_IDS.PONTEM:
      return 'aptos';
    default:
      return 'aptos';
  }
}

export function getSupportedNetworks(walletId: WalletId): MoveNetwork[] {
  switch (walletId) {
    case WALLET_IDS.NIGHTLY:
    case WALLET_IDS.ZEDRA:
      return ['cedra'];
    case WALLET_IDS.PETRA:
    case WALLET_IDS.PONTEM:
      return ['aptos'];
    case WALLET_IDS.METAMASK:
      return [];
    default:
      return [];
  }
}

export function supportsNetwork(walletId: WalletId, network: MoveNetwork): boolean {
  return getSupportedNetworks(walletId).includes(network);
}

export function getWalletType(walletId: WalletId): 'evm' | 'aptos' | 'cedra' {
  if (walletId === WALLET_IDS.METAMASK) {
    return 'evm';
  }

  if (walletId === WALLET_IDS.NIGHTLY || walletId === WALLET_IDS.ZEDRA) {
    return 'cedra';
  }

  return 'aptos';
}

export function isMoveWallet(walletId: WalletId): boolean {
  return walletId !== WALLET_IDS.METAMASK;
}

export function isEvmWallet(walletId: WalletId): boolean {
  return walletId === WALLET_IDS.METAMASK;
}
