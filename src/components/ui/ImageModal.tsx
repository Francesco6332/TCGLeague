import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ImageService } from '../../services/imageService';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardNumber: string;
  cardName: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function ImageModal({
  isOpen,
  onClose,
  cardNumber,
  cardName,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: ImageModalProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [triedFormats, setTriedFormats] = useState<string[]>([]);
  const [scale, setScale] = useState(0.55);
  const [rotation, setRotation] = useState(0);

  // Carica l'immagine quando la modale si apre
  useEffect(() => {
    if (isOpen && cardNumber) {
      setIsLoading(true);
      setHasError(false);
      setScale(0.55);
      setRotation(0);
      setTriedFormats([]);
      
      // Preload the image
      const newImageUrl = ImageService.getCardImageUrl(cardNumber);
      const img = new Image();
      
      img.onload = () => {
        setImageUrl(newImageUrl);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        // Try alternative format
        const altUrl = ImageService.getCardImageUrlWithFormat(cardNumber, 'jpg');
        const altImg = new Image();
        
        altImg.onload = () => {
          setImageUrl(altUrl);
          setIsLoading(false);
        };
        
        altImg.onerror = () => {
          setHasError(true);
          setIsLoading(false);
        };
        
        altImg.src = altUrl;
      };
      
      img.src = newImageUrl;
    }
  }, [isOpen, cardNumber]);

  const handleError = () => {
    // Try alternative format if we haven't tried it yet
    if (!triedFormats.includes('jpg') && imageUrl.includes('.png')) {
      const jpgUrl = ImageService.getCardImageUrlWithFormat(cardNumber, 'jpg');
      setImageUrl(jpgUrl);
      setTriedFormats(prev => [...prev, 'jpg']);
      return;
    }
    
    if (!triedFormats.includes('png') && imageUrl.includes('.jpg')) {
      const pngUrl = ImageService.getCardImageUrlWithFormat(cardNumber, 'png');
      setImageUrl(pngUrl);
      setTriedFormats(prev => [...prev, 'png']);
      return;
    }
    
    // If both formats failed, show error
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(0.55);
    setRotation(0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (hasPrevious && onPrevious) {
          onPrevious();
        }
        break;
      case 'ArrowRight':
        if (hasNext && onNext) {
          onNext();
        }
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
        handleRotate();
        break;
      case '0':
        handleReset();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrevious, hasNext]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Overlay per chiudere */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Contenuto modale */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header - Mobile responsive */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <h2 className="text-white font-semibold text-sm sm:text-lg truncate">{cardName}</h2>
            <span className="text-white/70 text-xs sm:text-sm flex-shrink-0">{cardNumber}</span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Controlli zoom - Mobile responsive */}
            <button
              onClick={handleZoomOut}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Rotate (R)"
            >
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Reset (0)"
            >
              <span className="text-xs sm:text-sm font-mono">0</span>
            </button>
            
            <div className="w-px h-4 sm:h-6 bg-white/20 mx-1 sm:mx-2" />
            
            {/* Pulsante chiudi */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Close (ESC)"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Contenuto immagine - Mobile responsive */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
          {/* Navigazione - Mobile responsive */}
          {hasPrevious && onPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white/70 hover:text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors z-20"
              title="Previous (←)"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
          
          {hasNext && onNext && (
            <button
              onClick={onNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white/70 hover:text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors z-20"
              title="Next (→)"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Container immagine - Mobile responsive */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="w-64 h-64 sm:w-96 sm:h-96 bg-white/10 animate-pulse flex items-center justify-center rounded-lg border-2 border-white/20">
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <div className="ml-3 text-white/70 text-sm">Loading image...</div>
              </div>
            )}
            
            {hasError && (
              <div className="w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center text-center rounded-lg border-2 border-white/20">
                <div className="text-white/70 mb-2 text-sm sm:text-base">Image not available</div>
                <div className="text-white/90 font-medium text-sm sm:text-base">{cardNumber}</div>
                <div className="text-white/50 text-xs mt-2">Try refreshing or check your connection</div>
              </div>
            )}
            
            {!isLoading && !hasError && imageUrl && (
              <img
                src={imageUrl}
                alt={`${cardName} (${cardNumber})`}
                className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain transition-transform duration-200 shadow-2xl"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
                onError={handleError}
                onLoad={handleLoad}
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>

        {/* Footer con controlli - Mobile responsive */}
        <div className="p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-white/70 text-xs sm:text-sm space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span>Zoom: {Math.round(scale * 100)}%</span>
              <span>Rotation: {rotation}°</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="hidden sm:inline">Use arrow keys to navigate</span>
              <span className="hidden sm:inline">+/- to zoom, R to rotate, 0 to reset</span>
              <span className="sm:hidden">Tap buttons to control • Swipe to navigate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
