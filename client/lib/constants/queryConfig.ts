export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60_000,
  CACHE_TIME: 10 * 60_000,
  REFETCH_INTERVAL: false,
  RETRY_COUNT: 3,
  RETRY_DELAY: (attemptIndex: number) => Math.min(1000 * attemptIndex, 3000),

  DEFAULT_OPTIONS: {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  }
} as const;

export const QUERY_KEYS = {
  nfts: (address?: string) => ['nfts', address] as const,
  roles: (address?: string) => ['roles', address] as const,
  all: ['nfts', 'roles'] as const,
} as const;
