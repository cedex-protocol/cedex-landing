"use client";

import styles from "../WalletSidebar.module.scss";

interface NFTRole {
  id: string;
  name: string;
  description: string;
}

interface NFTPreviewScreenProps {
  nftRole: NFTRole;
}

export default function NFTPreviewScreen({ 
  nftRole 
}: NFTPreviewScreenProps) {

  const getRoleAttributes = (roleId: string) => {
    const attributes: Record<string, any> = {
      trader: {
        rarity: "Genesis Era",
        tradingPower: "Maximum", 
        darkPoolAccess: "Unlimited",
        softLiquidationTier: "Priority",
      },
      provider: {
        rarity: "Genesis Era",
        yieldMultiplier: "2x Base",
        vaultAccess: "All Strategies", 
        riskProtection: "Maximum Shield",
      },
      builder: {
        rarity: "Genesis Era",
        votingPower: "3x Multiplier",
        revenueShare: "Founder Tie",
        proposalRights: "Unlimited",
      },
    };
    return attributes[roleId] || attributes['trader'];
  };

  const getRoleDescription = (roleId: string) => {
    const descriptions: Record<string, string> = {
      trader: "Where liquidations are soft. Where whales swim in darkness. Where the best strategies are shared.",
      provider: "Your liquidity, professionally managed. Vaults that adapt to market conditions. Yields that compound while you sleep.", 
      builder: "Your liquidity, professionally managed. Vaults that adapt to market conditions. Yields that compound while you sleep.",
    };
    return descriptions[roleId] || descriptions['trader'];
  };

  return (
    <div className={styles.nftInfoScreen}>
      
      {/* <div className={styles.nftImageContainer}>
        <img 
          src={`/images/${nftRole.id}-nft.png`} 
          alt={`${nftRole.name} NFT`}
          className={styles.nftImage}
          onError={(e) => {
            // Fallback якщо зображення не знайдено
            (e.target as HTMLImageElement).style.display = 'none';
            const placeholder = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
            if (placeholder) {
              placeholder.style.display = 'block';
            }
          }}
        />
        {/* Fallback placeholder */}
        {/* <div className={styles.nftImagePlaceholder} style={{display: 'none'}}>
          <span>NFT Image</span>
        </div>
      </div> */}
      
      <div className={styles.nftDetails}>
        <h2 className={styles.nftTitle}>
          Your Genesis {nftRole.name} NFT<br />
          Awaits
        </h2>
        
        <div className={styles.nftSubtitle}>
          Genesis {nftRole.name.charAt(0).toUpperCase() + nftRole.name.slice(1)}
        </div>
        
        <p className={styles.nftDescription}>
          {getRoleDescription(nftRole.id)}
        </p>
        
        <div className={styles.nftAttributes}>
          <div className={styles.attributeColumn}>
            {Object.keys(getRoleAttributes(nftRole.id)).map((key) => (
              <div key={key} className={styles.attributeKey}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            ))}
          </div>
          <div className={styles.attributeColumn}>
            {Object.entries(getRoleAttributes(nftRole.id)).map(([key, value]) => (
              <div key={key} className={styles.attributeValue}>
                {String(value)}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.nftGas}>
          <span>Free mint for founders</span>
        </div>
      </div>
    </div>
  );
}