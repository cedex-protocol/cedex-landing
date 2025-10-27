"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Container } from "../layout";
import { useWallet } from "../../contexts/WalletProvider";
import { useUI } from "../../contexts/UIProvider";
import { truncateAddress } from "@/lib/wallet";
import styles from "./MobileMenu.module.scss";

interface MobileMenuProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export default function MobileMenu({ onMenuToggle }: MobileMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, walletAddress, disconnectWallet } = useWallet();
  const { openWalletSidebar } = useUI();

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <button
        className={styles.mobileMenuButton}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 6H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 18H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Container>
            <div className={styles.mobileMenuContent}>

              <div className={styles.mobileMenuGroup}>
                {isConnected ? (
                  <>
                    <div className={styles.mobileWalletAddress}>
                      {truncateAddress(walletAddress)}
                    </div>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setIsMobileMenuOpen(false);
                      }}
                      className={styles.mobileDisconnectLink}
                    >
                      Disconnect wallet
                      <Image
                        src="/icons/disconnect.svg"
                        alt="Disconnect"
                        width={12}
                        height={12}
                      />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      openWalletSidebar();
                      setIsMobileMenuOpen(false);
                    }}
                    className={styles.mobileConnectButton}
                  >
                    <Image
                      src="/icons/not_connected_wallet.svg"
                      alt="Wallet"
                      width={16}
                      height={16}
                      className={styles.walletButtonIcon}
                    />
                    Connect Wallet
                  </button>
                )}
              </div>

              <div className={styles.mobileMenuGroup}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setIsMobileMenuOpen(false);
                  }}
                  className={styles.mobileMenuItem}
                >
                  Enter Cedex →
                </a>
                <a
                  href={process.env.NEXT_PUBLIC_SOCIAL_X_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mobileMenuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Join X
                </a>
                <a
                  href={process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mobileMenuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Join Telegram
                </a>
                <a
                  href={process.env.NEXT_PUBLIC_SOCIAL_DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mobileMenuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Join Discord
                </a>
              </div>

              {/* <div className={styles.mobileMenuGroup}>
                <a
                  // href="/privacy"
                  className={styles.mobileMenuLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Privacy Policy
                </a>
                <a
                  // href="/terms"
                  className={styles.mobileMenuLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Terms of Service
                </a>
                <a
                  // href="/cookies"
                  className={styles.mobileMenuLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Cookie Settings
                </a>
              </div> */}
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
