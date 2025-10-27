import { useEffect, useMemo } from 'react';
import { useWallet } from '@/contexts/WalletProvider';
import {
  type DetectedWallet,
  type WalletProvider,
  type WalletId,
  getWalletProvider,
  WALLET_IDS,
} from '../index';

export interface WalletDetectionResult {
  detectedWallet: DetectedWallet;
  isCorrectWallet: boolean;
  walletProvider: WalletProvider;
}

export function useWalletDetection(): WalletDetectionResult {
  const {
    selectedWalletId,
    aptosAddress,
    walletAddress,
    isConnected,
  } = useWallet();

  const detection = useMemo(() => {
    if (!isConnected || !selectedWalletId || typeof window === 'undefined') {
      return {
        detectedWallet: 'none' as DetectedWallet,
        isCorrectWallet: true,
        walletProvider: null,
      };
    }

    const isValidWalletId = (id: string): id is WalletId => {
      return Object.values(WALLET_IDS).includes(id as WalletId);
    };

    const walletProvider = isValidWalletId(selectedWalletId)
      ? getWalletProvider(selectedWalletId)
      : null;

    let detectedWallet: DetectedWallet = 'none';

    if (selectedWalletId === WALLET_IDS.NIGHTLY && window.nightly?.aptos && walletAddress) {
      detectedWallet = WALLET_IDS.NIGHTLY;
    } else if (selectedWalletId === WALLET_IDS.PETRA && window.petra && aptosAddress) {
      detectedWallet = WALLET_IDS.PETRA;
    } else if (selectedWalletId === WALLET_IDS.PONTEM) {
      if (window.pontem && aptosAddress) {
        detectedWallet = WALLET_IDS.PONTEM;
      } else if (window.ethereum && walletAddress) {
        detectedWallet = WALLET_IDS.PONTEM;
      }
    } else if (selectedWalletId === WALLET_IDS.METAMASK && window.ethereum && walletAddress) {
      detectedWallet = WALLET_IDS.METAMASK;
    }

    const isCorrectWallet = detectedWallet === selectedWalletId;

    return {
      detectedWallet,
      isCorrectWallet,
      walletProvider,
    };
  }, [isConnected, selectedWalletId, aptosAddress, walletAddress]);

  useEffect(() => {
    if (detection.detectedWallet === 'none') return;

    if (!detection.isCorrectWallet) {
      console.warn(
        `⚠️ [useWalletDetection] Wallet mismatch!\n` +
        `Selected: ${selectedWalletId}, Detected: ${detection.detectedWallet}`
      );
    }
  }, [detection.detectedWallet, detection.isCorrectWallet, selectedWalletId]);

  return detection;
}
