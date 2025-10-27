import { NFTRole } from '../types';

interface NFTImageMap {
  [key: string]: string;
}

const imageMap: NFTImageMap = {
  'trader': '/images/trader.svg',
  'provider': '/images/provider.svg',
  'builder': '/images/builder.svg',

  'Trader': '/images/trader.svg',
  'Liquidity Provider': '/images/provider.svg',
  'Provider': '/images/provider.svg',
  'Builder': '/images/builder.svg',

  '0': '/images/trader.svg',
  '1': '/images/provider.svg',
  '2': '/images/builder.svg',
};

export function useNFTImages() {
  const getImageForRole = (roleId: string | number | NFTRole, roleName?: string) => {
    if (imageMap[String(roleId)]) {
      return imageMap[String(roleId)];
    }

    if (roleName && imageMap[roleName]) {
      return imageMap[roleName];
    }

    if (roleName) {
      const normalizedName = roleName.toLowerCase();
      if (normalizedName.includes('provider') || normalizedName.includes('liquidity')) {
        return imageMap['provider'];
      }
      if (normalizedName.includes('trader')) {
        return imageMap['trader'];
      }
      if (normalizedName.includes('builder') || normalizedName.includes('holder')) {
        return imageMap['builder'];
      }
    }

    return imageMap['trader'];
  };

  const getImageForNFT = (nft: { role?: number | NFTRole; name?: string; roleName?: string; id?: string; image?: string }) => {
    if (nft.image && !nft.image.includes('undefined') && !nft.image.includes('null')) {
      return nft.image;
    }

    if (nft.id) {
      return getImageForRole(nft.id, nft.name || nft.roleName);
    }

    if (typeof nft.role === 'number') {
      return getImageForRole(nft.role, nft.name || nft.roleName);
    }

    if (nft.name || nft.roleName) {
      return getImageForRole(nft.name || nft.roleName || '');
    }

    return imageMap['trader'];
  };

  return {
    getImageForRole,
    getImageForNFT,
    imageMap,
  };
}
