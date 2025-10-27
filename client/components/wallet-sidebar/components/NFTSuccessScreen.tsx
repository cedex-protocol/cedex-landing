"use client";

import { useEffect } from "react";
import styles from "../WalletSidebar.module.scss";
import { useChainId } from "wagmi";
import { useNFTQuery } from "@/lib/nft/hooks/useNFTQuery";
import { useWallet } from "../../../contexts/WalletProvider";
import { getNFTCollectionURL, getMarketplaceName } from "@/lib/nft";

interface NFTSuccessScreenProps {
  onClose?: () => void;
  shouldRefresh?: boolean;
}

export default function NFTSuccessScreen({ onClose, shouldRefresh = true }: NFTSuccessScreenProps) {
  const chainId = useChainId();
  const { refetch } = useNFTQuery();
  const { aptosAddress, connectedWalletType } = useWallet();

  const networkType = connectedWalletType === 'cedra' ? 'cedra' : connectedWalletType === 'aptos' ? 'aptos' : 'evm';
  const explorerURL = getNFTCollectionURL({
    networkType,
    chainId,
    address: aptosAddress || '',
  });
  const marketplaceName = getMarketplaceName(networkType);

  useEffect(() => {
    if (!shouldRefresh) return;
    refetch();
  }, [refetch, shouldRefresh]);
  return (
    <div className={styles.nftInfoScreen}>
      <div className={styles.nftDetails}>
        <div className={styles.successIcon}>
          <img src="/images/Union.png" alt="Success" width="104" height="80" />
        </div>

        <h2 className={styles.nftTitle}>You Are Genesis!</h2>

        <p className={styles.nftDescription}>
          The markets will never be the same for you.<br />
          <span style={{fontSize: '12px', opacity: '0.7'}}>
            {networkType === 'evm'
              ? 'Your NFT will appear on OpenSea within a few minutes.'
              : `View your NFT on ${marketplaceName}.`
            }
          </span>
        </p>

        <div className={styles.successActions}>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); onClose?.(); }} className={styles.actionButton}>
            Enter Cedex →
          </a>
          <a
            href={process.env.NEXT_PUBLIC_SOCIAL_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
          >
            Join X
          </a>
          <a
            href={explorerURL || '#'}
            target={explorerURL ? '_blank' : undefined}
            rel={explorerURL ? 'noopener noreferrer' : undefined}
            className={styles.actionButton}
          >
            View on {marketplaceName}
          </a>
          <a
            href={process.env.NEXT_PUBLIC_SOCIAL_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
          >
            Join Discord
          </a>
        </div>
      </div>
    </div>
  );
}