import { useState, useEffect } from 'react';
import { ImageService } from '../../services/imageService';

interface CardImageProps {
  cardNumber: string;
  cardName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPlaceholder?: boolean;
}

export function CardImage({ 
  cardNumber, 
  cardName, 
  className = '', 
  size = 'md',
  showPlaceholder = true 
}: CardImageProps) {
  const [imageUrl, setImageUrl] = useState(ImageService.getCardImageUrl(cardNumber));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [triedFormats, setTriedFormats] = useState<string[]>([]);

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
    setImageUrl(ImageService.getCardImageUrl(cardNumber));
    setHasError(false);
    setIsLoading(true);
    setTriedFormats([]);
  }, [cardNumber]);

  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-24', // 64x96px
    md: 'w-24 h-36', // 96x144px
    lg: 'w-32 h-48', // 128x192px
    xl: 'w-40 h-60'  // 160x240px
  };

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-lg border border-white/20 shadow-lg
    object-cover object-center
    transition-all duration-200
    hover:border-white/40 hover:shadow-xl hover:scale-105
  `;

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className={`${baseClasses} bg-white/10 animate-pulse flex items-center justify-center`}>
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={imageUrl}
        alt={`${cardName} (${cardNumber})`}
        className={`${baseClasses} ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
      
      {hasError && !showPlaceholder && (
        <div className={`${baseClasses} bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center text-center p-2`}>
          <div className="text-xs text-white/70 mb-1">No Image</div>
          <div className="text-xs text-white/90 font-medium">{cardNumber}</div>
        </div>
      )}
      
      {/* Card number overlay */}
      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded text-shadow">
        {cardNumber}
      </div>
    </div>
  );
}

// Specialized card image for deck builder
export function DeckBuilderCardImage({ 
  cardNumber, 
  cardName, 
  quantity, 
  onClick,
  className = '' 
}: CardImageProps & { 
  quantity?: number; 
  onClick?: () => void;
}) {
  return (
    <div 
      className={`relative cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <CardImage
        cardNumber={cardNumber}
        cardName={cardName}
        size="md"
        className="group-hover:ring-2 group-hover:ring-blue-400"
      />
      
      {quantity && quantity > 1 && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
          {quantity}
        </div>
      )}
    </div>
  );
}

// Card image gallery component
export function CardImageGallery({ 
  cards, 
  onCardClick,
  className = '' 
}: {
  cards: Array<{ cardNumber: string; name: string; quantity?: number }>;
  onCardClick?: (cardNumber: string) => void;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 ${className}`}>
      {cards.map((card, index) => (
        <DeckBuilderCardImage
          key={`${card.cardNumber}-${index}`}
          cardNumber={card.cardNumber}
          cardName={card.name}
          quantity={card.quantity}
          onClick={() => onCardClick?.(card.cardNumber)}
        />
      ))}
    </div>
  );
}

// Large card display for details
export function CardImageLarge({ 
  cardNumber, 
  cardName, 
  className = '' 
}: Omit<CardImageProps, 'size'>) {
  return (
    <div className={`relative ${className}`}>
      <CardImage
        cardNumber={cardNumber}
        cardName={cardName}
        size="xl"
        className="mx-auto"
      />
      
      {/* Card details overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
        <div className="text-white font-semibold">{cardName}</div>
        <div className="text-white/70 text-sm">{cardNumber}</div>
      </div>
    </div>
  );
}
