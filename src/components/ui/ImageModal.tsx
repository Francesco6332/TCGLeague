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
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Carica l'immagine quando la modale si apre
  useEffect(() => {
    if (isOpen && cardNumber) {
      setIsLoading(true);
      setHasError(false);
      setImageUrl(ImageService.getCardImageUrl(cardNumber));
      setScale(1);
      setRotation(0);
    }
  }, [isOpen, cardNumber]);

  const handleError = () => {
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
    setScale(1);
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <h2 className="text-white font-semibold text-lg">{cardName}</h2>
            <span className="text-white/70 text-sm">{cardNumber}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Controlli zoom */}
            <button
              onClick={handleZoomOut}
              className="p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Rotate (R)"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Reset (0)"
            >
              <span className="text-sm font-mono">0</span>
            </button>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            {/* Pulsante chiudi */}
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Close (ESC)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenuto immagine */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          {/* Navigazione */}
          {hasPrevious && onPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors z-20"
              title="Previous (←)"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          {hasNext && onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors z-20"
              title="Next (→)"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Container immagine */}
          <div className="relative max-w-full max-h-full overflow-hidden">
            {isLoading && (
              <div className="w-96 h-96 bg-white/10 animate-pulse flex items-center justify-center rounded-lg">
                <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            
            {hasError && (
              <div className="w-96 h-96 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center text-center rounded-lg">
                <div className="text-white/70 mb-2">Image not available</div>
                <div className="text-white/90 font-medium">{cardNumber}</div>
              </div>
            )}
            
            {!isLoading && !hasError && imageUrl && (
              <img
                src={imageUrl}
                alt={`${cardName} (${cardNumber})`}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
                onError={handleError}
                onLoad={handleLoad}
              />
            )}
          </div>
        </div>

        {/* Footer con controlli */}
        <div className="p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-white/70 text-sm">
            <div className="flex items-center space-x-4">
              <span>Zoom: {Math.round(scale * 100)}%</span>
              <span>Rotation: {rotation}°</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span>Use arrow keys to navigate</span>
              <span>+/- to zoom, R to rotate, 0 to reset</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
