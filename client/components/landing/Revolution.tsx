"use client";

import { Container } from "../layout";
import Button from "../common/Button";
import styles from "./Revolution.module.scss";

type CardData = {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
};

const cards: CardData[] = [
  {
    id: "card-1",
    number: "01",
    title: "They burn millions",
    description:
      "Traditional exchanges burn billions in fees, enriching themselves while traders lose. Centralized control. Hidden costs. Your money, their rules. It's time to break free from the old system that profits from your losses.",
    image: "/images/active1.svg",
  },
  {
    id: "card-2",
    number: "02",
    title: "We grow together",
    description:
      "CEDEX shares 100% of revenue with holders. Every trade generates rewards for the community. No middlemen. No hidden fees. Just transparent, decentralized trading where success is shared by all. Your growth is our growth.",
    image: "/images/active2.svg",
  },
  {
    id: "card-3",
    number: "03",
    title: "Owners don't leave",
    description:
      "This isn't another farm-and-dump protocol. When you hold CEDEX, you're not just investing - you're joining a movement. Revenue sharing. Governance rights. Growing rewards. The longer you stay, the more you earn.",
    image: "/images/active3.svg",
  },
];

export default function Revolution() {
  const handleJoin = () => {
    const entryChoiceSection = document.getElementById('entry-choices');
    if (entryChoiceSection) {
      entryChoiceSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.revolutionContainer}>
      <Container>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            The
            <br />
            Revolution
          </h1>
        </div>

        <div className={styles.cardsGrid}>
          {cards.map((card) => (
            <div key={card.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.number}>{card.number}</span>
                <h3 className={styles.cardTitle}>{card.title}</h3>
              </div>

              <div className={styles.imageWrapper}>
                <img src={card.image} alt={card.title} />
              </div>

              <p className={styles.description}>{card.description}</p>

              <div className={styles.buttonWrapper}>
                <Button
                  text="Join"
                  textColor="white"
                  hoverColor="primary"
                  onClick={handleJoin}
                />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}