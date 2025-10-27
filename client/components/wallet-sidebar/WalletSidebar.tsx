"use client";

import React, { useEffect, useState } from "react";
import { useScrollLock } from "../../hooks/useScrollLock";
import Image from "next/image";
import styles from "./WalletSidebar.module.scss";
import WelcomeScreen from "./components/WelcomeScreen";
import NFTPreviewScreen from "./components/NFTPreviewScreen";
import NFTSuccessScreen from "./components/NFTSuccessScreen";
import NFTErrorScreen from "./components/NFTErrorScreen";
import NFTMaxSupplyScreen from "./components/NFTMaxSupplyScreen";
import NFTMintingState from "./components/NFTMintingState";
import ConnectedWalletState from "./components/ConnectedWalletState";
import LoadingState from "./components/LoadingState";
import WalletSelectionList from "./components/WalletSelectionList";
import NFTInfoScreen from "./components/NFTInfoScreen";
import Button from "../common/Button";
import { useWallet } from "../../contexts/WalletProvider";
import { useNFTQuery } from "@/lib/nft/hooks/useNFTQuery";
import { truncateAddress, useWalletDetection } from "@/lib/wallet";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  selected?: boolean;
}

interface WalletSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect: (walletId: string) => void;
  connectedAddress?: string;
  isConnected?: boolean;
  selectedWalletId?: string;
  isConnecting?: boolean;
  error?: Error | null;
  nftMintMode?: boolean;
  nftRole?: {
    id: string;
    name: string;
    description: string;
  };
  onNFTMint?: () => Promise<void> | void;
}

const walletOptions: WalletOption[] = [
  { id: "nightly", name: "Nightly", icon: "/wallets-icon/Nightly logo.svg" },
  { id: "petra", name: "Petra", icon: "/wallets-icon/petra.avif" },
  { id: "pontem", name: "Pontem", icon: "/wallets-icon/pontem.svg" },
  { id: "metamask", name: "MetaMask", icon: "/wallets-icon/metamask logo.png" },
];

export default function WalletSidebar({
  isOpen,
  onClose,
  onWalletSelect,
  connectedAddress,
  isConnected,
  selectedWalletId,
  isConnecting,
  error,
  nftMintMode,
  nftRole,
  onNFTMint
}: WalletSidebarProps) {
  const { retryConnection, disconnectWallet, moveNetwork, selectedWalletId: contextWalletId } = useWallet();
  const { detectedWallet, isCorrectWallet } = useWalletDetection();

  const isNetworkValid = (() => {
    if (contextWalletId === 'petra') {
      return moveNetwork === 'aptos';
    }
    if (contextWalletId === 'nightly') {
      return moveNetwork === 'aptos' || moveNetwork === 'cedra';
    }
    return true;
  })();

  const networkError = !isNetworkValid && contextWalletId === 'petra' && moveNetwork === 'cedra'
    ? 'Petra wallet does not support Cedra network. Please switch back to Aptos network or use Nightly wallet for Cedra.'
    : null;
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [mintingState, setMintingState] = useState<'preview' | 'minting' | 'success' | 'error' | 'max_supply'>('preview');
  const [mintError, setMintError] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [actuallyMinted, setActuallyMinted] = useState(false);
  const { userNFTs, userRoles, refetch } = useNFTQuery();

  const hasAnyNFT = userNFTs.length > 0 ||
    (userRoles && (userRoles.hasTrader || userRoles.hasLiquidityProvider || userRoles.hasHolder));

  const getConnectedWallet = () => {
    if (!isConnected) return null;

    const walletId = selectedWalletId || detectedWallet;
    if (walletId && walletId !== 'none') {
      return walletOptions.find(w => w.id === walletId);
    }

    return null;
  };

  const connectedWallet = getConnectedWallet();

  useEffect(() => {
    if (isConnected && !isCorrectWallet) {
      console.warn('[WalletSidebar] Wallet mismatch detected!', {
        selected: selectedWalletId,
        detected: detectedWallet,
      });
    }
  }, [isConnected, isCorrectWallet, selectedWalletId, detectedWallet]);

  useEffect(() => {
    if (isConnected && !isNetworkValid && networkError) {
      console.warn('[WalletSidebar] Network validation failed:', networkError);
    }
  }, [isConnected, isNetworkValid, networkError]);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      if (selectedWalletId) {
        setSelectedWallet(selectedWalletId);
      } else if (!isConnected) {
        setSelectedWallet(null);
      }

      if (isConnected && !nftMintMode && !isConnecting && !error) {
        setShowWelcome(true);
      }

      if (error) {
        setShowWelcome(false);
      }
    } else {
      setShowWelcome(false);
    }
  }, [isOpen, isConnected, selectedWalletId, nftMintMode, isConnecting, error]);

  const convertedUserNFTs = (userNFTs || []).map(nft => ({
    role: nft.role,
    name: nft.roleName,
    id: nft.role === 0 ? 'trader' : nft.role === 1 ? 'provider' : 'builder',
    tokenId: nft.tokenId,
    image: nft.image,
    metadata: nft.metadata
  }));

  const handleWalletClick = (walletId: string) => {
    setSelectedWallet(walletId);
    onWalletSelect(walletId);
  };

  const handleClaimNFT = async () => {
    if (!onNFTMint) return;

    setMintingState('minting');
    setActuallyMinted(false);
    try {
      await onNFTMint();
      setMintingState('success');
      setActuallyMinted(true);

      refetch();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setMintError(errorMessage);

      if (errorMessage.includes('MAX_SUPPLY_REACHED')) {
        setMintingState('max_supply');
      } else {
        setMintingState('error');
      }
    }
  };

  const handleTryAgain = () => {
    setMintingState('preview');
    setMintError('');
  };

  const handleDisconnect = () => {
    disconnectWallet();
    handleClose();
  };

  const handleMintClick = () => {
    handleClose();

    requestAnimationFrame(() => {
      const entryChoicesElement = document.getElementById('entry-choices');
      if (entryChoicesElement) {
        entryChoicesElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  };

  const handleClose = () => {
    setIsClosing(true);

    const cleanup = () => {
      onClose();
      setIsClosing(false);
      setMintingState('preview');
      setMintError('');
      setSelectedWallet(null);
      setActuallyMinted(false);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(cleanup);
    });
  };

  if (!isOpen && !isClosing) return null;


  return (
    <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} onClick={handleClose}>
      <div className={`${styles.sidebar} ${isClosing ? styles.closing : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sidebarHeader}>
          <button className={styles.closeButton} onClick={handleClose}>
            <Image 
              src="/icons/arrow-right.png" 
              alt="Close"
              width={24}
              height={24}
            />
          </button>
          {isConnected && connectedAddress && (showWelcome || hasAnyNFT || nftMintMode) && (
            <div className={styles.walletAddressHeader}>
              <span>{truncateAddress(connectedAddress)}</span>
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.mainContent}>

            {showWelcome && isConnected && !nftMintMode ? (
              hasAnyNFT ? (
                <NFTInfoScreen 
                  userNFTs={convertedUserNFTs}
                />
              ) : (
                <WelcomeScreen
                  connectedAddress={connectedAddress}
                  onMintClick={handleMintClick}
                  connectedWallet={connectedWallet || undefined}
                />
              )
            ) :
            nftMintMode && isConnected && nftRole ? (
              <>
                {mintingState === 'preview' && (
                  <NFTPreviewScreen 
                    nftRole={nftRole}
                  />
                )}
                
                {mintingState === 'minting' && (
                  <NFTMintingState 
                    nftRole={nftRole}
                  />
                )}
                
                {mintingState === 'success' && (
                  <NFTSuccessScreen onClose={handleClose} shouldRefresh={actuallyMinted} />
                )}

                {mintingState === 'max_supply' && (
                  <NFTMaxSupplyScreen />
                )}

                {mintingState === 'error' && (
                  <NFTErrorScreen
                    mintError={mintError}
                  />
                )}
              </>
            ) : !showWelcome ? (
              <>
                <h2 className={styles.title}>
                  {isConnected ? "Wallet Connected" : "Link Your Identity"}
                </h2>
                <p className={styles.subtitle}>
                  {isConnected ? "Successfully connected to Cedex ecosystem" : "Connect your wallet to enter the Cedex ecosystem"}
                </p>
              </>
            ) : null}

            {isConnected && connectedAddress && !showWelcome && !nftMintMode ? (
              <ConnectedWalletState
                connectedAddress={connectedAddress}
                selectedWallet={selectedWallet || 'metamask'}
                walletOptions={walletOptions}
                onMintClick={handleMintClick}
                error={error}
              />
            ) : isConnecting && selectedWallet ? (
              <LoadingState 
                selectedWallet={selectedWallet}
                walletOptions={walletOptions}
              />
            ) : !showWelcome && !nftMintMode ? (
              <WalletSelectionList
                walletOptions={walletOptions}
                selectedWallet={selectedWallet}
                onWalletClick={handleWalletClick}
                error={error}
                onRetryConnection={retryConnection}
              />
            ) : null}
          </div>

          <div className={styles.cancelButtonWrapper}>
            {nftMintMode && isConnected && nftRole ? (
              <>
                {mintingState === 'preview' && (
                  <Button
                    text="Claim Your Genesis NFT"
                    onClick={handleClaimNFT}
                    textColor="white"
                    hoverColor="primary"
                  />
                )}
                {mintingState === 'minting' && (
                  <button className={styles.mintingButton} disabled>
                    <div className={styles.buttonLoader}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L14 6L12 10L10 6L12 2Z" fill="white"/>
                        <path d="M12 14L14 18L12 22L10 18L12 14Z" fill="white" fillOpacity="0.3"/>
                      </svg>
                    </div>
                    Minting NFT...
                  </button>
                )}
                {mintingState === 'error' && (
                  <Button
                    text="Try Again"
                    onClick={handleTryAgain}
                    textColor="white"
                    hoverColor="primary"
                  />
                )}
                {mintingState === 'success' && (
                  <button className={styles.cancelButton} onClick={handleDisconnect}>
                    Disconnect
                  </button>
                )}
              </>
            ) : isConnected ? (
              <button className={styles.cancelButton} onClick={handleDisconnect}>
                Disconnect
              </button>
            ) : (
              <button className={styles.cancelButton} onClick={handleClose}>
                Back to main page
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}