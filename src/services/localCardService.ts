// Local card service for managing cards and decks without external database
import { GITHUB_IMAGE_URLS } from '../github-image-mapping';

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

// Generate cards from GitHub image mapping
function generateCardsFromGitHub(): Card[] {
  const cards: Card[] = [];
  
  // Parse card numbers from GitHub image mapping
  Object.keys(GITHUB_IMAGE_URLS).forEach(key => {
    // Extract set code and card number from key (e.g., "OP01-OP01-001" -> "OP01", "OP01-001")
    const parts = key.split('-');
    if (parts.length >= 3) {
      const setCode = parts[0];
      const cardNumber = `${parts[1]}-${parts[2]}`;
      
      // Generate card data based on set and number patterns
      const card = generateCardData(setCode, cardNumber);
      if (card) {
        cards.push(card);
      }
    }
  });
  
  return cards;
}

// Generate card data based on set code and card number
function generateCardData(setCode: string, cardNumber: string): Card | null {
  // Extract card number without set prefix (e.g., "001" from "OP01-001")
  const cardNum = cardNumber.split('-')[1];
  const cardNumInt = parseInt(cardNum);
  
  if (isNaN(cardNumInt)) return null;
  
  // Generate card properties based on patterns
  const card: Card = {
    id: cardNumber.toLowerCase().replace('-', '-'),
    card_number: cardNumber,
    name: generateCardName(setCode, cardNumInt),
    set_code: setCode,
    color: generateCardColor(cardNumInt),
    type: generateCardType(cardNumInt),
    rarity: generateCardRarity(cardNumInt),
    effect: generateCardEffect(cardNumInt),
    attribute: generateCardAttribute(cardNumInt)
  };
  
  // Add specific properties based on card type
  if (card.type === 'Leader') {
    card.life = generateLeaderLife(cardNumInt);
    card.power = 5000; // Default leader power
  } else if (card.type === 'Character') {
    card.cost = generateCharacterCost(cardNumInt);
    card.power = generateCharacterPower(cardNumInt);
  } else if (card.type === 'Event') {
    card.cost = generateEventCost(cardNumInt);
  } else if (card.type === 'Stage') {
    card.cost = generateStageCost(cardNumInt);
  }
  
  return card;
}

// Helper functions to generate card properties
function generateCardName(setCode: string, cardNum: number): string {
  const setNames: Record<string, string[]> = {
    'OP01': ['Monkey D. Luffy', 'Roronoa Zoro', 'Nami', 'Usopp', 'Sanji', 'Tony Tony Chopper', 'Nico Robin', 'Franky', 'Brook', 'Jinbe'],
    'OP02': ['Trafalgar Law', 'Eustass Kid', 'Killer', 'Heat', 'Wire', 'Apoo', 'Hawkins', 'Drake', 'Urouge', 'Bonney'],
    'OP03': ['Kaido', 'King', 'Queen', 'Jack', 'Who\'s Who', 'Black Maria', 'Sasaki', 'Ulti', 'Page One', 'Scratchmen Apoo'],
    'OP04': ['Big Mom', 'Katakuri', 'Smoothie', 'Cracker', 'Perospero', 'Oven', 'Daifuku', 'Compote', 'Galette', 'Mont-d\'Or'],
    'OP05': ['Shanks', 'Benn Beckman', 'Lucky Roux', 'Yasopp', 'Rockstar', 'Limejuice', 'Building Snake', 'Monster', 'Howling Gab', 'Rockstar'],
    'OP06': ['Blackbeard', 'Jesus Burgess', 'Van Augur', 'Doc Q', 'Laffitte', 'Avalo Pizarro', 'Catarina Devon', 'Sanjuan Wolf', 'Vasco Shot', 'Shiryu'],
    'OP07': ['Sakazuki', 'Borsalino', 'Issho', 'Aramaki', 'Garp', 'Sengoku', 'Tsuru', 'Momonga', 'Hina', 'Smoker'],
    'OP08': ['Dragon', 'Sabo', 'Koala', 'Hack', 'Lindbergh', 'Belo Betty', 'Morley', 'Karasu', 'Ivankov', 'Emporio Ivankov'],
    'OP09': ['Crocodile', 'Daz Bones', 'Mr. 1', 'Mr. 2', 'Mr. 3', 'Miss Doublefinger', 'Miss Goldenweek', 'Miss Merry Christmas', 'Miss Valentine', 'Miss All Sunday'],
    'OP10': ['Whitebeard', 'Marco', 'Portgas D. Ace', 'Jozu', 'Vista', 'Thatch', 'Izo', 'Haruta', 'Namur', 'Blamenco'],
    'OP11': ['Gol D. Roger', 'Silvers Rayleigh', 'Scopper Gaban', 'Oden', 'Inuarashi', 'Nekomamushi', 'Kawamatsu', 'Denjiro', 'Ashura Doji', 'Kinemon'],
    'OP12': ['Luffy', 'Zoro', 'Nami', 'Usopp', 'Sanji', 'Chopper', 'Robin', 'Franky', 'Brook', 'Jinbe'],
    'OP13': ['Luffy', 'Zoro', 'Nami', 'Usopp', 'Sanji', 'Chopper', 'Robin', 'Franky', 'Brook', 'Jinbe']
  };
  
  const setCharacters = setNames[setCode] || ['Unknown Character'];
  const characterIndex = (cardNum - 1) % setCharacters.length;
  return setCharacters[characterIndex];
}

function generateCardColor(cardNum: number): Card['color'] {
  const colors: Card['color'][] = ['Red', 'Blue', 'Green', 'Purple', 'Yellow', 'Black', 'Colorless'];
  const colorIndex = cardNum % colors.length;
  return colors[colorIndex];
}

function generateCardType(cardNum: number): Card['type'] {
  // Leaders are typically in the first few cards of each set
  if (cardNum <= 10) return 'Leader';
  
  // DON!! cards are usually at the end
  if (cardNum >= 90) return 'DON!!';
  
  // Events are usually in the middle
  if (cardNum >= 40 && cardNum <= 60) return 'Event';
  
  // Stages are scattered
  if (cardNum % 20 === 0) return 'Stage';
  
  // Default to Character
  return 'Character';
}

function generateCardRarity(cardNum: number): Card['rarity'] {
  // Leaders are usually L or P
  if (cardNum <= 10) {
    return cardNum === 1 ? 'L' : 'P';
  }
  
  // Special cards
  if (cardNum % 10 === 0) return 'SEC';
  if (cardNum % 5 === 0) return 'SR';
  if (cardNum % 3 === 0) return 'R';
  if (cardNum % 2 === 0) return 'UC';
  
  return 'C';
}

function generateCardEffect(cardNum: number): string {
  const effects = [
    '[On Play] Draw 1 card.',
    '[On Play] K.O. up to 1 of your opponent\'s Characters with 3000 power or less.',
    '[Activate: Main] Give up to 1 of your Characters +1000 power during this turn.',
    '[On Play] Add up to 1 DON!! card from your DON!! deck to your hand.',
    '[On Play] Deal 1 damage to up to 1 of your opponent\'s Characters.',
    '[Activate: Main] [Once per turn] Give all of your Characters +1000 power during this turn.',
    '[On Play] Give up to 1 of your Characters +2000 power during this turn.',
    '[On Play] K.O. up to 1 of your opponent\'s Characters with 4000 power or less.',
    '[Activate: Main] [Once per turn] Give up to 1 of your Characters +1000 power during this turn.',
    '[On Play] K.O. up to 1 of your opponent\'s Characters with 5000 power or less.'
  ];
  
  const effectIndex = cardNum % effects.length;
  return effects[effectIndex];
}

function generateCardAttribute(cardNum: number): string {
  const attributes = [
    'Straw Hat Crew',
    'Heart Pirates',
    'Kid Pirates',
    'Beast Pirates',
    'Big Mom Pirates',
    'Whitebeard Pirates',
    'Marine',
    'Revolutionary Army',
    'Baroque Works',
    'Red Hair Pirates',
    'Blackbeard Pirates',
    'Roger Pirates',
    'Wano Country'
  ];
  
  const attributeIndex = cardNum % attributes.length;
  return attributes[attributeIndex];
}

function generateLeaderLife(cardNum: number): number {
  // Leaders typically have 4-5 life
  return cardNum % 2 === 0 ? 4 : 5;
}

function generateCharacterCost(cardNum: number): number {
  // Character costs range from 1-8
  return (cardNum % 8) + 1;
}

function generateCharacterPower(cardNum: number): number {
  // Character power ranges from 1000-8000
  return ((cardNum % 8) + 1) * 1000;
}

function generateEventCost(cardNum: number): number {
  // Event costs range from 1-5
  return (cardNum % 5) + 1;
}

function generateStageCost(cardNum: number): number {
  // Stage costs are usually 1-3
  return (cardNum % 3) + 1;
}

// Generate all cards from GitHub mapping
const allCards = generateCardsFromGitHub();

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
    offset?: number;
  } = {}): Promise<Card[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredCards = [...allCards];

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

        // Apply offset if specified
        if (filters.offset) {
          filteredCards = filteredCards.slice(filters.offset);
        }

        // Apply limit if specified
        if (filters.limit) {
          filteredCards = filteredCards.slice(0, filters.limit);
        }

        resolve(filteredCards);
      }, 100); // Simulate network delay
    });
  },

  async getAllCards(): Promise<Card[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...allCards]);
      }, 100);
    });
  },

  async getCardByNumber(cardNumber: string): Promise<Card | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const card = allCards.find(c => c.card_number === cardNumber);
        resolve(card || null);
      }, 100);
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
              card: allCards.find(card => card.id === dc.card_id)
            }));
          
          if (deck.leader_card_id) {
            deck.leader_card = allCards.find(card => card.id === deck.leader_card_id);
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
              card: allCards.find(card => card.id === dc.card_id)
            }));
          
          if (deck.leader_card_id) {
            deck.leader_card = allCards.find(card => card.id === deck.leader_card_id);
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
