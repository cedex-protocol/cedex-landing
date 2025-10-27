import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@/contexts/WalletProvider';
import { useConfig } from 'wagmi';
import { useMemo, useCallback } from 'react';
import { QUERY_CONFIG, QUERY_KEYS } from '@/lib/constants/queryConfig';
import { EVMNFTService, AptosNFTService, CedraNFTService } from '../services';
import type { NFTData, UserNFTRoles } from '../types';

export type UseNFTQueryReturn = {
  userNFTs: NFTData[];
  userRoles: UserNFTRoles | null;
  isLoading: boolean;
  refetch: () => void;
};

export function useNFTQuery(): UseNFTQueryReturn {
  const { walletAddress, isConnected, isChainSupported, chainId, connectedWalletType, moveNetwork } = useWallet();
  const config = useConfig();
  const queryClient = useQueryClient();

  const evmService = useMemo(() => new EVMNFTService(config, chainId), [config, chainId]);
  const aptosService = useMemo(() => new AptosNFTService(), []);
  const cedraService = useMemo(() => new CedraNFTService(), []);

  const isCedra = connectedWalletType === 'cedra' && moveNetwork === 'cedra';
  const isAptos = connectedWalletType === 'aptos' && moveNetwork === 'aptos';
  const isEVM = connectedWalletType === 'evm';

  const isValidConfiguration = !(connectedWalletType === 'aptos' && moveNetwork === 'cedra');

  // Fetch NFTs
  const {
    data: nfts = [],
    isLoading: isLoadingNFTs,
  } = useQuery({
    queryKey: [...QUERY_KEYS.nfts(walletAddress), chainId, connectedWalletType, moveNetwork],
    queryFn: async () => {
      if (!walletAddress || !isConnected) {
        return [];
      }

      if (isCedra) {
        return await cedraService.fetchUserNFTs(walletAddress);
      }

      if (isAptos) {
        return await aptosService.fetchUserNFTs(walletAddress);
      }

      if (isEVM && isChainSupported) {
        return await evmService.fetchUserNFTs(walletAddress);
      }

      return [];
    },
    enabled: !!walletAddress && isConnected && isValidConfiguration && (isCedra || isAptos || (isEVM && isChainSupported)),
    staleTime: QUERY_CONFIG.STALE_TIME,
    retry: QUERY_CONFIG.RETRY_COUNT,
    retryDelay: QUERY_CONFIG.RETRY_DELAY,
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
  });

  // Fetch user roles
  const {
    data: roles = null,
    isLoading: isLoadingRoles,
  } = useQuery({
    queryKey: [...QUERY_KEYS.roles(walletAddress), chainId, connectedWalletType, moveNetwork],
    queryFn: async () => {
      if (!walletAddress || !isConnected) return null;

      if (isCedra) {
        return await cedraService.fetchUserRoles(walletAddress);
      }

      if (isAptos) {
        return await aptosService.fetchUserRoles(walletAddress);
      }

      if (isEVM && isChainSupported) {
        return await evmService.fetchUserRoles(walletAddress);
      }

      return null;
    },
    enabled: !!walletAddress && isConnected && isValidConfiguration && (isCedra || isAptos || (isEVM && isChainSupported)),
    staleTime: QUERY_CONFIG.STALE_TIME,
    retry: QUERY_CONFIG.RETRY_COUNT,
    retryDelay: QUERY_CONFIG.RETRY_DELAY,
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
  });

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.nfts(walletAddress), chainId] });
    queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.roles(walletAddress), chainId] });
  }, [queryClient, walletAddress, chainId]);

  return {
    userNFTs: nfts,
    userRoles: roles,
    isLoading: isLoadingNFTs || isLoadingRoles,
    refetch,
  };
}
