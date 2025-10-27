"use client";

import styles from "../WalletSidebar.module.scss";

interface NFTMintingStateProps {
  nftRole: {
    id: string;
    name: string;
    description: string;
  };
}

export default function NFTMintingState({ nftRole }: NFTMintingStateProps) {
  return (
    <div className={styles.nftInfoScreen}>
      
      <div className={styles.nftDetails}>
        <div className={styles.loadingIcon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14 6L12 10L10 6L12 2Z" fill="#01FE91"/>
            <path d="M12 14L14 18L12 22L10 18L12 14Z" fill="#01FE91" fillOpacity="0.3"/>
          </svg>
        </div>
        
        <h2 className={styles.nftTitle}>
          Minting Your Genesis NFT
        </h2>
        
        <p className={styles.nftDescription}>
          Please confirm the transaction in your wallet...
        </p>
        
        <div className={styles.mintingProgress}>
          <div className={styles.progressStep}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepText}>Confirming transaction</span>
          </div>
          <div className={styles.progressStep}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepText}>Minting NFT</span>
          </div>
          <div className={styles.progressStep}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepText}>Welcome to Genesis!</span>
          </div>
        </div>
      </div>
    </div>
  );
}