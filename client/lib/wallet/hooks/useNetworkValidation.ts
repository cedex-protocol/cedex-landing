import { useEffect, useState } from 'react';
import { WALLET_IDS } from '@/lib/wallet';
import type { MoveNetwork } from '../types/providers';
import type { Network } from '@aptos-labs/ts-sdk';
import type { AptosNetworkInfo } from './useAptosWalletConnection';

export interface NetworkValidationState {
  networkError: Error | null;
  isValidatingNetwork: boolean;
}

export interface NetworkValidationHookParams {
  aptosNetwork: AptosNetworkInfo | null | undefined;
  isAptosConnected: boolean;
  changeAptosNetwork?: (network: Network) => Promise<unknown>;
  disconnectAptosWallet: () => Promise<void>;
  selectedWalletId: string;
  moveNetwork: MoveNetwork;
  setSelectedWalletId: (id: string) => void;
}

export function useNetworkValidation({
  aptosNetwork,
  isAptosConnected,
  changeAptosNetwork,
  disconnectAptosWallet,
  selectedWalletId,
  moveNetwork,
  setSelectedWalletId,
}: NetworkValidationHookParams): NetworkValidationState {
  const [networkError, setNetworkError] = useState<Error | null>(null);
  const [isValidatingNetwork, setIsValidatingNetwork] = useState(false);

  useEffect(() => {
    if (!aptosNetwork || !isAptosConnected || !changeAptosNetwork) return;

    const networkName = aptosNetwork.name?.toLowerCase() || '';

    if (networkName.includes('testnet')) {
      setNetworkError(null);
    } else if (networkName.includes('mainnet')) {
      console.warn('[useNetworkValidation] ⚠️ Connected to Aptos Mainnet, switching to Testnet...');

      const switchNetwork = async () => {
        setIsValidatingNetwork(true);
        try {
          const { Network } = await import('@aptos-labs/ts-sdk');
          await changeAptosNetwork(Network.TESTNET);
          setNetworkError(null);
        } catch (error) {
          console.error('[useNetworkValidation] ❌ Failed to switch network:', error);

          setNetworkError(new Error(
            'Petra is connected to Mainnet, but this app requires Testnet.\n\n' +
            'Please switch to Testnet manually:\n' +
            '1. Open Petra wallet extension\n' +
            '2. Click network selector (top)\n' +
            '3. Select "Testnet"\n' +
            '4. The page will automatically reconnect'
          ));

          await disconnectAptosWallet();
          setSelectedWalletId('');
        } finally {
          setIsValidatingNetwork(false);
        }
      };

      switchNetwork();
    }
  }, [aptosNetwork, isAptosConnected, changeAptosNetwork, disconnectAptosWallet, setSelectedWalletId]);

  useEffect(() => {
    if (!isAptosConnected) return;

    if (selectedWalletId === WALLET_IDS.PETRA && moveNetwork === 'cedra') {
      setNetworkError(
        new Error('Petra wallet does not support Cedra network. Please switch back to Aptos network or use Nightly wallet for Cedra.')
      );
      console.warn('[useNetworkValidation] Petra on Cedra network - unsupported configuration');
    } else if (networkError?.message?.includes('Cedra')) {
      setNetworkError(null);
    }
  }, [isAptosConnected, selectedWalletId, moveNetwork, networkError]);

  return {
    networkError,
    isValidatingNetwork,
  };
}
