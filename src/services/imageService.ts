import { useState } from 'react';

/**
 * Service for managing One Piece TCG card images
 * Uses external URLs to avoid storage space issues
 */
export class ImageService {
  /**
   * Get the external URL for a card image
   * @param cardNumber - Card number (e.g., "OP01-001")
   * @returns External URL for the card image
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

      // Use external image hosting service
      // You can replace this with your preferred image hosting service
      return `https://images.onepiece-cardgame.com/${setCode}/${cardNumber}.png`;
    } catch (error) {
      console.error('Error getting card image URL:', error);
      return this.getPlaceholderUrl();
    }
  }

  /**
   * Get alternative image URL with different format
   * @param cardNumber - Card number (e.g., "OP01-001")
   * @param format - Image format ('png' or 'jpg')
   * @returns External URL for the card image in specified format
   */
  static getCardImageUrlWithFormat(cardNumber: string, format: 'png' | 'jpg' = 'png'): string {
    if (!cardNumber) {
      return this.getPlaceholderUrl();
    }

    try {
      const setCode = cardNumber.split('-')[0];
      
      if (!setCode) {
        return this.getPlaceholderUrl();
      }

      return `https://images.onepiece-cardgame.com/${setCode}/${cardNumber}.${format}`;
    } catch (error) {
      console.error('Error getting card image URL:', error);
      return this.getPlaceholderUrl();
    }
  }

  /**
   * Get placeholder image URL
   */
  static getPlaceholderUrl(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjM0I0MjU5Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyNjAiIGZpbGw9IiM0QTU2NzgiIHJ4PSI4Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DYXJkPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
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
      'OP01', 'OP02', 'OP03', 'OP04', 'EB01', 'EB02'
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

    return [
      `https://images.onepiece-cardgame.com/${setCode}/${cardNumber}.png`,
      `https://cdn.onepiece-tcg.com/images/${setCode}/${cardNumber}.png`,
      `https://static.onepiece-tcg.net/cards/${setCode}/${cardNumber}.png`,
      this.getPlaceholderUrl()
    ];
  }
}

// Helper function for components
export function getCardImageUrl(cardNumber: string): string {
  return ImageService.getCardImageUrl(cardNumber);
}

// React hook for card images with external URL support
export function useCardImage(cardNumber: string) {
  const [imageUrl, setImageUrl] = useState(ImageService.getCardImageUrl(cardNumber));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const fallbackUrls = ImageService.getFallbackUrls(cardNumber);
      if (fallbackIndex < fallbackUrls.length - 1) {
        setFallbackIndex(prev => prev + 1);
        setImageUrl(fallbackUrls[fallbackIndex + 1]);
        setHasError(false);
      } else {
        setImageUrl(ImageService.getPlaceholderUrl());
      }
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleImageChange = (newCardNumber: string) => {
    setHasError(false);
    setIsLoading(true);
    setFallbackIndex(0);
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