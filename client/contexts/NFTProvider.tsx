"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useConfig } from "wagmi";
import { EVMNFTService, CedraNFTService, AptosNFTService, NFTData, UserNFTRoles } from "@/lib/nft";
import { useWallet } from "./WalletProvider";

interface NFTContextType {
  userNFTs: NFTData[];
  userRoles: UserNFTRoles | null;
  isLoadingNFTs: boolean;
  
  refreshNFTData: () => Promise<void>;
  refreshNFTDataWithRetry: (maxRetries?: number, delay?: number) => Promise<void>;
  triggerRoleRefresh: () => void;
  
  hasRoleByCardId: (cardId: string) => boolean;
  hasAnyNFT: boolean;
  hasTraderRole: boolean;
  hasLiquidityProviderRole: boolean;
  hasHolderRole: boolean;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export function NFTProvider({ children }: { children: ReactNode }) {
  const [userNFTs, setUserNFTs] = useState<NFTData[]>([]);
  const [userRoles, setUserRoles] = useState<UserNFTRoles | null>(null);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [roleRefreshTrigger, setRoleRefreshTrigger] = useState(0);

  const { isConnected, walletAddress, chainId, isChainSupported, connectedWalletType, moveNetwork } = useWallet();
  const config = useConfig();
  const nftService = useMemo(() => new EVMNFTService(config), [config]);
  const cedraNFTService = useMemo(() => new CedraNFTService(), []);
  const aptosNFTService = useMemo(() => new AptosNFTService(), []);

  const refreshNFTData = useCallback(async () => {
    if (!walletAddress || !isConnected) {
      setUserNFTs([]);
      setUserRoles(null);
      return;
    }

    setIsLoadingNFTs(true);
    try {
      if (connectedWalletType === 'cedra' && moveNetwork === 'cedra') {
        const nfts = await cedraNFTService.fetchUserNFTs(walletAddress) as any[];
        setUserNFTs(nfts);

        const roles = await cedraNFTService.fetchUserRoles(walletAddress) as any;
        setUserRoles(roles);
      }
      else if (connectedWalletType === 'evm' && isChainSupported) {
        const nfts = await nftService.fetchUserNFTs(walletAddress);
        setUserNFTs(nfts);

        const roles = await nftService.fetchUserRoles(walletAddress);
        setUserRoles(roles);
      }
      else if (connectedWalletType === 'aptos' && moveNetwork === 'aptos') {
        const nfts = await aptosNFTService.fetchUserNFTs(walletAddress) as any[];
        setUserNFTs(nfts);

        const roles = await aptosNFTService.fetchUserRoles(walletAddress) as any;
        setUserRoles(roles);
      }
      else {
        setUserNFTs([]);
        setUserRoles(null);
      }
    } catch (error) {
      console.error("Failed to fetch NFT data:", error);

      setUserNFTs([]);
      setUserRoles(null);
    } finally {
      setIsLoadingNFTs(false);
    }
  }, [walletAddress, isConnected, isChainSupported, connectedWalletType, moveNetwork, nftService, cedraNFTService, aptosNFTService]);

  const triggerRoleRefresh = useCallback(() => {
    setRoleRefreshTrigger(prev => prev + 1);
  }, []);


  const refreshNFTDataWithRetry = useCallback(async (maxRetries = 3, delay = 2000) => {
    if (!walletAddress || !isConnected) return;

    setIsLoadingNFTs(true);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        let roles: any;
        let nfts: any[];

        if (connectedWalletType === 'cedra' && moveNetwork === 'cedra') {
          roles = await cedraNFTService.fetchUserRoles(walletAddress);
          nfts = await cedraNFTService.fetchUserNFTs(walletAddress);
        } else if (connectedWalletType === 'aptos' && moveNetwork === 'aptos') {
          roles = await aptosNFTService.fetchUserRoles(walletAddress);
          nfts = await aptosNFTService.fetchUserNFTs(walletAddress);
        } else if (connectedWalletType === 'evm') {
          roles = await nftService.fetchUserRoles(walletAddress);
          nfts = await nftService.fetchUserNFTs(walletAddress);
        } else {
          setUserRoles({ hasTrader: false, hasLiquidityProvider: false, hasHolder: false, count: 0, nfts: [] });
          setUserNFTs([]);
          setIsLoadingNFTs(false);
          return;
        }

        setUserRoles(roles);
        setUserNFTs(nfts);

        const roleCount = (roles.hasTrader ? 1 : 0) + (roles.hasLiquidityProvider ? 1 : 0) + (roles.hasHolder ? 1 : 0);
        const nftCount = nfts.length;

        if (roles && nftCount > 0 && nftCount === roleCount) {
          break;
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Failed to fetch NFT data on attempt ${attempt + 1}:`, error);
        if (attempt === maxRetries) {
          setUserRoles({ hasTrader: false, hasLiquidityProvider: false, hasHolder: false, count: 0, nfts: [] });
          setUserNFTs([]);
        }
      }
    }

    setIsLoadingNFTs(false);
  }, [walletAddress, isConnected, connectedWalletType, moveNetwork, nftService, cedraNFTService, aptosNFTService]);

  const hasRoleByCardId = useCallback((cardId: string): boolean => {
    if (!userRoles) return false;
    
    switch (cardId) {
      case 'trader':
        return userRoles.hasTrader;
      case 'provider':
        return userRoles.hasLiquidityProvider;
      case 'builder':
        return userRoles.hasHolder;
      default:
        return false;
    }
  }, [userRoles]);

  const hasAnyNFT = userNFTs.length > 0;
  const hasTraderRole = userRoles?.hasTrader ?? false;
  const hasLiquidityProviderRole = userRoles?.hasLiquidityProvider ?? false;
  const hasHolderRole = userRoles?.hasHolder ?? false;

  useEffect(() => {
    if (isConnected && walletAddress) {
      refreshNFTData();
    }
  }, [isConnected, walletAddress, chainId, moveNetwork, roleRefreshTrigger, refreshNFTData]);

  return (
    <NFTContext.Provider
      value={{
        userNFTs,
        userRoles,
        isLoadingNFTs,
        refreshNFTData,
        refreshNFTDataWithRetry,
        triggerRoleRefresh,
        hasRoleByCardId,
        hasAnyNFT,
        hasTraderRole,
        hasLiquidityProviderRole,
        hasHolderRole,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
}

export function useNFT() {
  const context = useContext(NFTContext);
  if (context === undefined) {
    throw new Error("useNFT must be used within a NFTProvider");
  }
  return context;
}