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
  connectAptosWallet: (walletId: WalletId) => Promise<void>;
  disconnectAptosWallet: () => Promise<void>;
  changeAptosNetwork: ((network: Network) => Promise<unknown>) | undefined;
  availableWallets: ReadonlyArray<AdapterWallet> | undefined;
  isWalletAdapterLoading: boolean;
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

  const connectAptosWallet = useCallback(async (walletId: WalletId) => {
    try {
      const walletName = getWalletName(walletId);

      if (!availableWallets || availableWallets.length === 0) {
        throw new Error(`Wallet adapter is still loading. Please wait a moment and try again.`);
      }

      const targetWallet = availableWallets.find(w => {
        const name = w.name.toLowerCase();
        const targetName = walletName.toLowerCase();
        return name.includes(targetName);
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
        const provider = getWalletProvider(walletId);
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
        connectAptos(walletName);
      } catch (connectionError) {
        console.error(`[useAptosWalletConnection] connectAptos() threw error:`, connectionError);
        throw connectionError;
      }
    } catch (err: unknown) {
      const walletError = handleWalletError(err, walletId, 'useAptosWalletConnection');
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
  };
}

async function validateAptosWalletNetwork(walletId: WalletId): Promise<void> {
  if (typeof window === 'undefined') return;

  const walletName = getWalletName(walletId);
  let provider: { network?: () => Promise<unknown> } | undefined;

  if (walletId === WALLET_IDS.PETRA && window.petra) {
    provider = window.petra;
  } else if (walletId === WALLET_IDS.PONTEM && window.pontem) {
    provider = window.pontem;
  } else {
    return;
  }

  if (!provider.network) return;

  try {
    const network = await provider.network();
    let networkName = '';

    if (typeof network === 'string') {
      networkName = network.toLowerCase();
    } else if (network && typeof network === 'object' && 'name' in network) {
      const nameValue = (network as { name?: unknown }).name;
      networkName = nameValue ? String(nameValue).toLowerCase() : '';
    }

    if (networkName.includes('mainnet')) {
      throw new Error(
        `${walletName} is currently on Mainnet. Please switch to Testnet:\n\n` +
        `1. Open ${walletName} extension\n` +
        `2. Click on the network name at the top\n` +
        `3. Select "Testnet" from the dropdown\n` +
        `4. Try connecting again`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Mainnet')) {
      throw error;
    }
    console.warn(`[validateAptosWalletNetwork] Could not validate ${walletName} network:`, error);
  }
}

async function validatePetraNetwork(): Promise<void> {
  return validateAptosWalletNetwork(WALLET_IDS.PETRA);
}

async function validatePontemNetwork(): Promise<void> {
  return validateAptosWalletNetwork(WALLET_IDS.PONTEM);
}
