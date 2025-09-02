// Local card service for managing cards and decks without external database
interface Card {
  id: string;
  card_number: string;
  name: string;
  cost?: number;
  power?: number;
  life?: number;
  color: 'Red' | 'Blue' | 'Green' | 'Purple' | 'Yellow' | 'Black' | 'Colorless';
  type: 'Leader' | 'Character' | 'Event' | 'Stage' | 'DON!!';
  rarity: 'C' | 'UC' | 'R' | 'SR' | 'SEC' | 'L' | 'P';
  set_code: string;
  effect?: string;
  attribute?: string;
}

interface DeckCard {
  id: string;
  deck_id: string;
  card_id: string;
  quantity: number;
  card?: Card;
}

interface Deck {
  id: string;
  name: string;
  format: 'Standard' | 'Limited' | 'Championship' | 'Casual';
  user_id: string;
  leader_card_id?: string;
  leader_card?: Card;
  deck_cards?: DeckCard[];
  created_at: string;
  updated_at: string;
}

// Sample cards for the available sets (OP01, OP02, OP03, OP04, EB01, EB02)
const sampleCards: Card[] = [
  // OP01 Sample Cards
  {
    id: 'op01-001',
    card_number: 'OP01-001',
    name: 'Monkey D. Luffy',
    cost: 0,
    power: 5000,
    life: 5,
    color: 'Red',
    type: 'Leader',
    rarity: 'L',
    set_code: 'OP01',
    effect: '[Activate: Main] [Once per turn] Give up to 1 of your {Straw Hat Crew} type Character cards +1000 power during this turn.',
    attribute: 'Straw Hat Crew'
  },
  {
    id: 'op01-002',
    card_number: 'OP01-002',
    name: 'Roronoa Zoro',
    cost: 3,
    power: 4000,
    color: 'Red',
    type: 'Character',
    rarity: 'SR',
    set_code: 'OP01',
    effect: '[On Play] K.O. up to 1 of your opponent\'s Characters with 3000 power or less.',
    attribute: 'Straw Hat Crew'
  },
  {
    id: 'op01-003',
    card_number: 'OP01-003',
    name: 'Nami',
    cost: 1,
    power: 2000,
    color: 'Red',
    type: 'Character',
    rarity: 'R',
    set_code: 'OP01',
    effect: '[Activate: Main] You may rest this Character: Add up to 1 DON!! card from your DON!! deck to your hand.',
    attribute: 'Straw Hat Crew'
  },
  {
    id: 'op01-004',
    card_number: 'OP01-004',
    name: 'Usopp',
    cost: 2,
    power: 3000,
    color: 'Red',
    type: 'Character',
    rarity: 'UC',
    set_code: 'OP01',
    effect: '[On Play] Draw 1 card.',
    attribute: 'Straw Hat Crew'
  },
  {
    id: 'op01-005',
    card_number: 'OP01-005',
    name: 'Sanji',
    cost: 4,
    power: 5000,
    color: 'Red',
    type: 'Character',
    rarity: 'SR',
    set_code: 'OP01',
    effect: '[On Play] K.O. up to 1 of your opponent\'s Characters with 4000 power or less.',
    attribute: 'Straw Hat Crew'
  },
  // OP02 Sample Cards
  {
    id: 'op02-001',
    card_number: 'OP02-001',
    name: 'Trafalgar Law',
    cost: 0,
    power: 5000,
    life: 4,
    color: 'Blue',
    type: 'Leader',
    rarity: 'L',
    set_code: 'OP02',
    effect: '[Activate: Main] [Once per turn] Give up to 1 of your {Heart Pirates} type Character cards +1000 power during this turn.',
    attribute: 'Heart Pirates'
  },
  {
    id: 'op02-002',
    card_number: 'OP02-002',
    name: 'Eustass Kid',
    cost: 4,
    power: 5000,
    color: 'Blue',
    type: 'Character',
    rarity: 'SR',
    set_code: 'OP02',
    effect: '[On Play] K.O. up to 1 of your opponent\'s Characters with 4000 power or less.',
    attribute: 'Kid Pirates'
  },
  // OP03 Sample Cards
  {
    id: 'op03-001',
    card_number: 'OP03-001',
    name: 'Kaido',
    cost: 0,
    power: 5000,
    life: 4,
    color: 'Purple',
    type: 'Leader',
    rarity: 'L',
    set_code: 'OP03',
    effect: '[Activate: Main] [Once per turn] Give all of your {Beast Pirates} type Character cards +1000 power during this turn.',
    attribute: 'Four Emperors/Beast Pirates'
  },
  {
    id: 'op03-002',
    card_number: 'OP03-002',
    name: 'King',
    cost: 5,
    power: 6000,
    color: 'Purple',
    type: 'Character',
    rarity: 'SR',
    set_code: 'OP03',
    effect: '[On Play] Give up to 1 of your Characters +2000 power during this turn.',
    attribute: 'Beast Pirates'
  },
  // OP04 Sample Cards
  {
    id: 'op04-001',
    card_number: 'OP04-001',
    name: 'Big Mom',
    cost: 0,
    power: 5000,
    life: 4,
    color: 'Yellow',
    type: 'Leader',
    rarity: 'L',
    set_code: 'OP04',
    effect: '[Activate: Main] [Once per turn] Give all of your {Big Mom Pirates} type Character cards +1000 power during this turn.',
    attribute: 'Four Emperors/Big Mom Pirates'
  },
  {
    id: 'op04-002',
    card_number: 'OP04-002',
    name: 'Katakuri',
    cost: 6,
    power: 7000,
    color: 'Yellow',
    type: 'Character',
    rarity: 'SR',
    set_code: 'OP04',
    effect: '[On Play] K.O. up to 1 of your opponent\'s Characters with 5000 power or less.',
    attribute: 'Big Mom Pirates'
  },
  // EB01 Sample Cards
  {
    id: 'eb01-001',
    card_number: 'EB01-001',
    name: 'Portgas D. Ace',
    cost: 4,
    power: 5000,
    color: 'Red',
    type: 'Character',
    rarity: 'SR',
    set_code: 'EB01',
    effect: '[On Play] Deal 1 damage to up to 1 of your opponent\'s Characters.',
    attribute: 'Whitebeard Pirates'
  },
  {
    id: 'eb01-002',
    card_number: 'EB01-002',
    name: 'Marco',
    cost: 5,
    power: 6000,
    color: 'Red',
    type: 'Character',
    rarity: 'SR',
    set_code: 'EB01',
    effect: '[On Play] Give up to 1 of your Characters +2000 power during this turn.',
    attribute: 'Whitebeard Pirates'
  },
  // EB02 Sample Cards
  {
    id: 'eb02-001',
    card_number: 'EB02-001',
    name: 'Edward Newgate',
    cost: 0,
    power: 5000,
    life: 4,
    color: 'Red',
    type: 'Leader',
    rarity: 'L',
    set_code: 'EB02',
    effect: '[Activate: Main] [Once per turn] Give all of your {Whitebeard Pirates} type Character cards +1000 power during this turn.',
    attribute: 'Four Emperors/Whitebeard Pirates'
  },
  {
    id: 'eb02-002',
    card_number: 'EB02-002',
    name: 'Jozu',
    cost: 3,
    power: 4000,
    color: 'Red',
    type: 'Character',
    rarity: 'R',
    set_code: 'EB02',
    effect: '[On Play] Give up to 1 of your Characters +1000 power during this turn.',
    attribute: 'Whitebeard Pirates'
  }
];

// Local storage keys
const DECKS_KEY = 'tcg_decks';
const DECK_CARDS_KEY = 'tcg_deck_cards';

// Helper functions
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Card Service
export const cardService = {
  async getCards(filters: {
    set?: string;
    color?: string;
    type?: string;
    rarity?: string;
    search?: string;
    limit?: number;
  } = {}): Promise<Card[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredCards = [...sampleCards];

        if (filters.set) {
          filteredCards = filteredCards.filter(card => card.set_code === filters.set);
        }
        if (filters.color) {
          filteredCards = filteredCards.filter(card => card.color === filters.color);
        }
        if (filters.type) {
          filteredCards = filteredCards.filter(card => card.type === filters.type);
        }
        if (filters.rarity) {
          filteredCards = filteredCards.filter(card => card.rarity === filters.rarity);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filteredCards = filteredCards.filter(card => 
            card.name.toLowerCase().includes(search) ||
            card.card_number.toLowerCase().includes(search) ||
            card.effect?.toLowerCase().includes(search)
          );
        }

        // Apply limit if specified
        if (filters.limit) {
          filteredCards = filteredCards.slice(0, filters.limit);
        }

        resolve(filteredCards);
      }, 100); // Simulate network delay
    });
  }
};

// Deck Service
export const deckService = {
  async getUserDecks(userId: string): Promise<Deck[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const decksJson = localStorage.getItem(DECKS_KEY);
        const allDecks: Deck[] = decksJson ? JSON.parse(decksJson) : [];
        const userDecks = allDecks.filter(deck => deck.user_id === userId);
        
        // Add deck cards to each deck
        const deckCardsJson = localStorage.getItem(DECK_CARDS_KEY);
        const allDeckCards: DeckCard[] = deckCardsJson ? JSON.parse(deckCardsJson) : [];
        
        userDecks.forEach(deck => {
          deck.deck_cards = allDeckCards
            .filter(dc => dc.deck_id === deck.id)
            .map(dc => ({
              ...dc,
              card: sampleCards.find(card => card.id === dc.card_id)
            }));
          
          if (deck.leader_card_id) {
            deck.leader_card = sampleCards.find(card => card.id === deck.leader_card_id);
          }
        });
        
        resolve(userDecks);
      }, 100);
    });
  },

  async createDeck(deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>): Promise<Deck> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDeck: Deck = {
          ...deck,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deck_cards: []
        };

        const decksJson = localStorage.getItem(DECKS_KEY);
        const decks: Deck[] = decksJson ? JSON.parse(decksJson) : [];
        decks.push(newDeck);
        localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
        
        resolve(newDeck);
      }, 100);
    });
  },

  async addCardToDeck(deckId: string, cardId: string, quantity: number = 1): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deckCardsJson = localStorage.getItem(DECK_CARDS_KEY);
        const deckCards: DeckCard[] = deckCardsJson ? JSON.parse(deckCardsJson) : [];
        
        const existingCard = deckCards.find(dc => dc.deck_id === deckId && dc.card_id === cardId);
        
        if (existingCard) {
          existingCard.quantity += quantity;
        } else {
          deckCards.push({
            id: generateId(),
            deck_id: deckId,
            card_id: cardId,
            quantity
          });
        }
        
        localStorage.setItem(DECK_CARDS_KEY, JSON.stringify(deckCards));
        resolve();
      }, 100);
    });
  },

  async removeCardFromDeck(deckId: string, cardId: string, quantity: number = 1): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deckCardsJson = localStorage.getItem(DECK_CARDS_KEY);
        const deckCards: DeckCard[] = deckCardsJson ? JSON.parse(deckCardsJson) : [];
        
        const cardIndex = deckCards.findIndex(dc => dc.deck_id === deckId && dc.card_id === cardId);
        
        if (cardIndex >= 0) {
          deckCards[cardIndex].quantity -= quantity;
          if (deckCards[cardIndex].quantity <= 0) {
            deckCards.splice(cardIndex, 1);
          }
        }
        
        localStorage.setItem(DECK_CARDS_KEY, JSON.stringify(deckCards));
        resolve();
      }, 100);
    });
  },

  async getDeck(deckId: string): Promise<Deck | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const decksJson = localStorage.getItem(DECKS_KEY);
        const allDecks: Deck[] = decksJson ? JSON.parse(decksJson) : [];
        const deck = allDecks.find(d => d.id === deckId);
        
        if (deck) {
          // Add deck cards
          const deckCardsJson = localStorage.getItem(DECK_CARDS_KEY);
          const allDeckCards: DeckCard[] = deckCardsJson ? JSON.parse(deckCardsJson) : [];
          
          deck.deck_cards = allDeckCards
            .filter(dc => dc.deck_id === deck.id)
            .map(dc => ({
              ...dc,
              card: sampleCards.find(card => card.id === dc.card_id)
            }));
          
          if (deck.leader_card_id) {
            deck.leader_card = sampleCards.find(card => card.id === deck.leader_card_id);
          }
        }
        
        resolve(deck || null);
      }, 100);
    });
  },

  async deleteDeck(deckId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Remove deck
        const decksJson = localStorage.getItem(DECKS_KEY);
        const decks: Deck[] = decksJson ? JSON.parse(decksJson) : [];
        const filteredDecks = decks.filter(deck => deck.id !== deckId);
        localStorage.setItem(DECKS_KEY, JSON.stringify(filteredDecks));
        
        // Remove deck cards
        const deckCardsJson = localStorage.getItem(DECK_CARDS_KEY);
        const deckCards: DeckCard[] = deckCardsJson ? JSON.parse(deckCardsJson) : [];
        const filteredDeckCards = deckCards.filter(dc => dc.deck_id !== deckId);
        localStorage.setItem(DECK_CARDS_KEY, JSON.stringify(filteredDeckCards));
        
        resolve();
      }, 100);
    });
  }
};

export type { Card, Deck, DeckCard };
