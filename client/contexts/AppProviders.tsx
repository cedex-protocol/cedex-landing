"use client";

import React, { ReactNode } from "react";
import { AptosProvider } from "./AptosWalletAdapterProvider";
import { WalletProvider } from "./WalletProvider";
import { NFTProvider } from "./NFTProvider";
import { UIProvider } from "./UIProvider";
import WalletSidebarPortal from "@/components/wallet-sidebar/WalletSidebarPortal";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AptosProvider>
      <WalletProvider>
        <NFTProvider>
          <UIProvider>
            {children}
            <WalletSidebarPortal />
          </UIProvider>
        </NFTProvider>
      </WalletProvider>
    </AptosProvider>
  );
}