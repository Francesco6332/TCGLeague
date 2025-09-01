import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Save, 
  Import, 
  Download,
  Trash2,
  Edit,
  Eye,
  Layers,
  Star,
  Copy
} from 'lucide-react';
import type { Deck, DeckCard } from '../types';

export function DeckBuilder() {
  const { userProfile } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user's decks
    const fetchDecks = async () => {
      setLoading(true);
      
      // Mock deck data
      const mockDecks: Deck[] = [
        {
          id: '1',
          name: 'Red Straw Hat Pirates',
          playerId: userProfile?.id || '',
          format: 'Standard',
          leader: {
            id: 'st01-001',
            name: 'Monkey.D.Luffy',
            cost: 0,
            power: 5000,
            color: ['Red'],
            type: ['Leader'],
            rarity: 'L',
            set: 'ST-01',
            cardNumber: 'ST01-001',
            effect: '[DON!! x1] [When Attacking] Give up to 1 of your Leader or Character cards +1000 power during this turn.',
          },
          mainDeck: [],
          don: [],
          totalCards: 50,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-01'),
          isPublic: false,
        },
        {
          id: '2',
          name: 'Blue Heart Pirates',
          playerId: userProfile?.id || '',
          format: 'Standard',
          leader: {
            id: 'st03-001',
            name: 'Trafalgar Law',
            cost: 0,
            power: 5000,
            color: ['Blue'],
            type: ['Leader'],
            rarity: 'L',
            set: 'ST-03',
            cardNumber: 'ST03-001',
            effect: '[Activate: Main] [Once Per Turn] ➀ (You may rest the specified number of DON!! cards in your cost area.) : Look at 3 cards from the top of your deck; reveal up to 1 {Heart Pirates} type card other than [Trafalgar Law] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
          },
          mainDeck: [],
          don: [],
          totalCards: 50,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-02-05'),
          isPublic: true,
        },
      ];

      setTimeout(() => {
        setDecks(mockDecks);
        setLoading(false);
      }, 1000);
    };

    fetchDecks();
  }, [userProfile]);

  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.leader.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDeck = () => {
    setIsCreating(true);
    setSelectedDeck(null);
  };

  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsCreating(true);
  };

  const handleImportDeck = () => {
    // TODO: Implement deck import from clipboard
    console.log('Import deck from clipboard');
  };

  const getColorGradient = (colors: string[]) => {
    const colorMap: { [key: string]: string } = {
      'Red': 'from-red-500 to-red-600',
      'Blue': 'from-blue-500 to-blue-600',
      'Green': 'from-green-500 to-green-600',
      'Purple': 'from-purple-500 to-purple-600',
      'Yellow': 'from-yellow-500 to-yellow-600',
      'Black': 'from-gray-500 to-gray-600',
    };
    
    return colorMap[colors[0]] || 'from-gray-500 to-gray-600';
  };

  if (isCreating) {
    return <DeckEditor deck={selectedDeck} onBack={() => setIsCreating(false)} />;
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
          <p className="text-white/70 mt-2">
            Create and manage your One Piece TCG decks
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleImportDeck}
            className="btn-secondary flex items-center space-x-2"
          >
            <Import className="h-4 w-4" />
            <span>Import</span>
          </button>
          <button
            onClick={handleCreateDeck}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Deck</span>
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="text"
              placeholder="Search decks by name or leader..."
              className="input-field w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </motion.div>

      {/* Decks Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse card p-6">
                <div className="h-32 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
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
                : 'Create your first deck to get started'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateDeck}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Deck</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDecks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:scale-105 transition-transform cursor-pointer group"
              >
                {/* Leader Card */}
                <div className={`h-32 rounded-lg bg-gradient-to-br ${getColorGradient(deck.leader.color)} p-4 mb-4 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-xs font-medium bg-black/30 px-2 py-1 rounded">
                        Leader
                      </span>
                      {deck.isPublic && (
                        <Star className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    <h4 className="text-white font-bold text-sm line-clamp-2">
                      {deck.leader.name}
                    </h4>
                    <p className="text-white/80 text-xs mt-1">
                      Power: {deck.leader.power}
                    </p>
                  </div>
                </div>

                {/* Deck Info */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-white text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {deck.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{deck.format}</span>
                    <span className="text-white/60">{deck.totalCards} cards</span>
                  </div>
                  <p className="text-white/40 text-xs">
                    Updated {deck.updatedAt.toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDeck(deck);
                      }}
                      className="btn-primary flex items-center space-x-1 px-3 py-1 text-sm"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: View deck details
                      }}
                      className="btn-secondary flex items-center space-x-1 px-3 py-1 text-sm"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Copy deck
                      }}
                      className="p-1 text-white/60 hover:text-white transition-colors"
                      title="Copy deck"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Export deck
                      }}
                      className="p-1 text-white/60 hover:text-white transition-colors"
                      title="Export deck"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Delete deck
                      }}
                      className="p-1 text-white/60 hover:text-red-400 transition-colors"
                      title="Delete deck"
                    >
                      <Trash2 className="h-4 w-4" />
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

// Simplified Deck Editor Component
function DeckEditor({ deck, onBack }: { deck: Deck | null; onBack: () => void }) {
  const [deckName, setDeckName] = useState(deck?.name || '');
  const [mainDeckCards] = useState<DeckCard[]>(deck?.mainDeck || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="btn-secondary p-2">
            <Plus className="h-4 w-4 rotate-45" />
          </button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {deck ? 'Edit Deck' : 'Create New Deck'}
            </h1>
            <p className="text-white/70">Build your perfect One Piece deck</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Import List</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save Deck</span>
          </button>
        </div>
      </div>

      {/* Deck Name */}
      <div className="card p-6">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Deck Name
        </label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className="input-field w-full"
          placeholder="Enter deck name..."
        />
      </div>

      {/* Leader Selection */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Choose Your Leader</h3>
        <div className="text-center py-8">
          <Layers className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 mb-4">Leader selection coming soon</p>
          <p className="text-white/40 text-sm">
            This feature will allow you to browse and select from all available leaders
          </p>
        </div>
      </div>

      {/* Deck Building Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Card Database</h3>
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-4">Card search coming soon</p>
            <p className="text-white/40 text-sm">
              Search and filter through all One Piece TCG cards
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Deck List ({mainDeckCards.length}/50)
          </h3>
          <div className="text-center py-12">
            <Layers className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-4">Your deck cards will appear here</p>
            <p className="text-white/40 text-sm">
              Add cards from the database to build your deck
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
