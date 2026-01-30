import { WalletErrorCode, parseWalletError, type WalletError, type WalletIdentifier } from '../types/errors';
import { getWalletInfo, getWalletName, isValidWalletId } from '../constants/walletIds';

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export function getErrorSeverity(code: WalletErrorCode): ErrorSeverity {
  if (code === WalletErrorCode.USER_REJECTED) return ErrorSeverity.INFO;
  if (code === WalletErrorCode.NOT_INSTALLED || code === WalletErrorCode.WRONG_NETWORK) return ErrorSeverity.WARNING;
  return ErrorSeverity.ERROR;
}

export function logWalletError(
  error: WalletError,
  context?: string,
  silent?: boolean
): void {
  if (silent) return;

  const severity = getErrorSeverity(error.code);
  const prefix = context ? `[${context}]` : '[WalletError]';
  const errorInfo = {
    code: error.code,
    message: error.message,
    walletId: error.walletId,
    severity,
  };

  if (error.code === WalletErrorCode.USER_REJECTED) {
    return;
  }

  if (
    error.code === WalletErrorCode.WRONG_NETWORK &&
    (error.message.includes('Mainnet') || error.message.includes('Testnet'))
  ) {
    console.warn(`${prefix} Network validation:`, errorInfo.message);
    return;
  }

  switch (severity) {
    case ErrorSeverity.INFO:
      break;

    case ErrorSeverity.WARNING:
      console.warn(`${prefix}`, errorInfo);
      break;

    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      console.error(`${prefix}`, errorInfo);
      if (error.originalError) {
        console.error('Original error:', error.originalError);
      }
      break;
  }
}

/**
 * Handle wallet error with consistent logging and formatting
 * @param error - The error to handle
 * @param walletId - Optional wallet ID or wallet name for context
 * @param context - Optional context string for logging
 * @param options - Additional options
 * @returns Formatted WalletError
 */
export function handleWalletError(
  error: unknown,
  walletId?: WalletIdentifier,
  context?: string,
  options?: {
    silent?: boolean;
    throwOriginal?: boolean;
  }
): WalletError {
  const walletError = parseWalletError(error, walletId);

  logWalletError(walletError, context, options?.silent);

  if (options?.throwOriginal && walletError.originalError) {
    throw walletError.originalError;
  }

  return walletError;
}

export function shouldShowErrorToUser(error: WalletError): boolean {
  return error.code !== WalletErrorCode.USER_REJECTED;
}

/**
 * Get wallet display name - works for both static WalletId and dynamic wallet names
 */
function getWalletDisplayName(walletId: WalletIdentifier): string {
  if (isValidWalletId(walletId)) {
    return getWalletName(walletId);
  }
  return walletId.charAt(0).toUpperCase() + walletId.slice(1);
}

export function getUserFriendlyErrorMessage(
  error: WalletError
): { message: string; downloadUrl?: string } {
  switch (error.code) {
    case WalletErrorCode.USER_REJECTED:
      return {
        message: 'You cancelled the request.',
      };

    case WalletErrorCode.NOT_INSTALLED: {
      if (error.walletId) {
        if (isValidWalletId(error.walletId)) {
          const walletInfo = getWalletInfo(error.walletId);
          return {
            message: `${walletInfo.name} wallet is not installed`,
            downloadUrl: walletInfo.downloadUrl,
          };
        }
        return {
          message: `${getWalletDisplayName(error.walletId)} wallet is not installed`,
        };
      }
      return {
        message: error.message,
      };
    }

    case WalletErrorCode.WRONG_NETWORK:
      return {
        message: error.message,
      };

    case WalletErrorCode.CONNECTION_FAILED: {
      const walletName = error.walletId ? getWalletDisplayName(error.walletId) : 'wallet';
      return {
        message: `Failed to connect to ${walletName}. Please try again.`,
      };
    }

    case WalletErrorCode.DISCONNECTED:
      return {
        message: 'Wallet disconnected. Please reconnect.',
      };

    default:
      return {
        message: error.message || 'An unexpected error occurred. Please try again.',
      };
  }
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  walletId?: WalletIdentifier,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const walletError = handleWalletError(error, walletId, context);
    throw new Error(walletError.message);
  }
}
