"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getUserFriendlyErrorMessage, handleWalletError, extractWalletIdFromError } from "@/lib/wallet";
import styles from "../WalletSidebar.module.scss";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

interface WalletSelectionListProps {
  walletOptions: WalletOption[];
  selectedWallet: string | null;
  onWalletClick: (walletId: string) => void;
  error?: Error | null;
  onRetryConnection?: () => void;
}

export default function WalletSelectionList({
  walletOptions,
  selectedWallet,
  onWalletClick,
  error,
  onRetryConnection
}: WalletSelectionListProps) {
  const [isCheckingForWallet, setIsCheckingForWallet] = useState(false);

  const isNetworkWarning = (error: Error | null | undefined): boolean => {
    if (!error) return false;
    const msg = error.message.toLowerCase();
    return msg.includes('mainnet') || msg.includes('testnet') || msg.includes('switch to');
  };

  useEffect(() => {
    if (error?.message.toLowerCase().includes('not installed')) {
      setIsCheckingForWallet(true);
    } else {
      setIsCheckingForWallet(false);
    }
  }, [error]);

  const handleTryAgain = () => {
    const errorMessage = error?.message.toLowerCase() || '';

    if (errorMessage.includes('petra')) {
      localStorage.setItem('cedex_retry_wallet', 'petra');
    } else if (errorMessage.includes('metamask')) {
      localStorage.setItem('cedex_retry_wallet', 'metamask');
    } else if (errorMessage.includes('nightly')) {
      localStorage.setItem('cedex_retry_wallet', 'nightly');
    } else if (errorMessage.includes('pontem')) {
      localStorage.setItem('cedex_retry_wallet', selectedWallet || 'pontem');
    }

    localStorage.setItem('cedx_show_sidebar', 'true');

    window.location.reload();
  };

  const getErrorMessage = (error: Error) => {
    const walletId = extractWalletIdFromError(error.message);
    const walletError = handleWalletError(error, walletId || undefined, 'WalletSelectionList', { silent: true });
    const errorInfo = getUserFriendlyErrorMessage(walletError);
    const isWarning = isNetworkWarning(error);
    const messageClass = isWarning ? styles.warningMessageText : styles.errorMessageText;

    if (errorInfo.downloadUrl) {
      return (
        <>
          <div className={messageClass}>
            {errorInfo.message}
          </div>
          <div className={styles.errorActions}>
            <a
              href={errorInfo.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadLink}
            >
              Download here
            </a>
            <button
              onClick={handleTryAgain}
              className={styles.tryAgainButton}
            >
              Try Again
            </button>
          </div>
        </>
      );
    }

    const messageLines = errorInfo.message.split('\n');
    return (
      <div className={messageClass}>
        {messageLines.map((line: string, index: number) => (
          <p key={index} style={{ margin: index === 0 ? '0 0 10px 0' : '5px 0' }}>
            {line}
          </p>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className={styles.walletList}>
        {walletOptions.map((wallet) => {
          return (
            <button
              key={wallet.id}
              className={styles.walletOption}
              onClick={() => onWalletClick(wallet.id)}
            >
              <div className={styles.walletIconContainer}>
                <div className={styles.walletIcon}>
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={40}
                    height={40}
                  />
                </div>
              </div>
              <div className={styles.selectionIndicator}>
                <div className={styles.circle}>
                  {selectedWallet === wallet.id && <div className={styles.innerDot}></div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {error && (
        <div className={styles.connectionError}>
          <div className={styles.errorTitle}>
            {getErrorMessage(error)}
            {isCheckingForWallet && (
              <div className={styles.checkingStatus}>
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className={styles.checkingText}>Checking for wallet installation...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}