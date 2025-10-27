"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNFTQuery } from "@/lib/nft/hooks/useNFTQuery";
import { useWallet } from "./WalletProvider";

interface NFTMintInfo {
  nftMintMode: boolean;
  nftRole: {
    id: string;
    name: string;
    description: string;
  };
}

interface UIContextType {
  isSidebarOpen: boolean;
  nftMintInfo?: NFTMintInfo;
  
  openWalletSidebar: (nftInfo?: NFTMintInfo) => void;
  closeWalletSidebar: () => void;
  setIsSidebarOpen: (value: boolean) => void;
  
  markNFTMinted: () => void;
  
  setPendingMintRole: (role: NFTMintInfo["nftRole"] | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [nftMintInfo, setNftMintInfo] = useState<NFTMintInfo | undefined>(undefined);
  const [wasMinted, setWasMinted] = useState(false);
  const [pendingMintRole, setPendingMintRoleState] = useState<NFTMintInfo["nftRole"] | null>(null);
  
  const { refetch } = useNFTQuery();
  const { isConnected } = useWallet();

  React.useEffect(() => {
    if (wasMinted) {
      refetch();
    }
  }, [wasMinted, refetch]);

  useEffect(() => {
    if (isConnected && pendingMintRole) {
      openWalletSidebar({
        nftMintMode: true,
        nftRole: pendingMintRole,
      });
      setPendingMintRoleState(null);
    }
  }, [isConnected, pendingMintRole]);

  const openWalletSidebar = (nftInfo?: NFTMintInfo) => {
    setNftMintInfo(nftInfo);
    setIsSidebarOpen(true);
  };

  const closeWalletSidebar = () => {
    setIsSidebarOpen(false);
    setNftMintInfo(undefined);

    if (wasMinted) {
      setWasMinted(false);
      refetch();
    }
  };
  
  const markNFTMinted = () => {
    setWasMinted(true);
  };

  const setPendingMintRole = (role: NFTMintInfo["nftRole"] | null) => {
    setPendingMintRoleState(role);
  };

  return (
    <UIContext.Provider
      value={{
        isSidebarOpen,
        nftMintInfo,
        openWalletSidebar,
        closeWalletSidebar,
        setIsSidebarOpen,
        markNFTMinted,
        setPendingMintRole,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}