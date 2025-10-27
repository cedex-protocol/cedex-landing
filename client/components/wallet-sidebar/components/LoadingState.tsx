"use client";

import Image from "next/image";
import styles from "../WalletSidebar.module.scss";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

interface LoadingStateProps {
  selectedWallet: string;
  walletOptions: WalletOption[];
}

export default function LoadingState({ selectedWallet, walletOptions }: LoadingStateProps) {
  
  const walletOption = walletOptions.find(w => w.id === selectedWallet);

  return (
    <div className={styles.loadingState}>
      <div className={styles.selectedWalletCard}>
        <div className={styles.walletIcon}>
          <Image 
            src={walletOption?.icon || ""} 
            alt={walletOption?.name || ""}
            width={40}
            height={40}
          />
        </div>
        <span className={styles.walletAddress}>
          Connecting...
        </span>
      </div>
      
      <div className={styles.loadingIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L14 6L12 10L10 6L12 2Z" fill="white"/>
          <path d="M12 14L14 18L12 22L10 18L12 14Z" fill="white" fillOpacity="0.3"/>
        </svg>
      </div>
      
      <p className={styles.loadingText}>Establishing secure connection...</p>
    </div>
  );
}