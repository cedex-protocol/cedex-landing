import { useCallback, useState, useEffect } from 'react';
import { getCedraWallets, CedraWallet } from '@cedra-labs/wallet-standard';
import { handleWalletError } from '@/lib/wallet';

export interface CedraWalletInfo {
  name: string;
  icon: string;
}

export interface CedraWalletStandardState {
  cedraAddress: string | null;
  isCedraConnected: boolean;
  availableCedraWallets: CedraWallet[];
  connectedCedraWalletName: string | null;
  connectCedraWallet: (walletName: string) => Promise<void>;
  disconnectCedraWallet: () => Promise<void>;
  isCedraWallet: (walletName: string) => boolean;
  getCedraWalletInfo: () => CedraWalletInfo[];
}

const DEFAULT_WALLET_ICON = '/wallets-icon/default-cedra.svg';

export function useCedraWalletStandard(): CedraWalletStandardState {
  const [cedraAddress, setCedraAddress] = useState<string | null>(null);
  const [isCedraConnected, setIsCedraConnected] = useState(false);
  const [availableCedraWallets, setAvailableCedraWallets] = useState<CedraWallet[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<CedraWallet | null>(null);
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);

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

  const isCedraWallet = useCallback((walletName: string): boolean => {
    return availableCedraWallets.some(wallet =>
      wallet.name.toLowerCase() === walletName.toLowerCase()
    );
  }, [availableCedraWallets]);

  const getCedraWalletInfo = useCallback((): CedraWalletInfo[] => {
    return availableCedraWallets.map(wallet => ({
      name: wallet.name,
      icon: wallet.icon || DEFAULT_WALLET_ICON,
    }));
  }, [availableCedraWallets]);

  const connectCedraWallet = useCallback(async (walletName: string) => {
    try {
      const selectedWallet = availableCedraWallets.find(wallet =>
        wallet.name.toLowerCase() === walletName.toLowerCase()
      );

      if (!selectedWallet) {
        throw new Error(`${walletName} wallet is not installed. Please install ${walletName} extension.`);
      }

      const connectFeature = selectedWallet.features['cedra:connect'];
      if (!connectFeature) {
        throw new Error(`${walletName} wallet does not support cedra:connect feature`);
      }

      const response = await connectFeature.connect();

      if (response.status === 'Approved') {
        const accountInfo = response.args;
        const address = accountInfo.address.toString();
        setCedraAddress(address);
        setIsCedraConnected(true);
        setConnectedWallet(selectedWallet);
        setConnectedWalletName(selectedWallet.name);

        const onAccountChangeFeature = selectedWallet.features['cedra:onAccountChange'];
        if (onAccountChangeFeature) {
          onAccountChangeFeature.onAccountChange((newAccount) => {
            if (newAccount) {
              setCedraAddress(newAccount.address.toString());
            } else {
              setCedraAddress(null);
              setIsCedraConnected(false);
              setConnectedWallet(null);
              setConnectedWalletName(null);
            }
          });
        }
      } else {
        throw new Error('User rejected the connection request');
      }
    } catch (error) {
      const walletError = handleWalletError(error, walletName, 'useCedraWalletStandard');
      throw new Error(walletError.message);
    }
  }, [availableCedraWallets]);

  const disconnectCedraWallet = useCallback(async () => {
    if (connectedWallet && connectedWalletName) {
      const disconnectFeature = connectedWallet.features['cedra:disconnect'];

      if (disconnectFeature && typeof disconnectFeature.disconnect === 'function') {
        try {
          await disconnectFeature.disconnect();
        } catch (error) {
          handleWalletError(error, connectedWalletName, 'useCedraWalletStandard.disconnect', {
            silent: true,
          });
        }
      }
    }

    setCedraAddress(null);
    setIsCedraConnected(false);
    setConnectedWallet(null);
    setConnectedWalletName(null);
  }, [connectedWallet, connectedWalletName]);

  return {
    cedraAddress,
    isCedraConnected,
    availableCedraWallets,
    connectedCedraWalletName: connectedWalletName,
    connectCedraWallet,
    disconnectCedraWallet,
    isCedraWallet,
    getCedraWalletInfo,
  };
}
