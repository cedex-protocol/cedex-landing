import { WALLET_IDS, type WalletId, type DetectedWallet } from '../constants/walletIds';
import type {
  WalletProvider,
  PetraProvider,
  PontemProvider,
  NightlyAptosProvider,
  EthereumProvider,
} from '../types/providers';

export function getWalletProvider(walletId: WalletId): WalletProvider {
  if (typeof window === 'undefined') {
    return null;
  }

  switch (walletId) {
    case WALLET_IDS.PETRA:
      return (window.petra as PetraProvider) || null;

    case WALLET_IDS.PONTEM:
      return (window.pontem as PontemProvider) || null;

    case WALLET_IDS.NIGHTLY:
      return (window.nightly?.aptos as NightlyAptosProvider) || null;

    case WALLET_IDS.METAMASK:
      return (window.ethereum as EthereumProvider) || null;

    default:
      return null;
  }
}

export function isWalletInstalled(walletId: WalletId): boolean {
  return getWalletProvider(walletId) !== null;
}

export async function isWalletConnected(walletId: WalletId): Promise<boolean> {
  const provider = getWalletProvider(walletId);

  if (!provider) {
    return false;
  }

  try {
    if (walletId === WALLET_IDS.METAMASK && 'request' in provider) {
      const accounts = await (provider as EthereumProvider).request({
        method: 'eth_accounts',
      }) as string[];
      return Array.isArray(accounts) && accounts.length > 0;
    }

    if ('isConnected' in provider && typeof provider.isConnected === 'function') {
      return await provider.isConnected();
    }

    return false;
  } catch (error) {
    console.warn(`[walletDetection] Error checking if ${walletId} is connected:`, error);
    return false;
  }
}

export async function detectConnectedWallet(): Promise<DetectedWallet> {
  const walletIds = Object.values(WALLET_IDS) as WalletId[];

  for (const walletId of walletIds) {
    const isConnected = await isWalletConnected(walletId);
    if (isConnected) {
      return walletId;
    }
  }

  return 'none';
}

export async function getWalletAddress(walletId: WalletId): Promise<string | null> {
  const provider = getWalletProvider(walletId);

  if (!provider) {
    return null;
  }

  try {
    if (walletId === WALLET_IDS.METAMASK && 'request' in provider) {
      const accounts = await (provider as EthereumProvider).request({
        method: 'eth_accounts',
      }) as string[];
      return accounts[0] || null;
    }

    if ('account' in provider && typeof provider.account === 'function') {
      const account = await provider.account();

      if (typeof account === 'string') {
        return account;
      }

      if (typeof account === 'object' && account !== null && 'address' in account) {
        return String(account.address);
      }
    }

    return null;
  } catch (error) {
    console.warn(`[walletDetection] Error getting ${walletId} address:`, error);
    return null;
  }
}

export function extractWalletIdFromError(errorMessage: string): WalletId | null {
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('petra')) {
    return WALLET_IDS.PETRA;
  }
  if (lowerMessage.includes('pontem')) {
    return WALLET_IDS.PONTEM;
  }
  if (lowerMessage.includes('nightly')) {
    return WALLET_IDS.NIGHTLY;
  }
  if (lowerMessage.includes('metamask')) {
    return WALLET_IDS.METAMASK;
  }

  return null;
}
