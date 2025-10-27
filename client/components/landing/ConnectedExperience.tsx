"use client";

import { Container, Section } from "../layout";
import Button from "../common/Button";
import { useWallet } from "../../contexts/WalletProvider";
import { useUI } from "../../contexts/UIProvider";
import styles from "./ConnectedExperience.module.scss";


export default function ConnectedExperience() {
  const { isConnected } = useWallet();
  const { openWalletSidebar } = useUI();

  const handleBeginJourney = () => {
    if (isConnected) {
      const element = document.getElementById('entry-choices');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      openWalletSidebar();
    }
  };

  return (
    <Section paddingTop="none" paddingBottom="large" className={styles.connectedExperienceSection}>
      <Container>
        <div className={styles.backgroundContainer}>
          <div className={styles.content}>
            <h2 className={styles.title}>
              Connected <br /> Experience
            </h2>
          </div>
          <div className={styles.buttonContainer}>
            <Button 
              text="Begin Your Journey" 
              textColor="dark" 
              onClick={handleBeginJourney}
              disableHover={true}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
