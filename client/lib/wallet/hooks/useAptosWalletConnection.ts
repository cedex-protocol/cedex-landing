import { useCallback } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import type { Network } from '@aptos-labs/ts-sdk';
import type { AdapterWallet } from '@aptos-labs/wallet-adapter-core';
import {
  WALLET_IDS,
  type WalletId,
  getWalletName,
  getWalletProvider,
  handleWalletError,
} from '@/lib/wallet';

export interface AptosWalletInfo {
  name: string;
  icon?: string;
  url?: string;
}

export interface AptosNetworkInfo {
  name?: string;
  chainId?: number | string;
  url?: string;
}

export interface AptosWalletConnectionState {
  aptosAddress: string | null;
  isAptosConnected: boolean;
  currentAptosWallet: AptosWalletInfo | null;
  aptosNetwork: AptosNetworkInfo | null;
  connectAptosWallet: (walletId: string) => Promise<void>;
  disconnectAptosWallet: () => Promise<void>;
  changeAptosNetwork: ((network: Network) => Promise<unknown>) | undefined;
  availableWallets: ReadonlyArray<AdapterWallet> | undefined;
  isWalletAdapterLoading: boolean;
  getAptosWalletInfo: () => AptosWalletInfo[];
  isAptosWallet: (walletId: string) => boolean;
}

export interface AptosConnectionError {
  walletId: WalletId;
  error: Error;
}

export function useAptosWalletConnection(): AptosWalletConnectionState {
  const {
    account: aptosAccount,
    connected: isAptosConnected,
    connect: connectAptos,
    disconnect: disconnectAptos,
    wallet: currentAptosWallet,
    network: aptosNetwork,
    changeNetwork: changeAptosNetwork,
    wallets: availableWallets,
    isLoading: isWalletAdapterLoading,
  } = useAptosWallet();

  const aptosAddress = aptosAccount?.address ? String(aptosAccount.address) : null;

  const getAptosWalletInfo = useCallback((): AptosWalletInfo[] => {
    return (availableWallets ?? [])
      .filter(w => w.readyState === 'Installed')
      .map(w => ({ name: w.name, icon: typeof w.icon === 'string' ? w.icon : undefined, url: w.url }));
  }, [availableWallets]);

  const isAptosWallet = useCallback((walletId: string): boolean => {
    if (!walletId) return false;
    const id = walletId.toLowerCase();
    if (id === 'petra' || id === 'pontem') return true;
    return availableWallets?.some(w => w.name.toLowerCase().includes(id)) ?? false;
  }, [availableWallets]);

  const connectAptosWallet = useCallback(async (walletId: string) => {
    try {
      const isKnownWallet = walletId === WALLET_IDS.PETRA || walletId === WALLET_IDS.PONTEM;
      const walletName = isKnownWallet ? getWalletName(walletId as WalletId) : walletId;

      if (!availableWallets || availableWallets.length === 0) {
        throw new Error(`Wallet adapter is still loading. Please wait a moment and try again.`);
      }

      const targetWallet = availableWallets.find(w => {
        const name = w.name.toLowerCase();
        const targetName = walletName.toLowerCase();
        return name === targetName || name.includes(targetName);
      });

      if (!targetWallet) {
        throw new Error(`${walletName} is not supported. Please use a supported wallet.`);
      }

      if (targetWallet.readyState !== 'Installed') {
        console.error(`[useAptosWalletConnection] ${walletName} readyState is:`, targetWallet.readyState);
        throw new Error(`${walletName} is not installed. Please install ${walletName} extension from: ${targetWallet.url || 'the Chrome Web Store'}`);
      }

      if (walletId === WALLET_IDS.PETRA && typeof window !== 'undefined' && window.petra) {
        await validatePetraNetwork();
      }

      if (walletId === WALLET_IDS.PONTEM) {
        const provider = getWalletProvider(walletId as WalletId);
        if (!provider || !('connect' in provider) || typeof provider.connect !== 'function') {
          throw new Error(`${walletName} provider not available or invalid`);
        }

        if (typeof window !== 'undefined' && window.pontem) {
          try {
            const pontemProvider = provider as { account: () => Promise<string | { address: string }> };
            if ('account' in provider && typeof pontemProvider.account === 'function') {
              const existingAccount = await pontemProvider.account();
              if (existingAccount) {
                await validatePontemNetwork();
              }
            }
          } catch (err) {
          }

          await validatePontemNetwork();
        }

        try {
          const pontemProvider = provider as { connect: () => Promise<{ address: string; publicKey: string }> };
          const connectResult = await pontemProvider.connect();

          if (connectResult && typeof connectResult === 'object' && 'address' in connectResult) {
            // Note: We don't call connectAptos() for Pontem because it doesn't work
            // The connection is established but we need to manually track the state
            // Address is tracked in WalletProvider via polling/events
            return;
          } else {
            throw new Error(`${walletName} connect() returned unexpected format`);
          }
        } catch (err) {
          console.error(`[useAptosWalletConnection] Pontem provider.connect() failed:`, err);
          throw err;
        }
      }

      try {
        connectAptos(targetWallet.name);
      } catch (connectionError) {
        console.error(`[useAptosWalletConnection] connectAptos() threw error:`, connectionError);
        throw connectionError;
      }
    } catch (err: unknown) {
      const walletError = handleWalletError(err, walletId as WalletId, 'useAptosWalletConnection');
      throw new Error(walletError.message);
    }
  }, [connectAptos, aptosAccount, availableWallets]);

  const disconnectAptosWallet = useCallback(async () => {
    disconnectAptos();
  }, [disconnectAptos]);

  return {
    aptosAddress,
    isAptosConnected,
    currentAptosWallet,
    aptosNetwork,
    connectAptosWallet,
    disconnectAptosWallet,
    changeAptosNetwork,
    availableWallets,
    isWalletAdapterLoading,
    getAptosWalletInfo,
    isAptosWallet,
  };
}

async function validateAptosWalletNetwork(walletId: WalletId): Promise<void> {
  if (typeof window === 'undefined') return;

  const provider = walletId === WALLET_IDS.PETRA ? window.petra : window.pontem;
  if (!provider?.network) return;

  try {
    const network = await provider.network();
    const networkName = typeof network === 'string'
      ? network
      : (network as { name?: string })?.name || '';

    if (networkName.toLowerCase().includes('mainnet')) {
      const walletName = getWalletName(walletId);
      throw new Error(`${walletName} is on Mainnet. Please switch to Testnet and try again.`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Mainnet')) throw error;
  }
}

const validatePetraNetwork = () => validateAptosWalletNetwork(WALLET_IDS.PETRA);
const validatePontemNetwork = () => validateAptosWalletNetwork(WALLET_IDS.PONTEM);
