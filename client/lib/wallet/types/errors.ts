import type { WalletId } from '../constants/walletIds';

export enum WalletErrorCode {
  USER_REJECTED = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
  CHAIN_DISCONNECTED = 4901,
  NOT_INSTALLED = 5001,
  WRONG_NETWORK = 5002,
  CONNECTION_FAILED = 5003,
  UNKNOWN = 5999,
}

export interface WalletError {
  code: WalletErrorCode;
  message: string;
  walletId?: WalletId;
  originalError?: Error;
}

export interface UserRejectedError extends WalletError {
  code: WalletErrorCode.USER_REJECTED;
}

export interface WalletNotInstalledError extends WalletError {
  code: WalletErrorCode.NOT_INSTALLED;
  walletId: WalletId;
  installUrl?: string;
}

export interface WrongNetworkError extends WalletError {
  code: WalletErrorCode.WRONG_NETWORK;
  currentNetwork: string;
  expectedNetwork: string;
}

export function isWalletError(error: unknown): error is WalletError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function createWalletError(
  code: WalletErrorCode,
  message: string,
  walletId?: WalletId,
  originalError?: Error
): WalletError {
  return {
    code,
    message,
    walletId,
    originalError,
  };
}

export function parseWalletError(error: unknown, walletId?: WalletId): WalletError {
  if (
    (typeof error === 'object' && error !== null && 'code' in error && error.code === 4001) ||
    (error instanceof Error && error.message?.toLowerCase().includes('reject'))
  ) {
    return createWalletError(
      WalletErrorCode.USER_REJECTED,
      'User rejected the request',
      walletId,
      error instanceof Error ? error : undefined
    );
  }

  if (error instanceof Error && error.message?.toLowerCase().includes('not installed')) {
    return createWalletError(
      WalletErrorCode.NOT_INSTALLED,
      `${walletId || 'Wallet'} is not installed`,
      walletId,
      error
    );
  }

  if (error instanceof Error && error.message?.toLowerCase().includes('network')) {
    return createWalletError(
      WalletErrorCode.WRONG_NETWORK,
      error.message,
      walletId,
      error
    );
  }

  return createWalletError(
    WalletErrorCode.UNKNOWN,
    error instanceof Error ? error.message : 'Unknown wallet error',
    walletId,
    error instanceof Error ? error : undefined
  );
}
