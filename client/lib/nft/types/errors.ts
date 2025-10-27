export enum NFTErrorCode {
  USER_REJECTED = 'USER_REJECTED',
  ALREADY_HAS_ROLE = 'ALREADY_HAS_ROLE',
  MAX_SUPPLY_REACHED = 'MAX_SUPPLY_REACHED',
  MAX_NFTS_REACHED = 'MAX_NFTS_REACHED',

  NETWORK_ERROR = 'NETWORK_ERROR',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WRONG_NETWORK = 'WRONG_NETWORK',

  CONTRACT_ERROR = 'CONTRACT_ERROR',
  MINT_FAILED = 'MINT_FAILED',
  FETCH_FAILED = 'FETCH_FAILED',

  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface NFTError {
  code: NFTErrorCode;
  message: string;
  originalError?: unknown;
  network?: string;
  address?: string;
}

export function createNFTError(
  code: NFTErrorCode,
  message: string,
  originalError?: unknown,
  context?: { network?: string; address?: string }
): NFTError {
  return {
    code,
    message,
    originalError,
    network: context?.network,
    address: context?.address,
  };
}

export function parseNFTError(error: unknown, network?: string): NFTError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('user rejected') || message.includes('user denied')) {
      return createNFTError(
        NFTErrorCode.USER_REJECTED,
        'Transaction cancelled by user',
        error,
        { network }
      );
    }

    if (message.includes('max_supply') || message.includes('0x90002') || message.includes('emax_supply')) {
      return createNFTError(
        NFTErrorCode.MAX_SUPPLY_REACHED,
        'Maximum supply reached for this role',
        error,
        { network }
      );
    }

    if (message.includes('already') && message.includes('role')) {
      return createNFTError(
        NFTErrorCode.ALREADY_HAS_ROLE,
        'You already have this role',
        error,
        { network }
      );
    }

    if (message.includes('network') || message.includes('connection')) {
      return createNFTError(
        NFTErrorCode.NETWORK_ERROR,
        'Network error. Please check your connection',
        error,
        { network }
      );
    }

    if (message.includes('contract') || message.includes('revert')) {
      return createNFTError(
        NFTErrorCode.CONTRACT_ERROR,
        'Smart contract error',
        error,
        { network }
      );
    }

    return createNFTError(
      NFTErrorCode.UNKNOWN_ERROR,
      error.message,
      error,
      { network }
    );
  }

  return createNFTError(
    NFTErrorCode.UNKNOWN_ERROR,
    'An unknown error occurred',
    error,
    { network }
  );
}

export function getUserFriendlyErrorMessage(error: NFTError): string {
  switch (error.code) {
    case NFTErrorCode.USER_REJECTED:
      return 'Transaction cancelled';
    case NFTErrorCode.ALREADY_HAS_ROLE:
      return 'You already have this role!';
    case NFTErrorCode.MAX_SUPPLY_REACHED:
      return 'Maximum supply reached for this role';
    case NFTErrorCode.MAX_NFTS_REACHED:
      return 'Maximum NFTs per wallet reached';
    case NFTErrorCode.WALLET_NOT_CONNECTED:
      return 'Please connect your wallet';
    case NFTErrorCode.WRONG_NETWORK:
      return 'Please switch to the correct network';
    case NFTErrorCode.NETWORK_ERROR:
      return 'Network error. Please try again';
    case NFTErrorCode.MINT_FAILED:
      return 'Minting failed. Please try again';
    case NFTErrorCode.FETCH_FAILED:
      return 'Failed to fetch NFTs. Please refresh';
    default:
      return error.message || 'Something went wrong. Please try again';
  }
}
