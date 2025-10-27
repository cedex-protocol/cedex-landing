import { useWallet } from "@/contexts/WalletProvider";
import { useNFTQuery } from "./useNFTQuery";
import { useCallback } from "react";

/**
 * Custom hook that combines wallet and NFT data
 * This provides fast access to user's NFT data without repeated blockchain calls
 */
export function useNFTData() {
  const { isConnected, walletAddress } = useWallet();
  const { userNFTs, userRoles, isLoading: isLoadingNFTs, refetch: refreshNFTData } = useNFTQuery();

  const hasRoleByCardId = useCallback((cardId: string): boolean => {
    if (!userRoles) return false;

    switch (cardId) {
      case 'trader':
        return userRoles.hasTrader;
      case 'provider':
        return userRoles.hasLiquidityProvider;
      case 'builder':
        return userRoles.hasHolder;
      default:
        return false;
    }
  }, [userRoles]);

  const hasAnyNFT = userNFTs.length > 0;
  const hasTraderRole = userRoles?.hasTrader ?? false;
  const hasLiquidityProviderRole = userRoles?.hasLiquidityProvider ?? false;
  const hasHolderRole = userRoles?.hasHolder ?? false;

  const primaryRole = userNFTs && userNFTs.length > 0 ? userNFTs[0].roleName : null;

  const allRoles = userNFTs ? userNFTs.map(nft => nft.roleName) : [];

  const getNFTsByRole = (role: string) => {
    if (!userNFTs) return [];
    return userNFTs.filter(nft => nft.roleName.toLowerCase() === role.toLowerCase());
  };

  return {
    userNFTs,
    userRoles,
    isLoadingNFTs,
    refreshNFTData,
    walletAddress,
    isConnected,

    hasAnyNFT,
    hasTraderRole,
    hasHolderRole: hasHolderRole,
    hasLiquidityProviderRole,

    primaryRole,
    allRoles,

    getNFTsByRole,
    hasRoleByCardId,
  };
}
