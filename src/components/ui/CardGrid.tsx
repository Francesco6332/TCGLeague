import { useState, useCallback } from 'react';
import { LazyCardImage } from './LazyCardImage';
import { ImageModal } from './ImageModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Card {
  cardNumber: string;
  name: string;
  quantity?: number;
}

interface CardGridProps {
  cards: Card[];
  onCardClick?: (cardNumber: string) => void;
  className?: string;
  itemsPerPage?: number;
  showPagination?: boolean;
  enableModal?: boolean;
}

export function CardGrid({
  cards,
  onCardClick,
  className = '',
  itemsPerPage = 4,
  showPagination = true,
  enableModal = true
}: CardGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [modalIndex, setModalIndex] = useState(0);

  // Calcola le carte per la pagina corrente
  const totalPages = Math.ceil(cards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCards = cards.slice(startIndex, endIndex);

  // Gestione modale
  const openModal = useCallback((card: Card, index: number) => {
    if (enableModal) {
      setModalCard(card);
      setModalIndex(startIndex + index);
    } else if (onCardClick) {
      onCardClick(card.cardNumber);
    }
  }, [enableModal, onCardClick, startIndex]);

  const closeModal = useCallback(() => {
    setModalCard(null);
  }, []);

  const goToPrevious = useCallback(() => {
    if (modalIndex > 0) {
      const prevCard = cards[modalIndex - 1];
      setModalCard(prevCard);
      setModalIndex(modalIndex - 1);
    }
  }, [modalIndex, cards]);

  const goToNext = useCallback(() => {
    if (modalIndex < cards.length - 1) {
      const nextCard = cards[modalIndex + 1];
      setModalCard(nextCard);
      setModalIndex(modalIndex + 1);
    }
  }, [modalIndex, cards]);

  // Navigazione pagine
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  return (
    <div className={className}>
      {/* Griglia carte - Mobile responsive */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
        {currentCards.map((card, index) => (
          <div
            key={`${card.cardNumber}-${index}`}
            className="relative cursor-pointer group"
            onClick={() => openModal(card, index)}
          >
            <LazyCardImage
              cardNumber={card.cardNumber}
              cardName={card.name}
              size="md"
              className="group-hover:ring-2 group-hover:ring-blue-400 transition-all duration-200"
            />
            
            {card.quantity && card.quantity > 1 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg">
                {card.quantity}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paginazione - Mobile responsive */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-4 sm:mt-8">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="p-1.5 sm:p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          {/* Mobile: Show only current page and total */}
          <div className="hidden sm:flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          {/* Mobile: Show current page indicator */}
          <div className="sm:hidden flex items-center space-x-2">
            <span className="text-white/70 text-sm">
              {currentPage} / {totalPages}
            </span>
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="p-1.5 sm:p-2 text-white/70 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}

      {/* Info paginazione - Mobile responsive */}
      {showPagination && (
        <div className="text-center mt-2 sm:mt-4 text-white/60 text-xs sm:text-sm">
          Showing {startIndex + 1}-{Math.min(endIndex, cards.length)} of {cards.length} cards
        </div>
      )}

      {/* Modale immagine */}
      {modalCard && (
        <ImageModal
          isOpen={!!modalCard}
          onClose={closeModal}
          cardNumber={modalCard.cardNumber}
          cardName={modalCard.name}
          onPrevious={modalIndex > 0 ? goToPrevious : undefined}
          onNext={modalIndex < cards.length - 1 ? goToNext : undefined}
          hasPrevious={modalIndex > 0}
          hasNext={modalIndex < cards.length - 1}
        />
      )}
    </div>
  );
}
