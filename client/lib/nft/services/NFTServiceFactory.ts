import type { BaseNFTService } from './BaseNFTService';
import type { NetworkType } from '../types';

export class NFTServiceFactory {
  private static services = new Map<string, BaseNFTService>();

  static getService(network: NetworkType, chainId?: number): BaseNFTService {
    const key = chainId ? `${network}-${chainId}` : network;

    if (!this.services.has(key)) {
      this.services.set(key, this.createService(network, chainId));
    }

    return this.services.get(key)!;
  }

  private static createService(network: NetworkType, chainId?: number): BaseNFTService {
    switch (network) {
      case 'evm': {
        const { EVMNFTService } = require('./EVMNFTService');
        return new EVMNFTService(chainId);
      }
      case 'aptos': {
        const { AptosNFTService } = require('./AptosNFTService');
        return new AptosNFTService();
      }
      case 'cedra': {
        const { CedraNFTService } = require('./CedraNFTService');
        return new CedraNFTService();
      }
      default:
        throw new Error(`Unsupported network type: ${network}`);
    }
  }

  static clearCache(): void {
    this.services.clear();
  }
}
