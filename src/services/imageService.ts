import { useState } from 'react';

/**
 * Service for managing local One Piece TCG card images
 * Uses images stored in public/images/cards/ directory
 */
export class ImageService {
  /**
   * Get the local URL for a card image
   * @param cardNumber - Card number (e.g., "OP01-001")
   * @returns Local URL for the card image
   */
  static getCardImageUrl(cardNumber: string): string {
    if (!cardNumber) {
      return `/images/card-placeholder.svg`;
    }

    try {
      // Extract set code from card number (e.g., "OP01" from "OP01-001")
      const setCode = cardNumber.split('-')[0];
      
      if (!setCode) {
        return `/images/card-placeholder.svg`;
      }

      // Images are in /images/{SET}/{SET}/ structure
      return `/images/${setCode}/${setCode}/${cardNumber}.png`;
    } catch (error) {
      console.error('Error getting card image URL:', error);
      return `/images/card-placeholder.svg`;
    }
  }

  /**
   * Get alternative image URL with different format
   * @param cardNumber - Card number (e.g., "OP01-001")
   * @param format - Image format ('png' or 'jpg')
   * @returns Local URL for the card image in specified format
   */
  static getCardImageUrlWithFormat(cardNumber: string, format: 'png' | 'jpg' = 'png'): string {
    if (!cardNumber) {
      return `/images/card-placeholder.svg`;
    }

    try {
      const setCode = cardNumber.split('-')[0];
      
      if (!setCode) {
        return `/images/card-placeholder.svg`;
      }

      return `/images/${setCode}/${setCode}/${cardNumber}.${format}`;
    } catch (error) {
      console.error('Error getting card image URL:', error);
      return `/images/card-placeholder.svg`;
    }
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
   * This is a simple heuristic - you can improve it based on your needs
   */
  static shouldImageExist(cardNumber: string): boolean {
    if (!cardNumber) return false;
    
    const setCode = cardNumber.split('-')[0];
    
    // List of sets that should have images
    const availableSets = [
      // Currently available sets
      'OP01', 'EB1', 'EB02'
    ];
    
    return availableSets.includes(setCode);
  }
}

// Helper function for components
export function getCardImageUrl(cardNumber: string): string {
  return ImageService.getCardImageUrl(cardNumber);
}

// React hook for card images with local file support
export function useCardImage(cardNumber: string) {
  const [imageUrl, setImageUrl] = useState(ImageService.getCardImageUrl(cardNumber));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageUrl(ImageService.getPlaceholderUrl());
    }
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