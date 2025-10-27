"use client";

import styles from "../WalletSidebar.module.scss";

interface NFTErrorScreenProps {
  mintError: string;
}

const getCustomErrorMessage = (error: string): string => {
  const errorLower = error.toLowerCase();

  if (errorLower.includes('max_supply_reached')) {
    return "All Genesis NFTs have been distributed!";
  }

  if (errorLower.includes('user rejected') || errorLower.includes('user denied') || errorLower.includes('cancelled')) {
    return "Transaction was cancelled. No worries, you can try again anytime.";
  }

  if (errorLower.includes('insufficient funds') || errorLower.includes('insufficient balance')) {
    return "Insufficient funds in your wallet. Please add more funds and try again.";
  }

  if (errorLower.includes('already have this role') || errorLower.includes('already minted')) {
    return "You already have this Genesis NFT! Check your wallet.";
  }

  if (errorLower.includes('petra') && errorLower.includes('cedra')) {
    return "Petra wallet doesn't support Cedra network. Please switch to Aptos network in your wallet or use Nightly wallet for Cedra.";
  }

  if (errorLower.includes('does not support') || errorLower.includes('unsupported network')) {
    return error;
  }

  if (errorLower.includes('switch to aptos') || errorLower.includes('switch back to aptos')) {
    return error;
  }

  if (errorLower.includes('network') || errorLower.includes('chain')) {
    return "Network issue detected. Please check your wallet network settings and try again.";
  }

  if (errorLower.includes('gas')) {
    return "Transaction failed due to gas issues. Try increasing gas limit.";
  }

  return "Something went wrong during minting. Please try again.";
};

export default function NFTErrorScreen({ mintError }: NFTErrorScreenProps) {
  const customMessage = getCustomErrorMessage(mintError);
  
  return (
    <div className={styles.nftInfoScreen}>
      
      <div className={styles.nftDetails}>
        <div className={styles.errorIcon}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="30" fill="rgba(255, 82, 82, 0.1)"/>
            <path d="M30 15L30 35M30 42L30 45" stroke="#FF5252" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h2 className={styles.nftTitle}>
          Oops! Something Went Wrong
        </h2>
        
        <p className={styles.nftDescription}>
          {customMessage}
        </p>
        
        <div className={styles.errorDetails}>
          <details className={styles.technicalDetails}>
            <summary>Technical details</summary>
            <p className={styles.technicalError}>{mintError}</p>
          </details>
        </div>
      </div>
    </div>
  );
}