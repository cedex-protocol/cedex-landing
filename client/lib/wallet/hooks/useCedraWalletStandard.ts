import { useCallback, useState, useEffect } from 'react';
import { getCedraWallets, CedraWallet } from '@cedra-labs/wallet-standard';
import { WALLET_IDS, type WalletId, handleWalletError } from '@/lib/wallet';

export interface CedraWalletStandardState {
  cedraAddress: string | null;
  isCedraConnected: boolean;
  availableCedraWallets: CedraWallet[];
  connectCedraWallet: (walletId: WalletId) => Promise<void>;
  disconnectCedraWallet: () => Promise<void>;
}

export function useCedraWalletStandard(): CedraWalletStandardState {
  const [cedraAddress, setCedraAddress] = useState<string | null>(null);
  const [isCedraConnected, setIsCedraConnected] = useState(false);
  const [availableCedraWallets, setAvailableCedraWallets] = useState<CedraWallet[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<CedraWallet | null>(null);

  useEffect(() => {
    const { cedraWallets, on } = getCedraWallets();
    setAvailableCedraWallets(cedraWallets);

    const unsubscribe = on('register', () => {
      const { cedraWallets: updatedWallets } = getCedraWallets();
      setAvailableCedraWallets(updatedWallets);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const connectCedraWallet = useCallback(async (walletId: WalletId) => {
    if (walletId !== WALLET_IDS.NIGHTLY) {
      throw new Error('Only Nightly wallet is supported for Cedra');
    }

    try {
      const nightlyWallet = availableCedraWallets.find(wallet =>
        wallet.name.toLowerCase().includes('nightly')
      );

      if (!nightlyWallet) {
        throw new Error('Nightly wallet is not installed. Please install Nightly extension.');
      }

      const connectFeature = nightlyWallet.features['cedra:connect'];
      if (!connectFeature) {
        throw new Error('Nightly wallet does not support cedra:connect feature');
      }

      const response = await connectFeature.connect();

      if (response.status === 'Approved') {
        const accountInfo = response.args;
        const address = accountInfo.address.toString();
        setCedraAddress(address);
        setIsCedraConnected(true);
        setConnectedWallet(nightlyWallet);

        const onAccountChangeFeature = nightlyWallet.features['cedra:onAccountChange'];
        if (onAccountChangeFeature) {
          onAccountChangeFeature.onAccountChange((newAccount) => {
            if (newAccount) {
              setCedraAddress(newAccount.address.toString());
            } else {
              setCedraAddress(null);
              setIsCedraConnected(false);
              setConnectedWallet(null);
            }
          });
        }
      } else {
        throw new Error('User rejected the connection request');
      }
    } catch (error) {
      const walletError = handleWalletError(error, walletId, 'useCedraWalletStandard');
      throw new Error(walletError.message);
    }
  }, [availableCedraWallets]);

  const disconnectCedraWallet = useCallback(async () => {
    if (connectedWallet) {
      const disconnectFeature = connectedWallet.features['cedra:disconnect'];

      if (disconnectFeature && typeof disconnectFeature.disconnect === 'function') {
        try {
          await disconnectFeature.disconnect();
        } catch (error) {
          handleWalletError(error, WALLET_IDS.NIGHTLY, 'useCedraWalletStandard.disconnect', {
            silent: true,
          });
        }
      }
    }

    setCedraAddress(null);
    setIsCedraConnected(false);
    setConnectedWallet(null);
  }, [connectedWallet]);

  return {
    cedraAddress,
    isCedraConnected,
    availableCedraWallets,
    connectCedraWallet,
    disconnectCedraWallet,
  };
}
