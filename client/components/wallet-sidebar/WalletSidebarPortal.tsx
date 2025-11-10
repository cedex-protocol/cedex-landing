"use client";

import { useMemo } from "react";
import { useConfig } from "wagmi";
import { useWallet } from "@/contexts/WalletProvider";
import { useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";
import { useUI } from "@/contexts/UIProvider";
import { EVMNFTService, CedraNFTService, AptosNFTService } from "@/lib/nft";
import { getWalletProvider, WALLET_IDS } from "@/lib/wallet";
import type { CedraProvider, WalletId } from "@/lib/wallet";
import WalletSidebar from "./WalletSidebar";

export default function WalletSidebarPortal() {
  const {
    isConnected,
    walletAddress,
    isConnecting,
    error,
    connectWallet,
    selectedWalletId,
    connectedWalletType,
    moveNetwork,
  } = useWallet();

  const aptosWalletAdapter = useAptosWallet();

  const {
    isSidebarOpen,
    nftMintInfo,
    closeWalletSidebar,
    markNFTMinted,
  } = useUI();

  const config = useConfig();
  const nftService = useMemo(() => new EVMNFTService(config), [config]);
  const cedraNFTService = useMemo(() => new CedraNFTService(), []);
  const aptosNFTService = useMemo(() => new AptosNFTService(), []);

  const getRoleFromId = (roleId: string): number => {
    const roleMapping: Record<string, number> = {
      'trader': 0,
      'provider': 1,
      'builder': 2
    };
    return roleMapping[roleId] ?? 0;
  };

  const handleWalletSelect = (walletId: string) => {
    const isValidWalletId = (id: string): id is WalletId => {
      return Object.values(WALLET_IDS).includes(id as WalletId);
    };

    if (isValidWalletId(walletId)) {
      connectWallet(walletId);
    }
  };

  return (
    <WalletSidebar
      isOpen={isSidebarOpen}
      onClose={closeWalletSidebar}
      onWalletSelect={handleWalletSelect}
      connectedAddress={walletAddress}
      isConnected={isConnected}
      selectedWalletId={selectedWalletId}
      isConnecting={isConnecting}
      error={error}
      nftMintMode={nftMintInfo?.nftMintMode}
      nftRole={nftMintInfo?.nftRole}
      onNFTMint={async () => {
        if (!nftMintInfo?.nftRole) {
          throw new Error("No NFT role specified");
        }

        const role = getRoleFromId(nftMintInfo.nftRole.id);

        let result;

        if (connectedWalletType === 'cedra' && moveNetwork === 'cedra') {
          const walletId = selectedWalletId === WALLET_IDS.ZEDRA ? WALLET_IDS.ZEDRA : WALLET_IDS.NIGHTLY;
          const provider = getWalletProvider(walletId) as CedraProvider;
          if (!provider) {
            throw new Error("Cedra wallet provider not found");
          }
          result = await cedraNFTService.mintNFT(role, provider);
        }
        else if (connectedWalletType === 'aptos' && moveNetwork === 'aptos') {

          if (selectedWalletId === 'pontem') {
            result = await aptosNFTService.mintNFTWithPontem(walletAddress, role);
          } else {
            result = await aptosNFTService.mintNFT(aptosWalletAdapter, role);
          }

          if (result.success) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        else if (connectedWalletType === 'evm') {
          result = await nftService.mintNFT(role);
        }
        else {
          throw new Error("Unsupported network");
        }

        if (!result.success) {
          throw new Error(result.error || "Minting failed");
        }

        markNFTMinted();
      }}
    />
  );
}
