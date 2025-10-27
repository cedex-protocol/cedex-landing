"use client";

import styles from "../WalletSidebar.module.scss";
import Button from "../../common/Button";

interface WelcomeScreenProps {
  connectedAddress?: string;
  onMintClick?: () => void;
  connectedWallet?: {
    id: string;
    name: string;
    icon: string;
  };
}

export default function WelcomeScreen({ connectedAddress, onMintClick, connectedWallet }: WelcomeScreenProps) {
  return (
    <div className={styles.welcomeScreen}>
      <div className={styles.welcomeContent}>
        <h2 className={styles.welcomeTitle}>
          Welcome, {connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : ''}
        </h2>
        
        <div className={styles.walletCard}>
          <div className={styles.walletAvatar}>
            <img
              src={connectedWallet?.icon || "/wallets-icon/metamask logo.png"}
              alt={connectedWallet?.name || "Wallet"}
            />
          </div>
          <span className={styles.walletAddressLarge}>
            {connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : ''}
          </span>
        </div>
        
        <div className={styles.verificationStatus}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="#01FE91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2L2 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="#01FE91" strokeWidth="2"/>
          </svg>
          <p>Your identity is verified. Preparing your Genesis NFT...</p>
        </div>
        
{onMintClick && (
          <div className={styles.mintButtonContainer}>
            <Button
              text="Mint NFT"
              textColor="white"
              onClick={onMintClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}