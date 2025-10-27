'use client';

import styles from './TestnetBanner.module.scss';

export default function TestnetBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.icon}>ℹ️</span>
        <p className={styles.text}>
          Currently, all contracts are on testnets and will be updated to the mainnet soon! 
          Don&apos;t forget to mint Genesis NFT on Mainnets!
        </p>
      </div>
    </div>
  );
}