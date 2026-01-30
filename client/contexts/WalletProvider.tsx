"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { getEVMContractAddress } from "@/lib/nft";
import {
  isChainSupported,
  SUPPORTED_NETWORKS,
  CEDRA_NETWORK_ID,
  APTOS_NETWORK_ID,
} from "../lib/constants/networks";
import type { MoveNetwork } from "@/lib/wallet";
import {
  type WalletId,
  WALLET_IDS,
  getWalletProvider,
  extractWalletIdFromError,
} from "@/lib/wallet";
import { useEvmWallet } from "@/lib/wallet/hooks/useEvmWallet";
import { useAptosWalletConnection } from "@/lib/wallet/hooks/useAptosWalletConnection";
import { useCedraWalletStandard } from "@/lib/wallet/hooks/useCedraWalletStandard";
import { useNetworkValidation } from "@/lib/wallet/hooks/useNetworkValidation";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  isConnecting: boolean;
  error: Error | null;

  chainId: number | undefined;
  isChainSupported: boolean;
  currentContractAddress: string | undefined;
  preferredChainId: number;

  connectedWalletType: 'evm' | 'aptos' | 'cedra' | null;
  aptosAddress: string | null;
  cedraAddress: string | null;
  selectedWalletId: string;
  connectedCedraWalletName: string | null;
  moveNetwork: MoveNetwork;

  connectWallet: (walletId: string) => void;
  disconnectWallet: () => void;
  retryConnection: () => void;
  setPreferredChainId: (chainId: number) => void;
  setMoveNetwork: (network: MoveNetwork) => void;
  isCedraWallet: (walletName: string) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [connectedWalletType, setConnectedWalletType] = useState<'evm' | 'aptos' | 'cedra' | null>(null);
  const [preferredChainId, setPreferredChainId] = useState<number>(CEDRA_NETWORK_ID);
  const [moveNetwork, setMoveNetwork] = useState<MoveNetwork>('cedra');

  const [pontemAddress, setPontemAddress] = useState<string | null>(null);
  const [pontemConnected, setPontemConnected] = useState(false);

  const evmWallet = useEvmWallet(preferredChainId);
  const aptosWallet = useAptosWalletConnection();
  const cedraWallet = useCedraWalletStandard();

  const networkValidation = useNetworkValidation({
    aptosNetwork: aptosWallet.aptosNetwork,
    isAptosConnected: aptosWallet.isAptosConnected,
    changeAptosNetwork: aptosWallet.changeAptosNetwork,
    disconnectAptosWallet: aptosWallet.disconnectAptosWallet,
    selectedWalletId,
    moveNetwork,
    setSelectedWalletId: (id: string) => setSelectedWalletId(id as WalletId | ''),
  });

  const isConnected = evmWallet.isEvmConnected || aptosWallet.isAptosConnected || cedraWallet.isCedraConnected || pontemConnected;
  const isConnecting = evmWallet.isConnectingEvm;
  const chainId = connectedWalletType === 'evm' ? evmWallet.evmChainId :
                 (connectedWalletType === 'cedra' || connectedWalletType === 'aptos') ? preferredChainId : undefined;
  const walletAddress = cedraWallet.cedraAddress || pontemAddress || aptosWallet.aptosAddress || evmWallet.evmAddress || "";
  const error = connectionError || evmWallet.evmError || networkValidation.networkError;

  const isChainSupportedValue = chainId ? isChainSupported(chainId) : false;
  const currentContractAddress = chainId ? getEVMContractAddress(chainId) : undefined;

  useEffect(() => {
    if (selectedWalletId !== WALLET_IDS.PONTEM || connectionError) {
      if (pontemConnected) {
        setPontemConnected(false);
        setPontemAddress(null);
      }
      return;
    }

    if (typeof window === 'undefined' || !window.pontem) return;

    const checkPontemConnection = async () => {
      if (connectionError) return;

      try {
        const provider = getWalletProvider(WALLET_IDS.PONTEM);
        if (provider && 'account' in provider && typeof provider.account === 'function') {
          const account = await provider.account();

          if (typeof account === 'string' && account) {
            setPontemAddress(account);
            setPontemConnected(true);
          } else if (account && typeof account === 'object' && 'address' in account) {
            const address = String(account.address);
            setPontemAddress(address);
            setPontemConnected(true);
          }
        }
      } catch (err) {
        if (pontemConnected) {
          setPontemConnected(false);
          setPontemAddress(null);
        }
      }
    };

    checkPontemConnection();

    const handleAccountChange = (account: unknown) => {
      if (typeof account === 'string' && account) {
        setPontemAddress(account);
        setPontemConnected(true);
      } else if (account && typeof account === 'object' && 'address' in account) {
        setPontemAddress(String((account as { address: string }).address));
        setPontemConnected(true);
      } else {
        setPontemConnected(false);
        setPontemAddress(null);
      }
    };

    const handleDisconnect = () => {
      setPontemConnected(false);
      setPontemAddress(null);
    };

    if (window.pontem && 'on' in window.pontem && typeof window.pontem.on === 'function') {
      window.pontem.on('accountChange', handleAccountChange);
      window.pontem.on('disconnect', handleDisconnect);
      window.pontem.on('accountChanged', handleAccountChange); 
    }


    const interval = setInterval(checkPontemConnection, 3000);

    return () => {
      clearInterval(interval);
      if (window.pontem && 'off' in window.pontem && typeof window.pontem.off === 'function') {
        window.pontem.off('accountChange', handleAccountChange);
        window.pontem.off('disconnect', handleDisconnect);
        window.pontem.off('accountChanged', handleAccountChange);
      }
    };
  }, [selectedWalletId, connectionError, pontemConnected]);

  useEffect(() => {
    if (evmWallet.isEvmConnected && evmWallet.evmAddress && !aptosWallet.aptosAddress && !pontemAddress) {
      setConnectedWalletType('evm');
    } else if (pontemAddress && moveNetwork === 'aptos') {
      setConnectedWalletType('aptos');
      setPreferredChainId(APTOS_NETWORK_ID);
    } else if (aptosWallet.aptosAddress && moveNetwork === 'cedra') {
      setConnectedWalletType('cedra');
      setPreferredChainId(CEDRA_NETWORK_ID);
    } else if (aptosWallet.aptosAddress && moveNetwork === 'aptos') {
      setConnectedWalletType('aptos');
      setPreferredChainId(APTOS_NETWORK_ID);
    }
  }, [evmWallet.isEvmConnected, evmWallet.evmAddress, aptosWallet.aptosAddress, pontemAddress, moveNetwork]);

  useEffect(() => {
    if (aptosWallet.currentAptosWallet && aptosWallet.isAptosConnected) {
      const walletName = aptosWallet.currentAptosWallet.name.toLowerCase();

      if (walletName.includes('petra')) {
        setSelectedWalletId(WALLET_IDS.PETRA);
        setMoveNetwork('aptos');
      } else if (walletName.includes('pontem')) {
        setSelectedWalletId(WALLET_IDS.PONTEM);
        setMoveNetwork('aptos');
      }
      // Note: Nightly is now handled via Cedra wallet-standard, not Aptos adapter
    }
  }, [aptosWallet.currentAptosWallet, aptosWallet.isAptosConnected, moveNetwork]);

  useEffect(() => {
    const isActuallyConnected = evmWallet.isEvmConnected || aptosWallet.isAptosConnected;

    if (!isActuallyConnected) return;

    if (connectedWalletType === 'evm' && chainId && !isChainSupported(chainId)) {
      const supportedNames = SUPPORTED_NETWORKS.map(n => n.name).join(', ');
      setConnectionError(new Error(`Please switch to a supported network: ${supportedNames}`));
    } else if (connectionError?.message?.includes('network')) {
      setConnectionError(null);
    }
  }, [evmWallet.isEvmConnected, aptosWallet.isAptosConnected, chainId, connectedWalletType, connectionError]);

  useEffect(() => {
    if (connectionError?.message.toLowerCase().includes('not installed')) {
      const walletId = extractWalletIdFromError(connectionError.message);
      if (walletId) {
        const provider = getWalletProvider(walletId);
        if (provider) {
          setConnectionError(null);
        }
      }
    }
  }, [connectionError]);

  const connectWallet = useCallback(async (walletId: string) => {
    setSelectedWalletId(walletId);
    setConnectionError(null);

    try {
      if (walletId === WALLET_IDS.METAMASK) {
        await evmWallet.connectEvm();
        setConnectedWalletType('evm');
      }
      else if (cedraWallet.isCedraWallet(walletId)) {
        if (evmWallet.isEvmConnected) {
          evmWallet.disconnectEvm();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        await cedraWallet.connectCedraWallet(walletId);

        setMoveNetwork('cedra');
        setConnectedWalletType('cedra');
        setPreferredChainId(CEDRA_NETWORK_ID);
      }
      else if (walletId === WALLET_IDS.PETRA || walletId === WALLET_IDS.PONTEM) {
        if (evmWallet.isEvmConnected) {
          evmWallet.disconnectEvm();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        await aptosWallet.connectAptosWallet(walletId as WalletId);

        setMoveNetwork('aptos');
        setConnectedWalletType('aptos');
        setPreferredChainId(APTOS_NETWORK_ID);
      }
    } catch (err) {
      const isNetworkWarning = err instanceof Error &&
        (err.message.includes('Mainnet') || err.message.includes('Testnet'));

      if (!isNetworkWarning) {
        console.error('[WalletProvider] Failed to connect:', err);
      }

      setConnectionError(err as Error);
    }
  }, [evmWallet, aptosWallet, cedraWallet]);

  const disconnectWallet = useCallback(async () => {

    if (chainId && isChainSupported(chainId)) {
      setPreferredChainId(chainId);
    }

    if (evmWallet.isEvmConnected) {
      evmWallet.disconnectEvm();
    }

    if (cedraWallet.isCedraConnected) {
      await cedraWallet.disconnectCedraWallet();
    }

    if (aptosWallet.isAptosConnected) {
      await aptosWallet.disconnectAptosWallet();
    }

    setSelectedWalletId("");
    setConnectionError(null);
    setConnectedWalletType(null);
  }, [evmWallet, cedraWallet, aptosWallet, chainId]);

  const retryConnection = useCallback(() => {
    setConnectionError(null);
    const walletId = extractWalletIdFromError(connectionError?.message || '');

    if (walletId) {
      connectWallet(walletId);
    } else if (selectedWalletId) {
      connectWallet(selectedWalletId);
    }
  }, [connectionError, connectWallet, selectedWalletId]);

  useEffect(() => {
    if (!connectionError) return;

    const isNetworkError = connectionError.message.includes('Mainnet') ||
                          connectionError.message.includes('Testnet');
    if (!isNetworkError) return;
    if (selectedWalletId !== WALLET_IDS.PETRA && selectedWalletId !== WALLET_IDS.PONTEM) return;

    const checkNetwork = async () => {
      const provider = selectedWalletId === WALLET_IDS.PETRA ? window.petra : window.pontem;
      if (!provider?.network) return;

      const network = await provider.network();
      const networkName = typeof network === 'string' ? network : (network as any)?.name || '';

      if (networkName.toLowerCase().includes('testnet')) {
        connectWallet(selectedWalletId as WalletId);
      }
    };

    const interval = setInterval(checkNetwork, 2000);
    return () => clearInterval(interval);
  }, [connectionError, selectedWalletId, connectWallet]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        isConnecting,
        error,
        chainId,
        isChainSupported: isChainSupportedValue,
        currentContractAddress,
        preferredChainId,
        connectedWalletType,
        aptosAddress: aptosWallet.aptosAddress,
        cedraAddress: cedraWallet.cedraAddress,
        selectedWalletId,
        connectedCedraWalletName: cedraWallet.connectedCedraWalletName,
        moveNetwork,
        connectWallet,
        disconnectWallet,
        retryConnection,
        setPreferredChainId,
        setMoveNetwork,
        isCedraWallet: cedraWallet.isCedraWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
