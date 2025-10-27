"use client";

import { useState } from "react";
import { Container, Section } from "../layout";
import Button from "../common/Button";
import styles from "./MysteryFeatures.module.scss";

const tabs = [
  {
    id: "soft-liquidations",
    label: "Soft Liquidations",
    content: {
      title: "A $100K position saved Jimmy $47,000 last week",
    },
  },
  {
    id: "dark-pools",
    label: "Dark Pools",
    content: {
      title: "Execute large trades without market impact",
    },
  },
  {
    id: "time-amplifier",
    label: "Time Amplifier",
    content: {
      title: "Maximize your time efficiency in trading",
    },
  },
];

export default function MysteryFeatures() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleLearnSecret = () => {
    const entryChoiceSection = document.getElementById('entry-choices');
    if (entryChoiceSection) {
      entryChoiceSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <Section
      id="mystery-features"
      className={styles.mysteryFeaturesSection}
      paddingTop="large"
      paddingBottom="large"
    >
      <div className={styles.contentWrapper}>
        <Container>
          <div className={styles.content}>
            <div className={styles.textContent}>
              <h1 className={styles.title}>
                Mystery <br /> Features
              </h1>
            </div>

            <div className={styles.tabsContainer}>
              <div className={styles.tabsNavigation}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`${styles.tabButton} ${
                      activeTab === tab.id ? styles.active : ""
                    }`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className={styles.tabContent}>
                {activeTabData && (
                  <div className={styles.tabPanel}>
                    <img
                      src="/images/tab_vector.svg"
                      alt=""
                      className={`${styles.tabVector} ${styles.topLeft}`}
                    />
                    <img
                      src="/images/tab_vector.svg"
                      alt=""
                      className={`${styles.tabVector} ${styles.topLeft}`}
                    />
                    <img
                      src="/images/tab_vector.svg"
                      alt=""
                      className={`${styles.tabVector} ${styles.bottomRight}`}
                    />
                    <img
                      src="/images/tab_vector.svg"
                      alt=""
                      className={`${styles.tabVector} ${styles.bottomRight}`}
                    />
                    <h2 className={styles.tabTitle}>
                      {activeTabData.content.title}
                    </h2>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", paddingTop: "40px" }}>
              <Button 
                text="Learn the secret" 
                textColor="white" 
                hoverColor="primary" 
                onClick={handleLearnSecret}
              />
            </div>
          </div>
        </Container>
      </div>
    </Section>
  );
}
