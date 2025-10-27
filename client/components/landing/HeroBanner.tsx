'use client';

import Button from '../common/Button';
import TestnetBanner from '../common/TestnetBanner';
import VideoBackground from '../common/VideoBackground';
import { Container, Section } from '../layout';
import styles from './HeroBanner.module.scss';

export default function HeroBanner() {
  const handleDiscoverMore = () => {
    const element = document.getElementById('entry-choices');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <Section
      className={styles.heroSection}
      paddingTop="large"
      paddingBottom="300px"
    >
      <VideoBackground
        src="/videos/hero-bg.mp4"
        srcLowQuality="/videos/hero-bg-light.mp4"
        poster="/images/main-bg.png"
        mobileImage="/images/main-bg.png"
        className={styles.videoBackground}
      />

      <TestnetBanner />
      
      <div className={styles.contentWrapper}>
        <Container>
          <div className={styles.content}>
            <h1 className={styles.title}>
              The First
              <br />
              Co-Owned Perpetual
              <br />
              vaults
              <span className={`${styles.whiteText} ${styles.italicText}`}>
                {" "}
                on Cedra
              </span>
            </h1>

            <p className={styles.description}>
              Trade perpetuals powered by CLOB and professional vaults. 10,000
              Genesis NFTs - your key to token allocation and protocol
              ownership. Build the future of DeFi on Cedra.
            </p>

            <Button
              text=" Mint now"
              textColor="white"
              hoverColor="primary"
              onClick={handleDiscoverMore}
            />
          </div>
        </Container>
      </div>
    </Section>
  );
}