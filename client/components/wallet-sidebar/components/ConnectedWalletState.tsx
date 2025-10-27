"use client";

import Image from "next/image";
import styles from "../WalletSidebar.module.scss";
import Button from "../../common/Button";
import { truncateAddress } from "@/lib/wallet";
import { useWallet } from "../../../contexts/WalletProvider";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

interface ConnectedWalletStateProps {
  connectedAddress: string;
  selectedWallet: string;
  walletOptions: WalletOption[];
  onMintClick?: () => void;
  error?: Error | null;
}

export default function ConnectedWalletState({
  connectedAddress,
  selectedWallet,
  walletOptions,
  onMintClick,
  error
}: ConnectedWalletStateProps) {

  const { moveNetwork, selectedWalletId } = useWallet();

  // Network validation logic
  const isValidNetwork = (() => {
    if (selectedWalletId === 'petra') {
      return moveNetwork === 'aptos';
    }
    if (selectedWalletId === 'nightly') {
      return moveNetwork === 'aptos' || moveNetwork === 'cedra';
    }
    return true;
  })();

  const walletOption = walletOptions.find(w => w.id === selectedWallet);

  const isNetworkError = !isValidNetwork ||
                         error?.message?.toLowerCase().includes('network') ||
                         error?.message?.toLowerCase().includes('cedra') ||
                         error?.message?.toLowerCase().includes('does not support') ||
                         error?.message?.toLowerCase().includes('mainnet') ||
                         error?.message?.toLowerCase().includes('testnet');

  return (
    <div className={styles.connectedState}>
      <div className={styles.connectedWalletCard}>
        <div className={styles.walletIcon}>
          <Image
            src={walletOption?.icon || ""}
            alt={walletOption?.name || ""}
            width={60}
            height={60}
          />
        </div>
        <div className={styles.walletInfo}>
          <span className={styles.walletName}>
            {walletOption?.name || ""}
          </span>
          <span className={styles.walletAddress}>
            {truncateAddress(connectedAddress)}
          </span>
        </div>
      </div>

      {isNetworkError ? (
        <>
          <div className={styles.warningIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#FFB800" strokeWidth="2"/>
              <path d="M24 14V26M24 30V32" stroke="#FFB800" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.warningText}>
            {error?.message.split('\n').map((line, index) => (
              <p key={index} style={{ margin: index === 0 ? '0 0 10px 0' : '5px 0' }}>
                {line}
              </p>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#01FE91" strokeWidth="2"/>
              <path d="M16 24L21 29L32 18" stroke="#01FE91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className={styles.successText}>You&apos;re all set! Your wallet is connected.</p>
        </>
      )}
      
      {onMintClick && !isNetworkError && (
        <div className={styles.mintButtonContainer}>
          <Button
            text="Mint NFT"
            textColor="white"
            onClick={onMintClick}
          />
        </div>
      )}

      {onMintClick && isNetworkError && (
        <div className={styles.mintButtonContainer}>
          <Button
            text="Fix Network Issue"
            textColor="white"
            onClick={() => {}}
            disabled={true}
          />
        </div>
      )}
    </div>
  );
}