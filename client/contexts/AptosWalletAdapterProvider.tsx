"use client";

import React, { ReactNode } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

interface AptosProviderProps {
  children: ReactNode;
}

export function AptosProvider({ children }: AptosProviderProps) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.TESTNET,
        // Optional: Add API key if you have one
        // aptosApiKey: process.env.NEXT_PUBLIC_APTOS_API_KEY,
      }}
      onError={(error: Error) => {
        console.error("[AptosWalletAdapter] Error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
