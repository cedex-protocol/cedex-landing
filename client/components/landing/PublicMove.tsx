"use client";

import { useEffect, useRef } from "react";
import { Container, Section } from "../layout";
import styles from "./PublicMove.module.scss";

type ColumnData = {
  id: string;
  icon: string;
  title: string;
  content: {
    type: "list" | "description";
    items?: string[];
    text?: string;
  };
};

const columns: ColumnData[] = [
  {
    id: "boundaries",
    icon: "/images/public1.svg",
    title: "Minting The Future Of DeFi",
    content: {
      type: "list",
      items: [
        "10,000 Genesis NFTs",
        "Token airdrop allocation",
        "Revenue share from day one",
        "Boosted rewards that compound forever",
        "Your key to the inner circle",
      ],
    },
  },
  {
    id: "fair-launch",
    icon: "/images/public2.svg",
    title: "More Than An NFT",
    content: {
      type: "list",
      items: [
        "Soft liquidation insurance included",
        "Dark pool priority access",
        "Extra governance voting power",
        "Permanent protocol ownership rights",
      ],
    },
  },
  {
    id: "public-commons",
    icon: "/images/public3.svg",
    title: "Powered By The Future",
    content: {
      type: "description",
      text: "Leveraging Cedra's 160k TPS and Move infrastructure, we're building the most advanced perpetual trading platform in DeFi. Genesis holders don't just own an NFT - they own the revolution. Fair launch. No VCs. No presale. Just 10,000 builders creating the future together.",
    },
  },
];

export default function PublicMove() {
  const columnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = columnsRef.current;
    
    if (!section) {
      return;
    }

    const cards = section.querySelectorAll(`.${styles.column}`);
    
    cards.forEach((card, index) => {
      const cardElement = card as HTMLElement;
      if (index === 0) {
        cardElement.style.transform = 'translateY(0%)';
      } else if (index === 1) {
        cardElement.style.transform = 'translateY(55%)';
      } else if (index === 2) {
        cardElement.style.transform = 'translateY(100%)';
      }
    });

    const handleScroll = () => {
      const sectionRect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const isInView = sectionRect.top < windowHeight && sectionRect.bottom > 0;
      
      if (!isInView) {
        return;
      }
      
      const progress = Math.max(0, Math.min(1, (windowHeight - sectionRect.top) / (windowHeight * 0.61)));
      

      const cards = section.querySelectorAll(`.${styles.column}`);
      
      cards.forEach((card, index) => {
        const cardElement = card as HTMLElement;
        
        if (index === 0) {
          cardElement.style.transform = `translateY(0%)`;
        } else if (index === 1) {
          const yPosition = 55 * (1 - progress);
          cardElement.style.transform = `translateY(${yPosition}%)`;
        } else if (index === 2) {
          const yPosition = 100 * (1 - progress);
          cardElement.style.transform = `translateY(${yPosition}%)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Section
      id="revolution"
      className={styles.publicMoveSection}
      paddingTop="155px"
      paddingBottom="large"
    >
      <div className={styles.contentWrapper}>
        <Container>
          <div className={styles.content}>
            <div className={styles.textContent}>
              <h1 className={styles.title}>The Ownership Genesis</h1>
              <p className={styles.description}>
                10,000 Founding Memberships. One chance to own the
                infrastructure you trade on.
              </p>
            </div>
            <div className={styles.columnsContainer} ref={columnsRef}>
              {columns.map((column) => (
                <div key={column.id} className={styles.column}>
                  <div className={styles.upperContent}>
                    <div className={styles.columnIcon}>
                      <img src={column.icon} alt={column.title} />
                    </div>
                    <h3 className={styles.columnTitle}>{column.title}</h3>
                  </div>
                  <div className={styles.lowerContent}>
                    {column.content.type === "list" ? (
                      <ul className={styles.columnList}>
                        {column.content.items?.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.columnDescription}>
                        {column.content.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </Section>
  );
}
