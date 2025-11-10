import { getEnvVar } from '@/lib/utils/env';

export const WALLET_IDS = {
  PETRA: 'petra',
  PONTEM: 'pontem',
  NIGHTLY: 'nightly',
  ZEDRA: 'zedra',
  METAMASK: 'metamask',
} as const;

export type WalletId = typeof WALLET_IDS[keyof typeof WALLET_IDS];

export type DetectedWallet = WalletId | 'none';

export const WALLET_NAMES: Record<WalletId, string> = {
  [WALLET_IDS.PETRA]: 'Petra',
  [WALLET_IDS.PONTEM]: 'Pontem',
  [WALLET_IDS.NIGHTLY]: 'Nightly',
  [WALLET_IDS.ZEDRA]: 'Zedra',
  [WALLET_IDS.METAMASK]: 'MetaMask',
} as const;

export const WALLET_DOWNLOAD_URLS: Record<WalletId, string> = {
  [WALLET_IDS.PETRA]: getEnvVar('NEXT_PUBLIC_PETRA_WALLET_URL'),
  [WALLET_IDS.PONTEM]: getEnvVar('NEXT_PUBLIC_PONTEM_WALLET_URL'),
  [WALLET_IDS.NIGHTLY]: getEnvVar('NEXT_PUBLIC_NIGHTLY_WALLET_URL'),
  [WALLET_IDS.ZEDRA]: getEnvVar('NEXT_PUBLIC_ZEDRA_WALLET_URL'),
  [WALLET_IDS.METAMASK]: getEnvVar('NEXT_PUBLIC_METAMASK_WALLET_URL'),
} as const;

export interface WalletInfo {
  id: WalletId;
  name: string;
  downloadUrl: string;
}

export function getWalletName(walletId: WalletId): string {
  return WALLET_NAMES[walletId];
}

export function getWalletDownloadUrl(walletId: WalletId): string {
  return WALLET_DOWNLOAD_URLS[walletId];
}

export function getWalletInfo(walletId: WalletId): WalletInfo {
  return {
    id: walletId,
    name: WALLET_NAMES[walletId],
    downloadUrl: WALLET_DOWNLOAD_URLS[walletId],
  };
}

export function isValidWalletId(id: string): id is WalletId {
  return Object.values(WALLET_IDS).includes(id as WalletId);
}
