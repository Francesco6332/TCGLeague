import { useState } from 'react';

/**
 * Service for managing One Piece TCG card images
 * Currently uses placeholder images since external hosting is not available
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
      // Extract set code from card number (e.g., "OP01" from "OP01-001")
      const setCode = cardNumber.split('-')[0];
      
      if (!setCode) {
        return this.getPlaceholderUrl();
      }

      // For now, return placeholder since we don't have external image hosting
      return this.getPlaceholderUrl();
    } catch (error) {
      console.error('Error getting card image URL:', error);
      return this.getPlaceholderUrl();
    }
  }

  /**
   * Get alternative image URL with different format
   * @param cardNumber - Card number (e.g., "OP01-001")
   * @param format - Image format ('png' or 'jpg')
   * @returns Image URL for the card
   */
  static getCardImageUrlWithFormat(cardNumber: string, format: 'png' | 'jpg' = 'png'): string {
    return this.getCardImageUrl(cardNumber);
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
    return [this.getPlaceholderUrl()];
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