import { NFTRole } from './nft';

export const ROLE_NAMES: Record<NFTRole, string> = {
  [NFTRole.TRADER]: 'Trader',
  [NFTRole.LIQUIDITY_PROVIDER]: 'Liquidity Provider',
  [NFTRole.HOLDER]: 'Builder',
};

export const ROLE_DESCRIPTIONS: Record<NFTRole, string> = {
  [NFTRole.TRADER]: 'Elite trader with soft liquidation protection and dark pool access',
  [NFTRole.LIQUIDITY_PROVIDER]: 'Professional vault manager with optimized yields',
  [NFTRole.HOLDER]: 'Protocol owner with governance rights and revenue sharing',
};

export const MAX_NFTS_PER_WALLET = 3;

export function getRoleByName(name: string): NFTRole | null {
  const normalized = name.toLowerCase().trim();

  if (normalized.includes('trader')) return NFTRole.TRADER;
  if (normalized.includes('liquidity') || normalized.includes('provider')) return NFTRole.LIQUIDITY_PROVIDER;
  if (normalized.includes('holder') || normalized.includes('builder')) return NFTRole.HOLDER;

  return null;
}

export function getRoleName(role: NFTRole): string {
  return ROLE_NAMES[role];
}

export function getRoleDescription(role: NFTRole): string {
  return ROLE_DESCRIPTIONS[role];
}
