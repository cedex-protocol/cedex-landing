import type { NFTData } from '../types';

interface NFTCacheData {
  nfts: NFTData[];
  timestamp: number;
  address: string;
  chainId: number;
}

const CACHE_KEY_PREFIX = 'nft_cache_evm';
const MAX_NFTS = 3;

function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function getCacheKey(address: string, chainId: number): string {
  return `${CACHE_KEY_PREFIX}_${chainId}_${address.toLowerCase()}`;
}

function isValidCacheData(data: any): data is NFTCacheData {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.nfts) &&
    typeof data.timestamp === 'number' &&
    typeof data.address === 'string' &&
    typeof data.chainId === 'number'
  );
}

export function getCachedNFTs(address: string, chainId: number): NFTData[] | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const key = getCacheKey(address, chainId);
    const cached = localStorage.getItem(key);

    if (!cached) {
      return null;
    }

    const data = JSON.parse(cached);

    if (!isValidCacheData(data)) {
      localStorage.removeItem(key);
      return null;
    }

    if (data.address.toLowerCase() !== address.toLowerCase() || data.chainId !== chainId) {
      return null;
    }

    return data.nfts;
  } catch (error) {
    console.error('[EVM Cache] Failed to read cache:', error);
    return null;
  }
}

export function setCachedNFTs(address: string, chainId: number, nfts: NFTData[]): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const key = getCacheKey(address, chainId);
    const data: NFTCacheData = {
      nfts,
      timestamp: Date.now(),
      address: address.toLowerCase(),
      chainId,
    };

    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('[EVM Cache] Failed to save cache:', error);
  }
}

export function hasMaxNFTsInCache(address: string, chainId: number): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    const key = getCacheKey(address, chainId);
    const cached = localStorage.getItem(key);

    if (!cached) return false;

    const data = JSON.parse(cached);

    if (!isValidCacheData(data)) return false;

    return data.nfts.length >= MAX_NFTS;
  } catch {
    return false;
  }
}

export function clearNFTCache(address: string, chainId: number): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const key = getCacheKey(address, chainId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[EVM Cache] Failed to clear cache:', error);
  }
}

export function clearAllNFTCaches(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('[EVM Cache] Failed to clear all caches:', error);
  }
}
