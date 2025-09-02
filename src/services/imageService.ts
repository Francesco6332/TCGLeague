import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Image service for managing One Piece TCG card images
export class ImageService {
  private static readonly BUCKET_NAME = 'card-images';
  private static readonly BASE_URL = import.meta.env.VITE_SUPABASE_URL;

  /**
   * Get the public URL for a card image
   */
  static getCardImageUrl(cardNumber: string): string {
    if (!this.BASE_URL || this.BASE_URL === 'https://demo-project.supabase.co') {
      // Return placeholder for demo mode
      return `/images/card-placeholder.jpg`;
    }
    
    return `${this.BASE_URL}/storage/v1/object/public/${this.BUCKET_NAME}/${cardNumber}.jpg`;
  }

  /**
   * Upload a single card image
   */
  static async uploadCardImage(cardNumber: string, imageFile: File): Promise<string> {
    try {
      const fileName = `${cardNumber}.jpg`;
      
      // Upload image to Supabase Storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          upsert: true // Replace if exists
        });

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Update card record with image URL
      const { error: updateError } = await supabase
        .from('cards')
        .update({ image_url: publicUrl })
        .eq('card_number', cardNumber);

      if (updateError) {
        throw new Error(`Failed to update card record: ${updateError.message}`);
      }

      return publicUrl;
    } catch (error) {
      console.error('Error uploading card image:', error);
      throw error;
    }
  }

  /**
   * Upload multiple card images
   */
  static async uploadMultipleImages(
    images: Array<{ cardNumber: string; file: File }>
  ): Promise<Array<{ cardNumber: string; url?: string; error?: string }>> {
    const results = [];

    for (const { cardNumber, file } of images) {
      try {
        const url = await this.uploadCardImage(cardNumber, file);
        results.push({ cardNumber, url });
      } catch (error) {
        results.push({ 
          cardNumber, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  /**
   * Delete a card image
   */
  static async deleteCardImage(cardNumber: string): Promise<void> {
    try {
      const fileName = `${cardNumber}.jpg`;
      
      // Delete from storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        throw new Error(`Failed to delete image: ${error.message}`);
      }

      // Remove URL from card record
      const { error: updateError } = await supabase
        .from('cards')
        .update({ image_url: null })
        .eq('card_number', cardNumber);

      if (updateError) {
        throw new Error(`Failed to update card record: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Error deleting card image:', error);
      throw error;
    }
  }

  /**
   * Check if image exists in storage
   */
  static async imageExists(cardNumber: string): Promise<boolean> {
    try {
      const fileName = `${cardNumber}.jpg`;
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', {
          search: fileName
        });

      if (error) return false;
      return data.some(file => file.name === fileName);
    } catch {
      return false;
    }
  }

  /**
   * Get all images in the bucket
   */
  static async listAllImages(): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list();

      if (error) {
        throw new Error(`Failed to list images: ${error.message}`);
      }

      return data.map(file => file.name.replace('.jpg', ''));
    } catch (error) {
      console.error('Error listing images:', error);
      return [];
    }
  }

  /**
   * Bulk assign image URLs to cards (for existing images)
   */
  static async assignImageUrls(): Promise<{ updated: number; errors: string[] }> {
    try {
      const { data: cards, error } = await supabase
        .from('cards')
        .select('id, card_number')
        .is('image_url', null);

      if (error) {
        throw new Error(`Failed to fetch cards: ${error.message}`);
      }

      const results = { updated: 0, errors: [] as string[] };

      for (const card of cards || []) {
        try {
          const imageUrl = this.getCardImageUrl(card.card_number);
          
          // Check if image actually exists before assigning URL
          const exists = await this.imageExists(card.card_number);
          
          if (exists) {
            const { error: updateError } = await supabase
              .from('cards')
              .update({ image_url: imageUrl })
              .eq('id', card.id);

            if (updateError) {
              results.errors.push(`Failed to update ${card.card_number}: ${updateError.message}`);
            } else {
              results.updated++;
            }
          }
        } catch (error) {
          results.errors.push(`Error processing ${card.card_number}: ${error}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Error assigning image URLs:', error);
      throw error;
    }
  }

  /**
   * Generate placeholder image URL
   */
  static getPlaceholderUrl(): string {
    return '/images/card-placeholder.jpg';
  }

  /**
   * Get image URL with fallback
   */
  static getCardImageUrlWithFallback(cardNumber: string, hasImage?: boolean): string {
    if (hasImage === false) {
      return this.getPlaceholderUrl();
    }
    return this.getCardImageUrl(cardNumber);
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
    if (!hasError) {
      setHasError(true);
      setImageUrl(ImageService.getPlaceholderUrl());
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return {
    imageUrl,
    hasError,
    isLoading,
    handleError,
    handleLoad
  };
}

// Export the service as default
export default ImageService;
