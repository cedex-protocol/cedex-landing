"use client";

import { useState, useEffect } from "react";
import styles from "../WalletSidebar.module.scss";
import { getEVMContractAddress, getNFTAssetURL, getMarketplaceName, useNFTImages } from "@/lib/nft";
import { useChainId } from "wagmi";
import { useWallet } from "../../../contexts/WalletProvider";

interface NFTData {
  role: number;
  name: string;
  id: string;
  tokenId?: string;
  image?: string;
  metadata?: any;
}

interface NFTInfoScreenProps {
  userNFTs: NFTData[];
}

export default function NFTInfoScreen({ userNFTs }: NFTInfoScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const currentNFT = userNFTs[currentIndex] || { role: 0, name: 'Trader', id: 'trader' };
  const hasMultipleNFTs = userNFTs.length > 1;

  const chainId = useChainId();
  const { aptosAddress, cedraAddress, connectedWalletType } = useWallet();
  const contractAddress = getEVMContractAddress(chainId);
  const { getImageForNFT } = useNFTImages();

  const networkType = connectedWalletType === 'cedra' ? 'cedra' : connectedWalletType === 'aptos' ? 'aptos' : 'evm';

  const walletAddress = networkType === 'cedra' ? cedraAddress :
                        networkType === 'aptos' ? aptosAddress :
                        contractAddress;

  const explorerURL = getNFTAssetURL({
    networkType,
    chainId,
    address: walletAddress || '',
    tokenId: currentNFT.tokenId,
  });
  const marketplaceName = getMarketplaceName(networkType);

  const getTwitterShareURL = () => {
    const baseURL = "https://twitter.com/intent/tweet";
    const text = `Just minted my Genesis ${currentNFT.name} NFT #${currentNFT.tokenId || '1'} on @CedexTrade! 🚀\n\nJoin the Genesis Era of decentralized trading 💎`;
    const hashtags = "CedexTrade,GenesisNFT,DeFi,Web3";

    const nftURL = explorerURL || process.env.NEXT_PUBLIC_WEBSITE_URL || '';

    const params = new URLSearchParams({
      text: text,
      hashtags: hashtags,
      url: nftURL
    });

    return `${baseURL}?${params.toString()}`;
  };

  
  useEffect(() => {
    if (!hasMultipleNFTs) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === userNFTs.length - 1 ? 0 : prev + 1));
    }, 10000);

    return () => clearInterval(interval);
  }, [hasMultipleNFTs, userNFTs.length]);
  
  const handlePrevious = () => {
    setImageLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? userNFTs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setImageLoading(true);
    setCurrentIndex((prev) => (prev === userNFTs.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setImageLoading(true);
    setCurrentIndex(index);
  };

  useEffect(() => {
    setImageLoading(true);
  }, [currentIndex]);

  const nftImage = currentNFT.image;

  return (
    <div className={styles.nftInfoScreen}>

      <div className={styles.nftImageContainer}>
        {hasMultipleNFTs && nftImage && !imageLoading && (
          <button className={styles.sliderArrow} onClick={handlePrevious}>
            &#8249;
          </button>
        )}

        {(!nftImage || imageLoading) && (
          <div className={styles.imageLoader}>
            <div className={styles.spinner}></div>
          </div>
        )}

        {nftImage && (
          <img
            src={nftImage}
            alt={`${currentNFT.name} NFT`}
            className={styles.nftImage}
            style={{ display: imageLoading ? 'none' : 'block' }}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              const currentSrc = (e.target as HTMLImageElement).src;

              if (currentNFT.image && currentNFT.image.includes('gateway.pinata.cloud')) {
                const ipfsHash = currentNFT.image.split('/').pop();
                const altGateway = `https://ipfs.io/ipfs/${ipfsHash}`;
                (e.target as HTMLImageElement).src = altGateway;
              } else if (currentSrc.includes('ipfs.io')) {
                const ipfsHash = currentSrc.split('/').pop();
                const cloudflareGateway = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
                (e.target as HTMLImageElement).src = cloudflareGateway;
              } else {
                setImageLoading(false);
              }
            }}
          />
        )}

        {hasMultipleNFTs && nftImage && !imageLoading && (
          <button className={styles.sliderArrow} onClick={handleNext}>
            &#8250;
          </button>
        )}
      </div>

      {hasMultipleNFTs && nftImage && !imageLoading && (
        <div className={styles.sliderDots}>
          {userNFTs.map((_, index) => (
            <div key={index} className={styles.dotContainer}>
              <button
                className={`${styles.sliderDot} ${index === currentIndex ? styles.activeBar : ''}`}
                onClick={() => handleDotClick(index)}
              >
              </button>
            </div>
          ))}
        </div>
      )}

      {nftImage && !imageLoading && (
        <div className={styles.nftDetails}>
          <h2 className={styles.nftSliderTitle}>
            Genesis {currentNFT.name} NFT #{currentNFT.tokenId || '1'}
          </h2>

          <div className={styles.nftActions}>
            <a
              href={explorerURL || '#'}
              target={explorerURL ? '_blank' : undefined}
              rel={explorerURL ? 'noopener noreferrer' : undefined}
              className={styles.openSeaButton}
            >
              View on {marketplaceName} →
            </a>

            <div className={styles.socialActions}>
              <a
                href={getTwitterShareURL()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.twitterButton}
              >
                Share on X →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}