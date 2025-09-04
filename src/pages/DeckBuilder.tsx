import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2,
  Layers,
  X,
  CreditCard,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';

import { LazyCardImage } from '../components/ui/LazyCardImage';
import { CardGrid } from '../components/ui/CardGrid';
import { deckService, cardService, type Deck, type Card } from '../services/localCardService';

interface DeckWithCardCount extends Deck {
  total_cards: number;
}

export function DeckBuilder() {
  const { userProfile } = useAuth();
  const [decks, setDecks] = useState<DeckWithCardCount[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isCardBrowser, setIsCardBrowser] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cardSearchTerm, setCardSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);
  const [hasMoreCards, setHasMoreCards] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mobile-specific states
  const [showFilters, setShowFilters] = useState(false);
  
  // Card filters
  const [selectedSet, setSelectedSet] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');

  // New deck form
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState<'Standard' | 'Limited' | 'Championship' | 'Casual'>('Standard');
  
  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const sets = [
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
  const colors = ['Red', 'Blue', 'Green', 'Purple', 'Yellow', 'Black', 'Colorless'];
  const types = ['Leader', 'Character', 'Event', 'Stage', 'DON!!'];
  const rarities = ['C', 'UC', 'R', 'SR', 'SEC', 'L', 'P'];

  useEffect(() => {
    fetchDecks();
  }, [userProfile]);

  useEffect(() => {
    if (isCardBrowser) {
      fetchCards();
    }
  }, [isCardBrowser, selectedSet, selectedColor, selectedType, selectedRarity]);

  useEffect(() => {
    filterCards();
  }, [cards, cardSearchTerm]);

  const fetchDecks = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const userDecks = await deckService.getUserDecks(userProfile.id);
      
      // Calculate total cards for each deck
      const decksWithCounts = userDecks.map(deck => {
        const totalCards = deck.deck_cards?.reduce((sum, deckCard) => sum + deckCard.quantity, 0) || 0;
        return { ...deck, total_cards: totalCards };
      });
      
      setDecks(decksWithCounts);
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      setCardLoading(true);
      console.log('Fetching cards with filters:', {
        set: selectedSet,
        color: selectedColor,
        type: selectedType,
        rarity: selectedRarity
      });
      
      const fetchedCards = await cardService.getCards({
        set: selectedSet || undefined,
        color: selectedColor || undefined,
        type: selectedType || undefined,
        rarity: selectedRarity || undefined,
        limit: 500 // Show more cards from GitHub releases
      });
      
      console.log('Fetched cards:', fetchedCards.length);
      console.log('Sample fetched cards:', fetchedCards.slice(0, 3));
      
      setCards(fetchedCards);
      setHasMoreCards(fetchedCards.length === 500);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setCardLoading(false);
    }
  };

  const loadMoreCards = async () => {
    try {
      setCardLoading(true);
      const offset = currentPage * 500;
      const additionalCards = await cardService.getCards({
        set: selectedSet || undefined,
        color: selectedColor || undefined,
        type: selectedType || undefined,
        rarity: selectedRarity || undefined,
        limit: 500,
        offset
      });
      
      if (additionalCards.length > 0) {
        setCards(prev => [...prev, ...additionalCards]);
        setCurrentPage(prev => prev + 1);
        setHasMoreCards(additionalCards.length === 500);
      } else {
        setHasMoreCards(false);
      }
    } catch (error) {
      console.error('Error loading more cards:', error);
    } finally {
      setCardLoading(false);
    }
  };

  const filterCards = () => {
    if (!cardSearchTerm) {
      setFilteredCards(cards);
      return;
    }

    const filtered = cards.filter(card =>
      card.name.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
      card.effect?.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
      card.card_number.toLowerCase().includes(cardSearchTerm.toLowerCase())
    );
    setFilteredCards(filtered);
  };

  const handleCreateDeck = async () => {
    if (!userProfile || !newDeckName.trim()) return;

    try {
      const newDeck = await deckService.createDeck({
        user_id: userProfile.id,
        name: newDeckName.trim(),
        format: newDeckFormat
      });

      setDecks(prev => [{ ...newDeck, total_cards: 0 }, ...prev]);
      setNewDeckName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating deck:', error);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck?')) return;

    try {
      await deckService.deleteDeck(deckId);
      setDecks(prev => prev.filter(deck => deck.id !== deckId));
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  const handleAddCardToDeck = async (cardId: string) => {
    if (!selectedDeck) return;

    try {
      await deckService.addCardToDeck(selectedDeck.id, cardId, 1);
      // Refresh the selected deck
      const updatedDeck = await deckService.getDeck(selectedDeck.id);
      setSelectedDeck(updatedDeck);
      
      // Update deck count in list
      setDecks(prev => prev.map(deck => 
        deck.id === selectedDeck.id 
          ? { ...deck, total_cards: (deck.total_cards || 0) + 1 }
          : deck
      ));
      
      // Show success notification
      const card = cards.find(c => c.id === cardId);
      setNotification({ 
        message: `${card?.card_number || 'Card'} added to deck!`, 
        type: 'success' 
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error adding card to deck:', error);
      setNotification({ 
        message: 'Failed to add card to deck', 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRemoveCardFromDeck = async (cardId: string) => {
    if (!selectedDeck) return;

    try {
      await deckService.removeCardFromDeck(selectedDeck.id, cardId, 1);
      // Refresh the selected deck
      const updatedDeck = await deckService.getDeck(selectedDeck.id);
      setSelectedDeck(updatedDeck);
      
      // Update deck count in list
      setDecks(prev => prev.map(deck => 
        deck.id === selectedDeck.id 
          ? { ...deck, total_cards: Math.max(0, (deck.total_cards || 0) - 1) }
          : deck
      ));
    } catch (error) {
      console.error('Error removing card from deck:', error);
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'Red': return 'bg-red-500';
      case 'Blue': return 'bg-blue-500';
      case 'Green': return 'bg-green-500';
      case 'Purple': return 'bg-purple-500';
      case 'Yellow': return 'bg-yellow-500';
      case 'Black': return 'bg-gray-800';
      default: return 'bg-gray-500';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'C': return 'text-gray-400';
      case 'UC': return 'text-green-400';
      case 'R': return 'text-blue-400';
      case 'SR': return 'text-purple-400';
      case 'SEC': return 'text-red-400';
      case 'L': return 'text-yellow-400';
      case 'P': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user is not authenticated
  if (!userProfile) {
    return (
      <div className="space-y-6 px-4 sm:px-6">
        <div className="text-center py-12">
          <Layers className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Please log in to access Deck Builder
          </h3>
          <p className="text-white/60 mb-6">
            You need to be logged in to create and manage your decks
          </p>
        </div>
      </div>
    );
  }

  if (selectedDeck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Mobile Deck Editor Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4"
        >
          <div className="max-w-7xl mx-auto">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-0">
              <button
                onClick={() => setSelectedDeck(null)}
                className="btn-secondary flex items-center space-x-2 hover:bg-white/20 transition-colors text-sm sm:text-base"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Decks</span>
                <span className="sm:hidden">Back</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-xs sm:text-sm text-white/60 bg-white/10 px-2 sm:px-3 py-1 rounded-full">
                  {selectedDeck.deck_cards?.reduce((sum, card) => sum + card.quantity, 0) || 0}/60
                </div>
                <button
                  onClick={() => setIsCardBrowser(!isCardBrowser)}
                  className={`btn-primary flex items-center space-x-1 sm:space-x-2 transition-all duration-200 text-sm ${
                    isCardBrowser ? 'bg-blue-600 shadow-lg shadow-blue-500/25' : 'hover:bg-blue-600'
                  }`}
                >
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{isCardBrowser ? 'Hide Browser' : 'Add Cards'}</span>
                  <span className="sm:hidden">{isCardBrowser ? 'Hide' : 'Add'}</span>
                </button>
              </div>
            </div>
            
            {/* Deck Info */}
            <div className="border-l border-white/20 pl-3 sm:pl-4">
              <h1 className="text-lg sm:text-2xl font-bold gradient-text line-clamp-1">{selectedDeck.name}</h1>
              <p className="text-white/70 text-xs sm:text-sm">
                {selectedDeck.deck_cards?.reduce((sum, card) => sum + card.quantity, 0) || 0} cards • {selectedDeck.format}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
                 <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
           <div className={`grid gap-4 sm:gap-6 transition-all duration-300 ${
             isCardBrowser ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'
           }`}>
             {/* Deck Contents - Top Row */}
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className={`card p-4 sm:p-6 ${isCardBrowser ? 'lg:col-span-3' : 'lg:col-span-2'}`}
             >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center space-x-2">
                  <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Deck Contents</span>
                </h2>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/60">
                  <span>Total Cards:</span>
                  <span className="font-semibold text-white">
                    {selectedDeck.deck_cards?.reduce((sum, card) => sum + card.quantity, 0) || 0}
                  </span>
                </div>
              </div>

              {selectedDeck.leader_card && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-white flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>Leader Card</span>
                    </h3>
                    <span className="text-xs text-white/60 bg-yellow-400/20 px-2 py-1 rounded-full">
                      Required
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-lg p-3 sm:p-4 border border-yellow-400/20">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <LazyCardImage
                        cardNumber={selectedDeck.leader_card.card_number}
                        cardName=""
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getColorClass(selectedDeck.leader_card.color)}`} />
                          <div className="font-semibold text-white text-sm sm:text-lg truncate">{selectedDeck.leader_card.card_number}</div>
                        </div>
                        <div className="text-xs sm:text-sm text-white/70 space-y-1">
                          <div>{selectedDeck.leader_card.card_number} • {selectedDeck.leader_card.type}</div>
                          <div>{selectedDeck.leader_card.power} Power • {selectedDeck.leader_card.life} Life</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                             <div className="space-y-4">
                 <div className="flex items-center justify-between mb-3 sm:mb-4">
                   <h4 className="text-sm sm:text-md font-medium text-white flex items-center space-x-2">
                     <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                     <span>Main Deck</span>
                   </h4>
                   <span className="text-xs text-white/60 bg-blue-400/20 px-2 py-1 rounded-full">
                     {selectedDeck.deck_cards?.reduce((sum, card) => sum + card.quantity, 0) || 0}/51 cards
                   </span>
                 </div>
                 
                 {selectedDeck.deck_cards && selectedDeck.deck_cards.length > 0 ? (
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                     {selectedDeck.deck_cards?.map((deckCard) => (
                       <div key={deckCard.id} className="relative group">
                         <div className="relative">
                           <LazyCardImage
                             cardNumber={deckCard.card?.card_number || ''}
                             cardName=""
                             size="md"
                             className="w-full h-auto rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                           />
                           
                           {/* Quantity Counter */}
                           <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                             {deckCard.quantity}
                           </div>
                         </div>
                         
                         {/* Card Controls */}
                         <div className="flex items-center justify-center space-x-1 mt-2">
                           <button
                             onClick={() => handleRemoveCardFromDeck(deckCard.card_id)}
                             className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors"
                             disabled={deckCard.quantity <= 1}
                           >
                             -
                           </button>
                           <button
                             onClick={() => handleAddCardToDeck(deckCard.card_id)}
                             className="bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors"
                             disabled={(selectedDeck.deck_cards?.reduce((sum, card) => sum + card.quantity, 0) || 0) >= 51}
                           >
                             +
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-6 sm:py-8 text-white/60">
                     <CreditCard className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-40" />
                     <p className="text-sm sm:text-base">No cards in deck</p>
                     <p className="text-xs sm:text-sm">Use the card browser to add cards</p>
                   </div>
                 )}
               </div>
            </motion.div>

                         {/* Card Browser - Bottom Row */}
             <AnimatePresence>
               {isCardBrowser && (
                 <motion.div
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="card p-4 sm:p-6 lg:col-span-3"
                 >
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center space-x-2">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Card Browser</span>
                    <div className="flex items-center space-x-2 ml-auto">
                      <button
                        onClick={() => setIsGridView(!isGridView)}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors ${
                          isGridView
                            ? 'bg-blue-500 text-white'
                            : 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {isGridView ? <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" /> : <List className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </button>
                      <span className="text-xs sm:text-sm text-white/60 hidden sm:inline">
                        {filteredCards.length} cards available
                      </span>
                    </div>
                  </h2>
                  <p className="text-xs sm:text-sm text-white/60 mb-3 sm:mb-4">
                    Card data sourced from <a href="https://onepiece.limitlesstcg.com/cards" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Limitless TCG Database</a>
                  </p>

                  {/* Notification */}
                  <AnimatePresence>
                    {notification && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                          notification.type === 'success' 
                            ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                            : 'bg-red-500/20 border border-red-500/30 text-red-300'
                        }`}
                      >
                        {notification.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mobile Search and Filters */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                      <input
                        type="text"
                        placeholder="Search cards..."
                        className="input-field w-full pl-10 text-sm sm:text-base"
                        value={cardSearchTerm}
                        onChange={(e) => setCardSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="sm:hidden">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary flex items-center space-x-2 w-full justify-center"
                      >
                        <Filter className="h-4 w-4" />
                        <span>Filters</span>
                      </button>
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden sm:grid sm:grid-cols-2 gap-2">
                      <select
                        className="input-field text-sm"
                        value={selectedSet}
                        onChange={(e) => setSelectedSet(e.target.value)}
                      >
                        <option value="">All Sets</option>
                        {sets.map(set => (
                          <option key={set} value={set}>{set}</option>
                        ))}
                      </select>

                      <select
                        className="input-field text-sm"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                      >
                        <option value="">All Colors</option>
                        {colors.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>

                      <select
                        className="input-field text-sm"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        <option value="">All Types</option>
                        {types.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>

                      <select
                        className="input-field text-sm"
                        value={selectedRarity}
                        onChange={(e) => setSelectedRarity(e.target.value)}
                      >
                        <option value="">All Rarities</option>
                        {rarities.map(rarity => (
                          <option key={rarity} value={rarity}>{rarity}</option>
                        ))}
                      </select>
                    </div>

                    {/* Mobile Filters Collapsible */}
                    <AnimatePresence>
                      {showFilters && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="sm:hidden space-y-2"
                        >
                          <select
                            className="input-field text-sm w-full"
                            value={selectedSet}
                            onChange={(e) => setSelectedSet(e.target.value)}
                          >
                            <option value="">All Sets</option>
                            {sets.map(set => (
                              <option key={set} value={set}>{set}</option>
                            ))}
                          </select>

                          <select
                            className="input-field text-sm w-full"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                          >
                            <option value="">All Colors</option>
                            {colors.map(color => (
                              <option key={color} value={color}>{color}</option>
                            ))}
                          </select>

                          <select
                            className="input-field text-sm w-full"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                          >
                            <option value="">All Types</option>
                            {types.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>

                          <select
                            className="input-field text-sm w-full"
                            value={selectedRarity}
                            onChange={(e) => setSelectedRarity(e.target.value)}
                          >
                            <option value="">All Rarities</option>
                            {rarities.map(rarity => (
                              <option key={rarity} value={rarity}>{rarity}</option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                                     {/* Card List */}
                   <div className="space-y-2">
                    {cardLoading ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-400 mx-auto mb-3 sm:mb-4"></div>
                        <p className="text-white/60 text-sm">Loading cards...</p>
                      </div>
                    ) : filteredCards.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-white/60">
                        <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-40" />
                        <p className="text-sm sm:text-base">No cards found</p>
                        <p className="text-xs sm:text-sm">Try adjusting your filters</p>
                      </div>
                    ) : (
                      <>
                        {isGridView ? (
                          <CardGrid
                            cards={filteredCards.map(card => ({
                              cardNumber: card.card_number,
                              name: card.name,
                              quantity: undefined
                            }))}
                            onCardClick={(cardNumber) => {
                              const card = filteredCards.find(c => c.card_number === cardNumber);
                              if (card) {
                                handleAddCardToDeck(card.id);
                              }
                            }}
                            itemsPerPage={4}
                            showPagination={true}
                            enableModal={true}
                          />
                        ) : (
                          <>
                            {filteredCards.map((card) => (
                              <div key={card.id} className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 hover:border-white/20 transition-colors">
                                <div className="flex items-start space-x-2 sm:space-x-3">
                                  <LazyCardImage
                                    cardNumber={card.card_number}
                                    cardName={card.name}
                                    size="md"
                                    className="flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                                      <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
                                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getColorClass(card.color)}`} />
                                        <div className="font-medium text-white text-sm truncate">{card.name}</div>
                                        <span className={`text-xs font-bold ${getRarityColor(card.rarity)} flex-shrink-0`}>
                                          {card.rarity}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleAddCardToDeck(card.id)}
                                        className="btn-primary px-2 sm:px-3 py-1 text-xs sm:text-sm ml-2 flex-shrink-0"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <div className="text-xs text-white/60 mb-1">
                                      {card.card_number} • {card.set_code} • {card.type} • {card.cost !== null ? `${card.cost} Cost` : 'No Cost'}
                                    </div>
                                    {card.effect && (
                                      <div className="text-xs text-white/50 line-clamp-2">
                                        {card.effect}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {hasMoreCards && (
                              <div className="text-center py-3 sm:py-4">
                                <button
                                  onClick={loadMoreCards}
                                  disabled={cardLoading}
                                  className="btn-secondary px-3 sm:px-4 py-2 text-sm disabled:opacity-50"
                                >
                                  {cardLoading ? 'Loading...' : 'Load More Cards'}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Main DeckBuilder View (when no deck is selected)
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Deck Builder</h1>
          <p className="text-white/70 mt-1 sm:mt-2 text-sm sm:text-base">Build competitive One Piece TCG decks with real cards</p>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center space-x-2 mt-3 sm:mt-0 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>New Deck</span>
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4 sm:p-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            type="text"
            placeholder="Search decks..."
            className="input-field w-full pl-10 text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Create New Deck Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-4 sm:p-6 w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Create New Deck</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1 sm:mb-2">
                    Deck Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter deck name"
                    className="input-field w-full text-sm sm:text-base"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1 sm:mb-2">
                    Format
                  </label>
                  <select
                    className="input-field w-full text-sm sm:text-base"
                    value={newDeckFormat}
                    onChange={(e) => setNewDeckFormat(e.target.value as any)}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Limited">Limited</option>
                    <option value="Championship">Championship</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 sm:space-x-4 mt-4 sm:mt-6">
                <button
                  onClick={() => setIsCreating(false)}
                  className="btn-secondary flex-1 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDeck}
                  disabled={!newDeckName.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 text-sm sm:text-base"
                >
                  Create Deck
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decks Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse card p-4 sm:p-6">
                <div className="h-5 sm:h-6 bg-white/10 rounded mb-3 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-white/10 rounded mb-1 sm:mb-2"></div>
                <div className="h-3 sm:h-4 bg-white/10 rounded mb-3 sm:mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 sm:h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-3 sm:h-4 bg-white/10 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Layers className="h-12 w-12 sm:h-16 sm:w-16 text-white/40 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
              {searchTerm ? 'No decks found' : 'No decks yet'}
            </h3>
            <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first deck to get started building competitive strategies'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setIsCreating(true)}
                className="btn-primary flex items-center space-x-2 mx-auto text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Deck</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredDecks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-4 sm:p-6 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedDeck(deck)}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <h3 className="font-semibold text-white text-base sm:text-lg line-clamp-2 flex-1 mr-2">
                    {deck.name}
                  </h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-white/60">Format</span>
                    <span className="text-white">{deck.format}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-white/60">Cards</span>
                    <span className="text-white">{deck.total_cards || 0}/60</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-white/60">Leader</span>
                    <span className="text-white truncate ml-2">
                      {deck.leader_card?.name || 'Not selected'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10">
                  <div className="text-xs sm:text-sm text-white/60">
                    {new Date(deck.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeck(deck);
                      }}
                      className="btn-secondary flex items-center space-x-1 px-2 sm:px-3 py-1 text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
