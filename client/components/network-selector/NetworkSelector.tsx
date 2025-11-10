"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useWallet } from "../../contexts/WalletProvider";
import { useSwitchChain } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import {
  SUPPORTED_NETWORKS,
  type SupportedChainId,
  type EVMChainId,
  CEDRA_NETWORK_ID,
  APTOS_NETWORK_ID
} from "../../lib/constants/networks";
import { useWalletDetection, supportsNetwork, getWalletName } from "@/lib/wallet";
import styles from "./NetworkSelector.module.scss";

export default function NetworkSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { chainId, isConnected, walletAddress, preferredChainId, setPreferredChainId, connectedWalletType, setMoveNetwork } = useWallet();
  const { switchChain } = useSwitchChain();
  const { detectedWallet } = useWalletDetection();
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) {
    return null;
  }

  const displayChainId = isConnected && chainId ? chainId : preferredChainId;
  const currentNetwork = SUPPORTED_NETWORKS.find((n) => n.id === displayChainId);

  const handleNetworkSelect = async (networkId: SupportedChainId) => {

    if (networkId === CEDRA_NETWORK_ID) {
      if (connectedWalletType !== 'cedra' && connectedWalletType !== 'aptos') {
        setPreferredChainId(networkId);
        setIsOpen(false);
        return;
      }
      setMoveNetwork('cedra');
      setPreferredChainId(networkId);
      setIsOpen(false);

      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: ['nfts', walletAddress] });
        queryClient.invalidateQueries({ queryKey: ['roles', walletAddress] });
      }
      return;
    }

    if (networkId === APTOS_NETWORK_ID) {
      if (connectedWalletType !== 'cedra' && connectedWalletType !== 'aptos') {
        setPreferredChainId(networkId);
        setIsOpen(false);
        return;
      }
      setMoveNetwork('aptos');
      setPreferredChainId(networkId);
      setIsOpen(false);

      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: ['nfts', walletAddress] });
        queryClient.invalidateQueries({ queryKey: ['roles', walletAddress] });
      }
      return;
    }

    if (!isConnected) {
      setPreferredChainId(networkId);
      setIsOpen(false);
      return;
    }

    if (networkId === chainId) {
      setIsOpen(false);
      return;
    }

    if (connectedWalletType === 'cedra' || connectedWalletType === 'aptos') {
      setPreferredChainId(networkId);
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    setIsSwitching(true);

    try {
      if (switchChain) {
        switchChain({ chainId: networkId as EVMChainId });

        if (walletAddress) {
          queryClient.invalidateQueries({ queryKey: ['nfts', walletAddress] });
          queryClient.invalidateQueries({ queryKey: ['roles', walletAddress] });
        }
      } else {
        console.error('[NetworkSelector] switchChain is not available');
      }
    } catch (error: any) {
      console.error("[NetworkSelector] Failed to switch network:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className={styles.networkSelector}>
      <button
        ref={triggerRef}
        className={`${styles.triggerButton} ${isSwitching ? styles.switching : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select network"
        disabled={isSwitching}
        title={isSwitching ? "Switching network..." : "Select network"}
      >
        <div className={styles.networkIcon}>
          {currentNetwork ? (
            <div
              className={styles.iconCircle}
              style={{ backgroundColor: currentNetwork.color }}
            >
              <Image
                src={currentNetwork.icon}
                alt={currentNetwork.name}
                width={16}
                height={16}
                className={styles.iconImage}
              />
            </div>
          ) : (
            <div className={styles.iconCircle}>
              <span className={styles.iconText}>?</span>
            </div>
          )}
        </div>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronUp : ""}`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && mounted && createPortal(
        <div
          ref={dropdownRef}
          className={styles.dropdown}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className={styles.dropdownContent}>
            {SUPPORTED_NETWORKS.map((network) => {
              let isWalletIncompatible = false;
              let tooltipMessage = '';

              if (detectedWallet !== 'none' && isConnected) {
                if ((detectedWallet === 'nightly' || detectedWallet === 'zedra') && network.id === APTOS_NETWORK_ID) {
                  isWalletIncompatible = true;
                  tooltipMessage = `${getWalletName(detectedWallet)} only supports Cedra network`;
                }
                else if ((detectedWallet === 'nightly' || detectedWallet === 'zedra') && network.type === 'evm') {
                  isWalletIncompatible = true;
                  tooltipMessage = `${getWalletName(detectedWallet)} only supports Cedra network`;
                }
                else if (network.id === CEDRA_NETWORK_ID && !supportsNetwork(detectedWallet, 'cedra')) {
                  isWalletIncompatible = true;
                  tooltipMessage = `${getWalletName(detectedWallet)} does not support Cedra network`;
                } else if (network.id === APTOS_NETWORK_ID && !supportsNetwork(detectedWallet, 'aptos')) {
                  isWalletIncompatible = true;
                  tooltipMessage = `${getWalletName(detectedWallet)} does not support Aptos network`;
                } else if (network.type === 'evm' && detectedWallet !== 'metamask') {
                  isWalletIncompatible = true;
                  tooltipMessage = `${getWalletName(detectedWallet)} does not support EVM networks`;
                }
              }

              const isDisabled =
                isSwitching ||
                isWalletIncompatible ||
                ((connectedWalletType === 'cedra' || connectedWalletType === 'aptos') && network.type === 'evm') ||
                (connectedWalletType === 'evm' && network.type === 'move');

              return (
              <button
                key={network.id}
                className={`${styles.networkOption} ${
                  network.id === displayChainId ? styles.active : ""
                } ${isDisabled ? styles.disabled : ""}`}
                onClick={() => !isDisabled && handleNetworkSelect(network.id)}
                disabled={isDisabled}
                title={isWalletIncompatible ? tooltipMessage : ''}
              >
                <div className={styles.optionContent}>
                  <div className={styles.radioButton}>
                    {network.id === displayChainId && (
                      <div className={styles.radioButtonInner} />
                    )}
                  </div>
                  <div className={styles.networkInfo}>
                    <div
                      className={styles.networkIconOption}
                      style={{ backgroundColor: network.color }}
                    >
                      <Image
                        src={network.icon}
                        alt={network.name}
                        width={12}
                        height={12}
                        className={styles.iconImage}
                      />
                    </div>
                    <span className={styles.networkName}>{network.name}</span>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}