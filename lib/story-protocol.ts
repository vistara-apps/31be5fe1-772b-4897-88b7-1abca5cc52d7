// Story Protocol integration for IP registration and royalty management
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';

export interface IPAsset {
  id: string;
  owner: string;
  metadataURI: string;
  royaltyPolicy: string;
  commercialTerms: {
    mintingFee: string;
    commercialUse: boolean;
    derivativesAllowed: boolean;
    royaltyRate: number; // percentage
  };
}

export interface LicenseTerms {
  transferable: boolean;
  royaltyRate: number;
  mintingFee: string;
  commercialUse: boolean;
  derivativesAllowed: boolean;
  commercialAttribution: boolean;
  commercializerChecker: string;
  commercializerCheckerData: string;
  commercialRevShare: number;
  derivativeRevShare: number;
  currency: string;
  uri: string;
}

export interface RemixRegistration {
  parentIPs: string[];
  licenseTermsIds: string[];
  royaltyContext: string;
  maxMintingFee: string;
  maxRoyaltyRate: number;
}

class StoryProtocolService {
  private publicClient;
  private walletClient;
  private baseUrl = 'https://api.story.foundation';
  
  // Story Protocol contract addresses (these would be the actual deployed addresses)
  private contracts = {
    IPAssetRegistry: '0x...' as `0x${string}`,
    LicensingModule: '0x...' as `0x${string}`,
    RoyaltyModule: '0x...' as `0x${string}`,
    PILicenseTemplate: '0x...' as `0x${string}`,
  };

  constructor() {
    this.publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
  }

  setWalletClient(walletClient: any) {
    this.walletClient = walletClient;
  }

  async registerIPAsset(
    tokenContract: string,
    tokenId: string,
    metadata: {
      title: string;
      description: string;
      mediaUrl: string;
      attributes: Record<string, any>;
    }
  ): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not connected');
    }

    try {
      // Upload metadata to IPFS first
      const metadataResponse = await fetch('/api/story/upload-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata');
      }

      const { metadataURI } = await metadataResponse.json();

      // Register IP Asset on Story Protocol
      const registerResponse = await fetch('/api/story/register-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenContract,
          tokenId,
          metadataURI
        })
      });

      if (!registerResponse.ok) {
        throw new Error('Failed to register IP asset');
      }

      const { ipId } = await registerResponse.json();
      return ipId;
    } catch (error) {
      console.error('Error registering IP asset:', error);
      throw error;
    }
  }

  async attachLicenseTerms(
    ipId: string,
    licenseTerms: Partial<LicenseTerms>
  ): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not connected');
    }

    try {
      const response = await fetch('/api/story/attach-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipId,
          licenseTerms: {
            transferable: licenseTerms.transferable ?? true,
            royaltyRate: licenseTerms.royaltyRate ?? 10, // 10%
            mintingFee: licenseTerms.mintingFee ?? '0',
            commercialUse: licenseTerms.commercialUse ?? true,
            derivativesAllowed: licenseTerms.derivativesAllowed ?? true,
            commercialAttribution: licenseTerms.commercialAttribution ?? true,
            commercializerChecker: licenseTerms.commercializerChecker ?? '0x0000000000000000000000000000000000000000',
            commercializerCheckerData: licenseTerms.commercializerCheckerData ?? '0x',
            commercialRevShare: licenseTerms.commercialRevShare ?? 10,
            derivativeRevShare: licenseTerms.derivativeRevShare ?? 10,
            currency: licenseTerms.currency ?? '0x0000000000000000000000000000000000000000', // ETH
            uri: licenseTerms.uri ?? ''
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to attach license terms');
      }

      const { licenseTermsId } = await response.json();
      return licenseTermsId;
    } catch (error) {
      console.error('Error attaching license terms:', error);
      throw error;
    }
  }

  async registerRemix(
    parentIPIds: string[],
    remixMetadata: {
      title: string;
      description: string;
      mediaUrl: string;
      originalClips: string[];
    }
  ): Promise<{ ipId: string; txHash: string }> {
    if (!this.walletClient) {
      throw new Error('Wallet client not connected');
    }

    try {
      // First register the remix as a new IP asset
      const ipId = await this.registerIPAsset(
        '0x...', // Remix NFT contract address
        Date.now().toString(), // Use timestamp as tokenId for now
        remixMetadata
      );

      // Register derivative relationship
      const response = await fetch('/api/story/register-derivative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childIpId: ipId,
          parentIpIds: parentIPIds,
          licenseTermsIds: [], // Will be populated by the API
          royaltyContext: '0x' // Additional royalty context if needed
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register derivative');
      }

      const { txHash } = await response.json();
      return { ipId, txHash };
    } catch (error) {
      console.error('Error registering remix:', error);
      throw error;
    }
  }

  async calculateRoyalties(
    ipId: string,
    revenue: number
  ): Promise<{ distributions: Array<{ recipient: string; amount: number }> }> {
    try {
      const response = await fetch('/api/story/calculate-royalties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipId,
          revenue: revenue.toString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate royalties');
      }

      return response.json();
    } catch (error) {
      console.error('Error calculating royalties:', error);
      throw error;
    }
  }

  async distributeRoyalties(
    ipId: string,
    amount: string
  ): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not connected');
    }

    try {
      const response = await fetch('/api/story/distribute-royalties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipId,
          amount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to distribute royalties');
      }

      const { txHash } = await response.json();
      return txHash;
    } catch (error) {
      console.error('Error distributing royalties:', error);
      throw error;
    }
  }

  async getIPAsset(ipId: string): Promise<IPAsset | null> {
    try {
      const response = await fetch(`/api/story/ip-asset/${ipId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch IP asset');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching IP asset:', error);
      return null;
    }
  }

  async getLicenseTerms(licenseTermsId: string): Promise<LicenseTerms | null> {
    try {
      const response = await fetch(`/api/story/license-terms/${licenseTermsId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch license terms');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching license terms:', error);
      return null;
    }
  }

  async getDerivatives(parentIpId: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/story/derivatives/${parentIpId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch derivatives');
      }

      const { derivatives } = await response.json();
      return derivatives;
    } catch (error) {
      console.error('Error fetching derivatives:', error);
      return [];
    }
  }

  async getRoyaltySnapshot(
    ipId: string,
    snapshotId?: string
  ): Promise<{ totalRoyaltiesOwed: string; unclaimedRoyalties: string }> {
    try {
      const url = snapshotId 
        ? `/api/story/royalty-snapshot/${ipId}/${snapshotId}`
        : `/api/story/royalty-snapshot/${ipId}`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch royalty snapshot');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching royalty snapshot:', error);
      throw error;
    }
  }

  // Utility functions
  formatIPId(ipId: string): string {
    return `${ipId.slice(0, 6)}...${ipId.slice(-4)}`;
  }

  isValidIPId(ipId: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(ipId);
  }

  calculateRoyaltyAmount(revenue: number, royaltyRate: number): number {
    return (revenue * royaltyRate) / 100;
  }

  // Mock functions for development (replace with actual Story Protocol calls)
  async mockRegisterIP(metadata: any): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock IP ID
    return `0x${Math.random().toString(16).substr(2, 40)}`;
  }

  async mockCalculateRoyalties(ipId: string, revenue: number) {
    // Simulate royalty calculation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      distributions: [
        { recipient: '0x1234...', amount: revenue * 0.1 },
        { recipient: '0x5678...', amount: revenue * 0.05 }
      ]
    };
  }
}

// Export singleton instance
export const storyProtocol = new StoryProtocolService();

// Helper functions for Story Protocol integration
export const storyUtils = {
  generateMetadata(
    title: string,
    description: string,
    mediaUrl: string,
    attributes: Record<string, any> = {}
  ) {
    return {
      title,
      description,
      mediaUrl,
      attributes: {
        ...attributes,
        createdAt: new Date().toISOString(),
        platform: 'RemixRite'
      }
    };
  },

  createDefaultLicenseTerms(royaltyRate: number = 10): Partial<LicenseTerms> {
    return {
      transferable: true,
      royaltyRate,
      mintingFee: '0',
      commercialUse: true,
      derivativesAllowed: true,
      commercialAttribution: true,
      commercialRevShare: royaltyRate,
      derivativeRevShare: royaltyRate,
      currency: '0x0000000000000000000000000000000000000000' // ETH
    };
  },

  validateRoyaltyRate(rate: number): boolean {
    return rate >= 0 && rate <= 100;
  }
};
