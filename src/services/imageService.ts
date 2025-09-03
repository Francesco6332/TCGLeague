import { useState } from 'react';
import { GITHUB_IMAGE_URLS } from '../github-image-mapping';
import { envConfig, STORAGE_PROVIDERS, type StorageProvider } from '../config/environment';

/**
 * Service for managing One Piece TCG card images
 * Supports multiple storage providers: GitHub Releases, DigitalOcean Spaces, Cloudflare R2, AWS S3, etc.
 */
export class ImageService {
  /**
   * Get the image URL for a card
   * @param cardNumber - Card number (e.g., "OP01-001")
   * @returns Image URL for the card
   */
  static getCardImageUrl(cardNumber: string): string {
    if (!cardNumber) {
      return this.getPlaceholderUrl();
    }

    try {
      switch (envConfig.storageProvider) {
        case STORAGE_PROVIDERS.DIGITALOCEAN_SPACES:
          return this.getDigitalOceanSpacesImageUrl(cardNumber);
        case STORAGE_PROVIDERS.CLOUDFLARE_R2:
          return this.getCloudflareR2ImageUrl(cardNumber);
        case STORAGE_PROVIDERS.AWS_S3:
          return this.getAwsS3ImageUrl(cardNumber);
        case STORAGE_PROVIDERS.AZURE_BLOB:
          return this.getAzureBlobImageUrl(cardNumber);
        case STORAGE_PROVIDERS.GITHUB:
        default:
          return this.getGitHubImageUrl(cardNumber);
      }
    } catch (error) {
      console.error('Error getting card image URL:', error);
      return this.getPlaceholderUrl();
    }
  }

  /**
   * GitHub Releases implementation
   */
  private static getGitHubImageUrl(cardNumber: string): string {
    // Extract set code from card number (e.g., "OP01" from "OP01-001")
    const setCode = cardNumber.split('-')[0];
    
    if (!setCode) {
      return this.getPlaceholderUrl();
    }

    // Use GitHub Releases URLs
    const imageUrl = GITHUB_IMAGE_URLS[`${setCode}-${cardNumber}` as keyof typeof GITHUB_IMAGE_URLS];
    if (imageUrl) {
      return imageUrl;
    }
    
    return this.getPlaceholderUrl();
  }

  /**
   * DigitalOcean Spaces implementation
   */
  private static getDigitalOceanSpacesImageUrl(cardNumber: string): string {
    const config = envConfig.digitalOceanSpaces;
    console.log('DigitalOcean Spaces config:', {
      endpoint: config.endpoint,
      bucket: config.bucket,
      region: config.region,
      hasAccessKey: !!config.accessKeyId,
      hasSecretKey: !!config.secretAccessKey
    });
    
    if (!config.endpoint || !config.accessKeyId) {
      console.warn('DigitalOcean Spaces not configured, falling back to GitHub');
      return this.getGitHubImageUrl(cardNumber);
    }
    
    // Extract set code from card number (e.g., "OP01" from "OP01-001")
    const setCode = cardNumber.split('-')[0];
    
    // Generate path with folder structure: OP01/OP01-001.png
    const imageUrl = `${config.endpoint}/${setCode}/${cardNumber}.png`;
    console.log('Generated DigitalOcean URL:', imageUrl);
    return imageUrl;
  }

  /**
   * Cloudflare R2 implementation
   */
  private static getCloudflareR2ImageUrl(cardNumber: string): string {
    const config = envConfig.cloudflareR2;
    if (!config.endpoint || !config.accessKeyId) {
      console.warn('Cloudflare R2 not configured, falling back to GitHub');
      return this.getGitHubImageUrl(cardNumber);
    }
    
    // Extract set code from card number (e.g., "OP01" from "OP01-001")
    const setCode = cardNumber.split('-')[0];
    
    // Generate path with folder structure: OP01/OP01-001.png
    return `${config.endpoint}/${setCode}/${cardNumber}.png`;
  }

  /**
   * AWS S3 implementation
   */
  private static getAwsS3ImageUrl(cardNumber: string): string {
    const config = envConfig.awsS3;
    if (!config.accessKeyId) {
      console.warn('AWS S3 not configured, falling back to GitHub');
      return this.getGitHubImageUrl(cardNumber);
    }
    
    // Extract set code from card number (e.g., "OP01" from "OP01-001")
    const setCode = cardNumber.split('-')[0];
    
    // Generate path with folder structure: OP01/OP01-001.png
    return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${setCode}/${cardNumber}.png`;
  }

  /**
   * Azure Blob implementation
   */
  private static getAzureBlobImageUrl(cardNumber: string): string {
    const config = envConfig.azureBlob;
    if (!config.account || !config.accessKey) {
      console.warn('Azure Blob Storage not configured, falling back to GitHub');
      return this.getGitHubImageUrl(cardNumber);
    }
    
    // Extract set code from card number (e.g., "OP01" from "OP01-001")
    const setCode = cardNumber.split('-')[0];
    
    // Generate path with folder structure: OP01/OP01-001.png
    return `https://${config.account}.blob.core.windows.net/${config.container}/${setCode}/${cardNumber}.png`;
  }

  /**
   * Get alternative image URL with different format
   * @param cardNumber - Card number (e.g., "OP01-001")
   * @param format - Image format ('png' or 'jpg')
   * @returns Image URL for the card
   */
  static getCardImageUrlWithFormat(cardNumber: string, format: 'png' | 'jpg' = 'png'): string {
   return this.getCardImageUrl(cardNumber) + `.${format}`;
  }

  /**
   * Get placeholder image URL
   */
  static getPlaceholderUrl(): string {
    return '/images/card-placeholder.svg';
  }

  /**
   * Get image URL with explicit fallback control
   */
  static getCardImageUrlWithFallback(cardNumber: string, hasImage?: boolean): string {
    if (hasImage === false) {
      return this.getPlaceholderUrl();
    }
    return this.getCardImageUrl(cardNumber);
  }

  /**
   * Check if a card image should exist based on set code
   */
  static shouldImageExist(cardNumber: string): boolean {
    if (!cardNumber) return false;
    
    const setCode = cardNumber.split('-')[0];
    
    // List of sets that should have images
    const availableSets = [
      // Main sets
      'OP01', 'OP02', 'OP03', 'OP04', 'OP05', 'OP06', 'OP07', 'OP08', 'OP09', 'OP10', 'OP11', 'OP12', 'OP13',
      // Starter decks
      'ST01', 'ST02', 'ST03', 'ST04', 'ST05', 'ST06', 'ST07', 'ST08', 'ST09', 'ST10',
      'ST11', 'ST12', 'ST13', 'ST14', 'ST15', 'ST16', 'ST17', 'ST18', 'ST19', 'ST20',
      'ST21', 'ST22', 'ST23', 'ST24', 'ST25', 'ST26', 'ST27', 'ST28',
      // Extra boosters
      'EB1', 'EB2', 'EB02', 'EB03',
      // Promotional sets
      'PRB01', 'PRB02'
    ];
    
    return availableSets.includes(setCode);
  }

  /**
   * Get fallback URLs for different image hosting services
   */
  static getFallbackUrls(cardNumber: string): string[] {
    if (!cardNumber) return [this.getPlaceholderUrl()];

    const setCode = cardNumber.split('-')[0];
    if (!setCode) return [this.getPlaceholderUrl()];

    const imageUrl = GITHUB_IMAGE_URLS[`${setCode}-${cardNumber}` as keyof typeof GITHUB_IMAGE_URLS];
    
    if (imageUrl) {
      return [
        imageUrl,
        this.getPlaceholderUrl()
      ];
    }

    return [this.getPlaceholderUrl()];
  }

  /**
   * Get current storage provider info
   */
  static getCurrentStorageProviderInfo() {
    return {
      provider: envConfig.storageProvider,
      name: this.getStorageProviderName(envConfig.storageProvider),
      isFree: this.isStorageProviderFree(envConfig.storageProvider),
      storageLimit: this.getStorageProviderLimit(envConfig.storageProvider),
      cost: this.getStorageProviderCost(envConfig.storageProvider),
      configured: this.isStorageProviderConfigured(envConfig.storageProvider)
    };
  }

  private static getStorageProviderName(provider: StorageProvider): string {
    switch (provider) {
      case STORAGE_PROVIDERS.DIGITALOCEAN_SPACES: return 'DigitalOcean Spaces';
      case STORAGE_PROVIDERS.CLOUDFLARE_R2: return 'Cloudflare R2';
      case STORAGE_PROVIDERS.AWS_S3: return 'AWS S3';
      case STORAGE_PROVIDERS.AZURE_BLOB: return 'Azure Blob Storage';
      case STORAGE_PROVIDERS.GITHUB: return 'GitHub Releases';
      default: return 'GitHub Releases';
    }
  }

  private static isStorageProviderFree(provider: StorageProvider): boolean {
    return provider === STORAGE_PROVIDERS.GITHUB || 
           provider === STORAGE_PROVIDERS.CLOUDFLARE_R2 || 
           provider === STORAGE_PROVIDERS.AWS_S3 || 
           provider === STORAGE_PROVIDERS.AZURE_BLOB;
  }

  private static getStorageProviderLimit(provider: StorageProvider): string {
    switch (provider) {
      case STORAGE_PROVIDERS.DIGITALOCEAN_SPACES: return '250GB';
      case STORAGE_PROVIDERS.CLOUDFLARE_R2: return '10GB';
      case STORAGE_PROVIDERS.AWS_S3: return '5GB';
      case STORAGE_PROVIDERS.AZURE_BLOB: return '5GB';
      case STORAGE_PROVIDERS.GITHUB: return 'Unlimited';
      default: return 'Unlimited';
    }
  }

  private static getStorageProviderCost(provider: StorageProvider): string {
    switch (provider) {
      case STORAGE_PROVIDERS.DIGITALOCEAN_SPACES: return '$5/month for 250GB + 1TB transfer';
      case STORAGE_PROVIDERS.CLOUDFLARE_R2: return 'Free tier: 10GB + 1M operations/month';
      case STORAGE_PROVIDERS.AWS_S3: return 'Free tier: 5GB + 20K requests/month for 12 months';
      case STORAGE_PROVIDERS.AZURE_BLOB: return 'Free tier: 5GB + 20K operations/month';
      case STORAGE_PROVIDERS.GITHUB: return 'Free for public repositories';
      default: return 'Free for public repositories';
    }
  }

  private static isStorageProviderConfigured(provider: StorageProvider): boolean {
    switch (provider) {
      case STORAGE_PROVIDERS.DIGITALOCEAN_SPACES:
        return !!(envConfig.digitalOceanSpaces.endpoint && envConfig.digitalOceanSpaces.accessKeyId);
      case STORAGE_PROVIDERS.CLOUDFLARE_R2:
        return !!(envConfig.cloudflareR2.endpoint && envConfig.cloudflareR2.accessKeyId);
      case STORAGE_PROVIDERS.AWS_S3:
        return !!(envConfig.awsS3.accessKeyId && envConfig.awsS3.secretAccessKey);
      case STORAGE_PROVIDERS.AZURE_BLOB:
        return !!(envConfig.azureBlob.account && envConfig.azureBlob.accessKey);
      case STORAGE_PROVIDERS.GITHUB:
      default:
        return true; // GitHub doesn't need configuration
    }
  }
}

// Helper function for components
export function getCardImageUrl(cardNumber: string): string {
  return ImageService.getCardImageUrl(cardNumber);
}

// React hook for card images
export function useCardImage(cardNumber: string) {
  const [imageUrl, setImageUrl] = useState(ImageService.getCardImageUrl(cardNumber));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setImageUrl(ImageService.getPlaceholderUrl());
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleImageChange = (newCardNumber: string) => {
    setHasError(false);
    setIsLoading(true);
    setImageUrl(ImageService.getCardImageUrl(newCardNumber));
  };

  return {
    imageUrl,
    hasError,
    isLoading,
    handleError,
    handleLoad,
    handleImageChange
  };
}

// Export the service as default
export default ImageService;