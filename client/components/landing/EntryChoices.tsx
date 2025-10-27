"use client";

import { useState, useCallback, useEffect } from "react";
import { Container, Section } from "../layout";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useUI } from "../../contexts/UIProvider";
import { useNFTData } from "@/lib/nft/hooks/useNFTData";
import styles from "./EntryChoices.module.scss";

type CardData = {
  id: string;
  role: string;
  image: string;
  alt: string;
  vectorClass: string;
  description: string;
  modal: {
    title: string;
    description: string;
    icon: string;
    benefits: {
      title: string;
      description: string;
    }[];
    exclusiveNote: string;
  };
};

const cards: CardData[] = [
  {
    id: "trader",
    role: "I Trade",
    image: "/images/trader.svg",
    alt: "Trader",
    vectorClass: "vectorTrade",
    description:
      "Where liquidations are soft. Where <br />whales swim in darkness. Where the <br />best strategies are shared.",
    modal: {
      title: "The Path of the Trader",
      description:
        "You've chosen to join the elite traders of Cedex. Your Genesis Trader NFT grants you powers others can only dream of",
      icon: "/images/icon1.svg",
      benefits: [
        {
          title: "Soft <br />Liquidation <br />Shield",
          description: "Your positions <br />get protected <br />before others",
        },
        {
          title: "Dark Pool <br />Access",
          description: "Trade invisibly <br />when size matters",
        },
        {
          title: "Alpha <br />Channel",
          description: "Copy strategies <br />from the best <br />performers",
        },
        {
          title: "Priority <br />Execution",
          description:
            "Your orders <br />process first in <br /> volatile markets",
        },
      ],
      exclusiveNote: "Only Genesis Traders see the full depth of our vaults.",
    },
  },
  {
    id: "provider",
    role: "I Provide",
    image: "/images/provider.svg",
    alt: "Provider",
    vectorClass: "vectorProvide",
    description:
      "Sustainable yields from real trading volume. <br />Professional vault strategies. <br />Time-weighted rewards that compound.",
    modal: {
      title: "The Path of the Provider",
      description:
        "You've chosen to fuel the Cedex ecosystem. Your Genesis Provider NFT unlocks yields that compound exponentially",
      icon: "/images/icon2.svg",
      benefits: [
        {
          title: "Vault <br />Selection <br />Priority",
          description: "First access to <br />new vault <br />strategies",
        },
        {
          title: "Boosted APY <br />Multiplier",
          description: "Start with 2x <br />rewards from day <br />one",
        },
        {
          title: "Risk Shield <br />Protection",
          description: "Your capital gets <br />protected first",
        },
        {
          title: "Compound <br />Accelerator",
          description: "Auto-compound <br />with zero fees",
        },
      ],
      exclusiveNote: "Genesis Providers earn while others learn",
    },
  },
  {
    id: "builder",
    role: "I Build",
    image: "/images/builder.svg",
    alt: "Builder",
    vectorClass: "vectorBuild",
    description:
      "Open-source infrastructure. <br />Composable liquidity. <br />A community that ships together.",
    modal: {
      title: "The Path of the Builder",
      description:
        "You've chosen to shape Cedex's destiny. Your Genesis Builder NFT makes you a founding architect of our future",
      icon: "/images/icon3.svg",
      benefits: [
        {
          title: "Revenue Share <br />Rights",
          description: "Earn from every <br />trade on the <br />platform",
        },
        {
          title: "Proposal <br />Power",
          description: "Your votes count <br />3x in governance",
        },
        {
          title: "Treasury <br />Access",
          description:
            " Participate in <br />treasury <br />allocation <br />decisions",
        },
        {
          title: "Feature <br />Priority",
          description: "Your requested <br />features get <br />built first",
        },
      ],
      exclusiveNote:
        "Genesis Builders don't just use the protocol - they own it",
    },
  },
];

export default function EntryChoices() {
  const [activeCard, setActiveCard] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<CardData["modal"] | null>(
    null
  );
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [hasRole, setHasRole] = useState(false);

  const { openWalletSidebar, setPendingMintRole } = useUI();
  const { isConnected, walletAddress, isLoadingNFTs, hasRoleByCardId } =
    useNFTData();

  const isChecking = isConnected && walletAddress && selectedCardId && isLoadingNFTs;

  useEffect(() => {
    if (!isConnected || !walletAddress || !selectedCardId) {
      setHasRole(false);
      return;
    }
    if (isLoadingNFTs) return;
    
    setHasRole(hasRoleByCardId(selectedCardId));
  }, [isConnected, walletAddress, selectedCardId, hasRoleByCardId, isLoadingNFTs]);

  const handleCardClick = (index: number) => {
    setActiveCard(index);
  };

  const handleSelectClick = (index: number) => {
    setModalContent(cards[index].modal);
    setSelectedCardId(cards[index].id);
    setHasRole(false);
    setIsModalOpen(true);
    
    if (isConnected && walletAddress && !isLoadingNFTs) {
      const cardId = cards[index].id;
      setHasRole(hasRoleByCardId(cardId));
    }
  };

  const handleConnectWallet = useCallback(() => {
    if (isChecking) return;

    const selectedCard = cards.find((c) => c.id === selectedCardId);
    if (!selectedCard) return;

    if (!isConnected) {
      setPendingMintRole({
        id: selectedCard.id,
        name: selectedCard.role,
        description: selectedCard.description,
      });
      openWalletSidebar();
    } else {
      openWalletSidebar({
        nftMintMode: true,
        nftRole: {
          id: selectedCard.id,
          name: selectedCard.role,
          description: selectedCard.description,
        },
      });
    }

    requestAnimationFrame(() => {
      setIsModalOpen(false);
    });
  }, [isChecking, isConnected, selectedCardId, openWalletSidebar, setPendingMintRole]);

  return (
    <Section
      id="entry-choices"
      className={styles.entryChoicesSection}
      paddingTop="none"
      paddingBottom="none"
    >
      <div className={styles.contentWrapper}>
        <Container>
          <div className={styles.content}>
            <div className={styles.textContent}>
              <div className={styles.upperContent}>
                <h1 className={styles.title}>
                  Entry <br className={styles.desktopBreak} />
                  Choices
                </h1>
              </div>
              <div className={styles.lowerContent}>
                <h2>
                  What brings you <br className={styles.desktopBreak} /> here?
                </h2>
                <p>Hover and select an option below</p>
              </div>
            </div>
            <div className={styles.cardContainer}>
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className={styles.cardWrapper}
                  onClick={() => handleCardClick(index)}
                >
                  <div
                    className={`${styles.card} ${
                      activeCard === index ? styles.active : ""
                    }`}
                  >
                    <div className={styles.cardFront}>
                      <p className={styles.cardRole}>{card.role}</p>
                      <img
                        src={card.image}
                        alt={card.alt}
                        className={styles.cardImage}
                      />
                      <img
                        src={card.image}
                        alt={card.alt}
                        className={styles.cardImageMobile}
                      />
                    </div>
                    <div className={styles.cardBack}>
                      <div
                        className={`${styles.vectorImage} ${
                          styles[card.vectorClass]
                        }`}
                      ></div>
                      <h3>{card.role}</h3>
                      <p
                        dangerouslySetInnerHTML={{ __html: card.description }}
                      />
                      <div
                        className={styles.buttonWrapper}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectClick(index);
                        }}
                      >
                        <Button
                          text="Select"
                          textColor="dark"
                          disableHover={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {modalContent && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <img src={modalContent.icon} alt={modalContent.title} />
              </div>
              <div className={styles.modalHeaderText}>
                <h2 className={styles.modalTitle}>{modalContent.title}</h2>
                <p className={styles.modalDescription}>
                  {modalContent.description}
                </p>
              </div>
            </div>

            <div className={styles.benefitsGrid}>
              {modalContent.benefits.map((benefit, index) => (
                <div key={index} className={styles.benefitCard}>
                  <h4 dangerouslySetInnerHTML={{ __html: benefit.title }} />
                  <p
                    dangerouslySetInnerHTML={{ __html: benefit.description }}
                  />
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.exclusiveNote}>
                <img
                  src="/images/special.svg"
                  alt="special"
                  className={styles.starIcon}
                />
                <span>{modalContent.exclusiveNote}</span>
              </div>

              {!hasRole ? (
                <div
                  style={{
                    pointerEvents: isChecking ? "none" : "auto",
                  }}
                  aria-disabled={isChecking || undefined}
                >
                  <Button
                    text={
                      isChecking ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Checking
                          <span className={styles.loadingDots}>
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>
                        </span>
                      ) : isConnected
                        ? "Mint NFT"
                        : "Connect Wallet to Claim"
                    }
                    textColor="dark"
                    disableHover={true}
                    onClick={isChecking ? undefined : handleConnectWallet}
                  />
                </div>
              ) : (
                <div className={styles.alreadyMinted}>
                  <span>You already own this Genesis NFT</span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </Section>
  );
}
