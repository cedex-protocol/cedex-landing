import { useCallback, useState } from 'react';
import { WALLET_IDS, type WalletId, handleWalletError, type CedraProvider } from '@/lib/wallet';

export interface CedraWalletState {
  cedraAddress: string | null;
  isCedraConnected: boolean;
  connectCedraWallet: (walletId: WalletId) => Promise<void>;
  disconnectCedraWallet: () => Promise<void>;
}

export function useCedraWalletConnection(): CedraWalletState {
  const [cedraAddress, setCedraAddress] = useState<string | null>(null);
  const [isCedraConnected, setIsCedraConnected] = useState(false);

  const connectCedraWallet = useCallback(async (walletId: WalletId) => {
    if (walletId !== WALLET_IDS.NIGHTLY) {
      throw new Error('Only Nightly wallet is supported for Cedra');
    }

    if (typeof window === 'undefined') {
      throw new Error('Window is not defined');
    }
    const provider = window.nightly?.aptos as CedraProvider | undefined;

    if (!provider) {
      throw new Error('Nightly wallet is not installed. Please install Nightly extension.');
    }

    try {
      const response = await provider.connect();

      if (response && typeof response === 'object' && 'address' in response) {
        const address = String(response.address);
        setCedraAddress(address);
        setIsCedraConnected(true);
      } else {
        throw new Error('Nightly connect() returned unexpected format');
      }
    } catch (error) {
      const walletError = handleWalletError(error, walletId, 'useCedraWalletConnection');
      throw new Error(walletError.message);
    }
  }, []);

  const disconnectCedraWallet = useCallback(async () => {

    if (typeof window !== 'undefined' && window.nightly?.aptos) {
      const provider = window.nightly.aptos as CedraProvider;

      if (provider.disconnect && typeof provider.disconnect === 'function') {
        try {
          await provider.disconnect();
        } catch (error) {
          handleWalletError(error, WALLET_IDS.NIGHTLY, 'useCedraWalletConnection.disconnect', {
            silent: true,
          });
        }
      }
    }

    setCedraAddress(null);
    setIsCedraConnected(false);
  }, []);

  return {
    cedraAddress,
    isCedraConnected,
    connectCedraWallet,
    disconnectCedraWallet,
  };
}
