import { getEnvVar } from '@/lib/utils/env';

const IPFS_GATEWAYS = [
  getEnvVar('NEXT_PUBLIC_IPFS_GATEWAY_1'),
  getEnvVar('NEXT_PUBLIC_IPFS_GATEWAY_2'),
  getEnvVar('NEXT_PUBLIC_IPFS_GATEWAY_3'),
] as const;

export function convertIpfsUrl(uri?: string, gatewayIndex = 0): string | undefined {
  if (!uri) return undefined;

  if (uri.startsWith('ipfs://')) {
    const ipfsHash = uri.replace('ipfs://', '');
    const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
    return `${gateway}${ipfsHash}`;
  }

  return uri;
}

export function resolveNFTImage(imageUri: string | undefined): string | undefined {
  return convertIpfsUrl(imageUri);
}

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && (contentType?.startsWith('image/') ?? false);
  } catch {
    return false;
  }
}

export function tryAlternativeIpfsGateway(uri: string, gatewayIndex: number): string | undefined {
  if (gatewayIndex >= IPFS_GATEWAYS.length) {
    return undefined;
  }
  return convertIpfsUrl(uri, gatewayIndex);
}
