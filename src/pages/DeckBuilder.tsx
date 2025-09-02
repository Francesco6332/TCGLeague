import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2,
  Layers,
  Users,
  X,
  CreditCard
} from 'lucide-react';
import { CardImage } from '../components/ui/CardImage';
import { deckService, cardService, type Deck, type Card } from '../lib/supabase';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [cardSearchTerm, setCardSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);
  
  // Card filters
  const [selectedSet, setSelectedSet] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');

  // New deck form
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState<'Standard' | 'Limited' | 'Championship' | 'Casual'>('Standard');

  const sets = ['OP01', 'OP02', 'OP03', 'OP04', 'OP05', 'OP06', 'OP07', 'OP08', 'OP09', 'OP10', 'OP11', 'OP12'];
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
      const fetchedCards = await cardService.getCards({
        set: selectedSet || undefined,
        color: selectedColor || undefined,
        type: selectedType || undefined,
        rarity: selectedRarity || undefined,
        limit: 100
      });
      setCards(fetchedCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
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
        format: newDeckFormat,
        is_public: false
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
    } catch (error) {
      console.error('Error adding card to deck:', error);
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

  if (selectedDeck) {
    return (
      <div className="space-y-6">
        {/* Deck Editor Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedDeck(null)}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Back to Decks</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{selectedDeck.name}</h1>
              <p className="text-white/70">
                {selectedDeck.deck_cards?.reduce((sum, card) => sum + card.quantity, 0) || 0} cards • {selectedDeck.format}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCardBrowser(!isCardBrowser)}
              className={`btn-primary flex items-center space-x-2 ${isCardBrowser ? 'bg-blue-600' : ''}`}
            >
              <Search className="h-4 w-4" />
              <span>{isCardBrowser ? 'Hide' : 'Add'} Cards</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deck Contents */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Layers className="h-5 w-5" />
              <span>Deck Contents</span>
            </h2>

            {selectedDeck.leader_card && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Leader</h3>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <CardImage
                      cardNumber={selectedDeck.leader_card.card_number}
                      cardName={selectedDeck.leader_card.name}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className={`w-3 h-3 rounded-full ${getColorClass(selectedDeck.leader_card.color)}`} />
                    <div>
                      <div className="font-medium text-white">{selectedDeck.leader_card.name}</div>
                      <div className="text-sm text-white/60">
                        {selectedDeck.leader_card.card_number} • {selectedDeck.leader_card.power} Power • {selectedDeck.leader_card.life} Life
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedDeck.deck_cards?.map((deckCard) => (
                <div key={deckCard.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardImage
                        cardNumber={deckCard.card?.card_number || ''}
                        cardName={deckCard.card?.name || 'Unknown Card'}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      <div className={`w-3 h-3 rounded-full ${getColorClass(deckCard.card?.color || 'Colorless')}`} />
                      <div>
                        <div className="font-medium text-white">{deckCard.card?.name}</div>
                        <div className="text-sm text-white/60">
                          {deckCard.card?.card_number} • {deckCard.card?.cost !== null ? `${deckCard.card?.cost} Cost` : 'No Cost'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">×{deckCard.quantity}</span>
                      <button
                        onClick={() => {/* TODO: Remove card */}}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!selectedDeck.deck_cards || selectedDeck.deck_cards.length === 0) && (
                <div className="text-center py-8 text-white/60">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p>No cards in deck</p>
                  <p className="text-sm">Use the card browser to add cards</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card Browser */}
          <AnimatePresence>
            {isCardBrowser && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Card Browser</span>
                </h2>

                {/* Filters */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                    <input
                      type="text"
                      placeholder="Search cards..."
                      className="input-field w-full pl-10"
                      value={cardSearchTerm}
                      onChange={(e) => setCardSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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
                </div>

                {/* Card List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {cardLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                      <p className="text-white/60">Loading cards...</p>
                    </div>
                  ) : filteredCards.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-40" />
                      <p>No cards found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  ) : (
                    filteredCards.map((card) => (
                      <div key={card.id} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-start space-x-3">
                          <CardImage
                            cardNumber={card.card_number}
                            cardName={card.name}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getColorClass(card.color)}`} />
                                <div className="font-medium text-white">{card.name}</div>
                                <span className={`text-xs font-bold ${getRarityColor(card.rarity)}`}>
                                  {card.rarity}
                                </span>
                              </div>
                              <button
                                onClick={() => handleAddCardToDeck(card.id)}
                                className="btn-primary px-3 py-1 text-sm"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-sm text-white/60 mb-1">
                              {card.card_number} • {card.type} • {card.cost !== null ? `${card.cost} Cost` : 'No Cost'}
                            </div>
                            {card.effect && (
                              <div className="text-xs text-white/50 line-clamp-2">
                                {card.effect}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Deck Builder</h1>
          <p className="text-white/70 mt-2">Build competitive One Piece TCG decks with real cards</p>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
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
        className="card p-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            type="text"
            placeholder="Search decks..."
            className="input-field w-full pl-10"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Create New Deck</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Deck Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter deck name"
                    className="input-field w-full"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Format
                  </label>
                  <select
                    className="input-field w-full"
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

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setIsCreating(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDeck}
                  disabled={!newDeckName.trim()}
                  className="btn-primary flex-1 disabled:opacity-50"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse card p-6">
                <div className="h-6 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-4 bg-white/10 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No decks found' : 'No decks yet'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first deck to get started building competitive strategies'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setIsCreating(true)}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Deck</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedDeck(deck)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-white text-lg line-clamp-2">
                    {deck.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {deck.is_public && (
                      <Users className="h-4 w-4 text-blue-400" />
                    )}
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

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Format</span>
                    <span className="text-white">{deck.format}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Cards</span>
                    <span className="text-white">{deck.total_cards || 0}/60</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Leader</span>
                    <span className="text-white">
                      {deck.leader_card?.name || 'Not selected'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-sm text-white/60">
                    {new Date(deck.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeck(deck);
                      }}
                      className="btn-secondary flex items-center space-x-1 px-3 py-1 text-sm"
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
