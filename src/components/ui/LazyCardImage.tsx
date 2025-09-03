import { useState, useEffect, useRef } from 'react';
import { ImageService } from '../../services/imageService';

interface LazyCardImageProps {
  cardNumber: string;
  cardName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPlaceholder?: boolean;
  onClick?: () => void;
}

export function LazyCardImage({ 
  cardNumber, 
  cardName, 
  className = '', 
  size = 'md',
  showPlaceholder = true,
  onClick
}: LazyCardImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [triedFormats, setTriedFormats] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer per il lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Carica 50px prima che l'elemento sia visibile
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Carica l'immagine quando diventa visibile
  useEffect(() => {
    if (isVisible && !imageUrl) {
      setIsLoading(true);
      setImageUrl(ImageService.getCardImageUrl(cardNumber));
    }
  }, [isVisible, cardNumber, imageUrl]);

  const handleError = () => {
    if (!hasError && showPlaceholder) {
      // Try alternative format if we haven't tried it yet
      if (!triedFormats.includes('jpg') && imageUrl.endsWith('.png')) {
        const jpgUrl = ImageService.getCardImageUrlWithFormat(cardNumber, 'jpg');
        setImageUrl(jpgUrl);
        setTriedFormats(prev => [...prev, 'jpg']);
        return;
      }
      
      if (!triedFormats.includes('png') && imageUrl.endsWith('.jpg')) {
        const pngUrl = ImageService.getCardImageUrlWithFormat(cardNumber, 'png');
        setImageUrl(pngUrl);
        setTriedFormats(prev => [...prev, 'png']);
        return;
      }
      
      // If both formats failed, show placeholder
      setHasError(true);
      setImageUrl(ImageService.getPlaceholderUrl());
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Reset state when cardNumber changes
  useEffect(() => {
    if (isVisible) {
      setImageUrl(ImageService.getCardImageUrl(cardNumber));
      setHasError(false);
      setIsLoading(true);
      setTriedFormats([]);
    }
  }, [cardNumber, isVisible]);

  // Size classes - Mobile responsive
  const sizeClasses = {
    sm: 'w-12 h-18 sm:w-16 sm:h-24', // 48x72px mobile, 64x96px desktop
    md: 'w-16 h-24 sm:w-24 sm:h-36', // 64x96px mobile, 96x144px desktop
    lg: 'w-20 h-30 sm:w-32 sm:h-48', // 80x120px mobile, 128x192px desktop
    xl: 'w-24 h-36 sm:w-40 sm:h-60'  // 96x144px mobile, 160x240px desktop
  };

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-lg border border-white/20 shadow-lg
    object-cover object-center
    transition-all duration-200
    hover:border-white/40 hover:shadow-xl hover:scale-105
    active:scale-95
    ${onClick ? 'cursor-pointer touch-manipulation' : ''}
  `;

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`} 
      onClick={onClick}
    >
      {/* Placeholder durante il caricamento */}
      {(!isVisible || isLoading) && (
        <div className={`${baseClasses} bg-white/10 animate-pulse flex items-center justify-center`}>
          <div className="w-4 h-4 sm:w-8 sm:h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Immagine caricata */}
      {isVisible && imageUrl && (
        <img
          src={imageUrl}
          alt={`${cardName} (${cardNumber})`}
          className={`${baseClasses} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
      
      {/* Fallback per errori */}
      {hasError && !showPlaceholder && (
        <div className={`${baseClasses} bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center text-center p-1 sm:p-2`}>
          <div className="text-xs text-white/70 mb-0.5 sm:mb-1">No Image</div>
          <div className="text-xs text-white/90 font-medium">{cardNumber}</div>
        </div>
      )}
      
      {/* Card number overlay - Mobile responsive */}
      <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 bg-black/60 text-white text-xs px-0.5 sm:px-1 py-0.5 rounded text-shadow">
        {cardNumber}
      </div>
    </div>
  );
}
