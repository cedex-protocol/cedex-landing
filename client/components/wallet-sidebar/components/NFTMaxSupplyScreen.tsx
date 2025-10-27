"use client";

import styles from "../WalletSidebar.module.scss";

export default function NFTMaxSupplyScreen() {
  return (
    <div className={styles.nftInfoScreen}>
      <div className={styles.nftDetails}>
        <div className={styles.successIcon}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="30" fill="rgba(255, 184, 0, 0.1)"/>
            <path d="M30 15L32 25L42 27L32 29L30 39L28 29L18 27L28 25L30 15Z" fill="#FFB800"/>
            <path d="M40 40L41 43L44 44L41 45L40 48L39 45L36 44L39 43L40 40Z" fill="#FFB800"/>
            <path d="M20 12L21 15L24 16L21 17L20 20L19 17L16 16L19 15L20 12Z" fill="#FFB800"/>
          </svg>
        </div>

        <h2 className={styles.nftTitle}>
          Wow! All Genesis NFTs Distributed!
        </h2>

        <p className={styles.nftDescription}>
          Congratulations! All Genesis NFTs have been successfully minted and distributed to the community.
          You were part of this exciting journey!
        </p>

        <div className={styles.maxSupplyInfo}>
          <p className={styles.maxSupplyText}>
            The maximum supply has been reached. Stay tuned for future NFT drops and opportunities!
          </p>
        </div>
      </div>
    </div>
  );
}
