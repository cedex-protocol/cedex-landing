/**
 * Truncate wallet address for display
 * @param address - Full wallet address
 * @returns Truncated address (0x1234...5678) or empty string if invalid
 * @example
 * truncateAddress('0x1234567890abcdef') // '0x1234...cdef'
 * truncateAddress('abc123def456') // 'abc123...f456'
 */
export function truncateAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return '';
  }
  const sanitized = address.replace(/[<>"'&]/g, '');

  if (sanitized.startsWith('0x') && (sanitized.length === 42 || sanitized.length === 66)) {
    return `${sanitized.slice(0, 6)}...${sanitized.slice(-4)}`;
  }

  if (sanitized.length >= 10 && /^[a-fA-F0-9]+$/.test(sanitized)) {
    return `${sanitized.slice(0, 6)}...${sanitized.slice(-4)}`;
  }

  return '';
}

/**
 * Format wallet address for different display contexts
 * @param address - Full wallet address
 * @param format - Display format ('short' | 'medium' | 'long')
 * @returns Formatted address
 */
export function formatAddress(
  address: string,
  format: 'short' | 'medium' | 'long' = 'short'
): string {
  if (!address || typeof address !== 'string') {
    return '';
  }

  const sanitized = address.replace(/[<>"'&]/g, '');

  switch (format) {
    case 'short':
      return truncateAddress(sanitized);

    case 'medium':
      if (sanitized.startsWith('0x') && sanitized.length >= 20) {
        return `${sanitized.slice(0, 10)}...${sanitized.slice(-8)}`;
      }
      if (sanitized.length >= 20) {
        return `${sanitized.slice(0, 10)}...${sanitized.slice(-8)}`;
      }
      return truncateAddress(sanitized);

    case 'long':
      return sanitized;

    default:
      return truncateAddress(sanitized);
  }
}
