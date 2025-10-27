"use client";

import { Container, Section } from "../layout";
import Button from "../common/Button";
import { useUI } from "../../contexts/UIProvider";
import styles from "./Footer.module.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { openWalletSidebar } = useUI();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    if (targetId === 'connect-wallet') {
      openWalletSidebar();
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Section paddingTop="large" paddingBottom="50px" className={styles.footer}>
      <Container>
        <div className={styles.footerContent}>
          <div className={styles.footerMain}>
            <div className={styles.logoSection}>
              <div className={styles.logo}>
                <img
                  src="/images/Logo_horizontal.png"
                  alt="Cedex"
                  className={styles.logoImage}
                />
              </div>

              <div className={styles.subscribeSectionWrapper}>
                <div className={styles.subscribeSection}>
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    className={styles.emailInput}
                  />
                </div>
                <div className={styles.buttonWrapper}>
                  <Button text="Subscribe" textColor="white" hoverColor="teal" disabled />
                </div>
              </div>

              <p className={styles.privacyText}>
                By subscribing, you agree to our Privacy Policy and consent to
                receive updates from our Company.
              </p>
            </div>

            <div className={styles.navigationSection}>
              <nav className={styles.navigation}>
                <a href="#entry-choices" onClick={(e) => handleNavClick(e, 'entry-choices')}>Entry Choices</a>
                <a href="#revolution" onClick={(e) => handleNavClick(e, 'revolution')}>The Revolution</a>
                <a href="#mystery-features" onClick={(e) => handleNavClick(e, 'mystery-features')}>Mystery Features</a>
                <a href="#connect-wallet" onClick={(e) => handleNavClick(e, 'connect-wallet')}>Connect Wallet</a>
              </nav>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.copyright}>
              © {currentYear} Cedex. All rights reserved.
            </div>
            <div className={styles.legalLinks}>
              <a href="privacy">Privacy Policy</a>
              <a href="terms">Terms of Service</a>
              <a href="cookies">Cookie Settings</a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
