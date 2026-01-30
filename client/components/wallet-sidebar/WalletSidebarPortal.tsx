"use client";

import { useMemo, useCallback } from "react";
import { useConfig } from "wagmi";
import { useWallet } from "@/contexts/WalletProvider";
import { useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";
import { useUI } from "@/contexts/UIProvider";
import { EVMNFTService, CedraNFTService, AptosNFTService } from "@/lib/nft";
import { WALLET_IDS } from "@/lib/wallet";
import type { CedraProvider } from "@/lib/wallet";
import { useCedraWalletStandard } from "@/lib/wallet/hooks/useCedraWalletStandard";
import WalletSidebar from "./WalletSidebar";

const ROLE_MAP: Record<string, number> = { trader: 0, provider: 1, builder: 2 };

export default function WalletSidebarPortal() {
  const {
    isConnected, walletAddress, isConnecting, error,
    connectWallet, selectedWalletId, connectedWalletType,
    connectedCedraWalletName,
  } = useWallet();

  const { availableCedraWallets } = useCedraWalletStandard();
  const aptosWallet = useAptosWallet();
  const { isSidebarOpen, nftMintInfo, closeWalletSidebar, markNFTMinted } = useUI();

  const config = useConfig();
  const evmService = useMemo(() => new EVMNFTService(config), [config]);
  const cedraService = useMemo(() => new CedraNFTService(), []);
  const aptosService = useMemo(() => new AptosNFTService(), []);

  const handleMint = useCallback(async () => {
    if (!nftMintInfo?.nftRole) throw new Error("No NFT role specified");

    const role = ROLE_MAP[nftMintInfo.nftRole.id] ?? 0;
    let result;

    if (connectedWalletType === 'cedra') {
      const wallet = availableCedraWallets.find(
        w => w.name.toLowerCase() === (connectedCedraWalletName || selectedWalletId).toLowerCase()
      );
      if (!wallet) throw new Error("Cedra wallet not found");
      result = await cedraService.mintNFT(role, wallet as CedraProvider);
    }
    else if (connectedWalletType === 'aptos') {
      result = selectedWalletId === WALLET_IDS.PONTEM
        ? await aptosService.mintNFTWithPontem(walletAddress, role)
        : await aptosService.mintNFT(aptosWallet, role);
    }
    else if (connectedWalletType === 'evm') {
      result = await evmService.mintNFT(role);
    }
    else {
      throw new Error("Unsupported network");
    }

    if (!result.success) throw new Error(result.error || "Minting failed");
    markNFTMinted();
  }, [
    nftMintInfo, connectedWalletType, availableCedraWallets,
    connectedCedraWalletName, selectedWalletId, walletAddress,
    aptosWallet, cedraService, aptosService, evmService, markNFTMinted
  ]);

  return (
    <WalletSidebar
      isOpen={isSidebarOpen}
      onClose={closeWalletSidebar}
      onWalletSelect={connectWallet}
      connectedAddress={walletAddress}
      isConnected={isConnected}
      selectedWalletId={selectedWalletId}
      isConnecting={isConnecting}
      error={error}
      nftMintMode={nftMintInfo?.nftMintMode}
      nftRole={nftMintInfo?.nftRole}
      onNFTMint={handleMint}
    />
  );
}
