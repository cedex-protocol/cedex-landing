import ConnectedExperience from "@/components/landing/ConnectedExperience";
import EntryChoices from "@/components/landing/EntryChoices";
import Footer from "@/components/landing/Footer";
import HeroBanner from "@/components/landing/HeroBanner";
import MysteryFeatures from "@/components/landing/MysteryFeatures";
import PublicMove from "@/components/landing/PublicMove";
import Revolution from "@/components/landing/Revolution";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main>
      <HeroBanner />
      <EntryChoices />
      <Revolution />
      <PublicMove />
      <div className={styles.footerBackgroundSection}>
        <MysteryFeatures />
        <ConnectedExperience />
        <Footer />
      </div>
    </main>
  );
}