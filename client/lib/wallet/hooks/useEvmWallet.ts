import { useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useConnectors, useChainId } from 'wagmi';
import { isEVMChain, DEFAULT_EVM_CHAIN_ID, type EVMChainId } from '@/lib/constants/networks';

export interface EvmWalletState {
  evmAddress: string | undefined;
  isEvmConnected: boolean;
  isConnectingEvm: boolean;
  evmChainId: number;
  evmError: Error | null;
  connectEvm: (chainId?: number) => Promise<void>;
  disconnectEvm: () => void;
}

export function useEvmWallet(preferredChainId: number): EvmWalletState {
  const { address, isConnected: isEvmConnected } = useAccount();
  const { connect, isPending: isConnectingEvm, error: connectEvmError } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();
  const connectors = useConnectors();
  const evmChainId = useChainId();

  const connectEvm = useCallback(async (targetChainId?: number) => {
    const chainId = targetChainId
      ? (isEVMChain(targetChainId) ? targetChainId as EVMChainId : DEFAULT_EVM_CHAIN_ID)
      : (isEVMChain(preferredChainId) ? preferredChainId as EVMChainId : DEFAULT_EVM_CHAIN_ID);

    const metaMaskConnector = connectors.find(
      (connector) => connector.id === 'metaMask' || connector.id === 'io.metamask'
    );

    if (!metaMaskConnector) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension.');
    }

    connect({
      connector: metaMaskConnector,
      chainId,
    });
  }, [connect, connectors, preferredChainId]);

  return {
    evmAddress: address,
    isEvmConnected,
    isConnectingEvm: isEvmConnected ? false : isConnectingEvm,
    evmChainId,
    evmError: connectEvmError,
    connectEvm,
    disconnectEvm,
  };
}
