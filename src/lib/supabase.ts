import { createClient } from '@supabase/supabase-js';

// Supabase configuration - these will be environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

// Check if we're in development mode without Supabase config
const isDevelopmentMode = !import.meta.env.VITE_SUPABASE_URL || 
                         import.meta.env.VITE_SUPABASE_URL === 'https://demo-project.supabase.co';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Show warning in development mode
if (isDevelopmentMode && typeof window !== 'undefined') {
  console.warn('⚠️  Running with demo Supabase config');
  console.warn('📝  Please set up your Supabase configuration in .env file for card database functionality');
  console.warn('🔗  Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

// Database types for TypeScript
export interface Card {
  id: string;
  card_number: string;
  name: string;
  type: 'Leader' | 'Character' | 'Event' | 'Stage' | 'DON!!';
  color: 'Red' | 'Blue' | 'Green' | 'Purple' | 'Yellow' | 'Black' | 'Colorless';
  cost?: number;
  power?: number;
  counter?: number;
  attribute?: string;
  rarity: 'C' | 'UC' | 'R' | 'SR' | 'SEC' | 'L' | 'P';
  set_code: string;
  set_name: string;
  effect?: string;
  trigger?: string;
  life?: number; // For leaders
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeckCard {
  id: string;
  deck_id: string;
  card_id: string;
  quantity: number;
  card?: Card; // Populated in joins
}

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  format: 'Standard' | 'Limited' | 'Championship' | 'Casual';
  leader_card_id?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  total_cards?: number;
  deck_cards?: DeckCard[];
  leader_card?: Card;
}

// Card database functions
export const cardService = {
  // Get all cards with optional filters
  async getCards(filters?: {
    set?: string;
    color?: string;
    type?: string;
    rarity?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('cards')
      .select('*');

    if (filters?.set) {
      query = query.eq('set_code', filters.set);
    }
    if (filters?.color) {
      query = query.eq('color', filters.color);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.rarity) {
      query = query.eq('rarity', filters.rarity);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,effect.ilike.%${filters.search}%,card_number.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 50) - 1);
    }

    const { data, error } = await query.order('set_code', { ascending: true }).order('card_number', { ascending: true });
    
    if (error) throw error;
    return data as Card[];
  },

  // Get a specific card by ID
  async getCard(id: string) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Card;
  },

  // Get cards by set
  async getCardsBySet(setCode: string) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('set_code', setCode)
      .order('card_number', { ascending: true });
    
    if (error) throw error;
    return data as Card[];
  },

  // Get leaders only
  async getLeaders() {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('type', 'Leader')
      .order('set_code', { ascending: true });
    
    if (error) throw error;
    return data as Card[];
  },

  // Search cards
  async searchCards(searchTerm: string, limit = 20) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,effect.ilike.%${searchTerm}%,card_number.ilike.%${searchTerm}%`)
      .limit(limit);
    
    if (error) throw error;
    return data as Card[];
  }
};

// Deck management functions
export const deckService = {
  // Get user's decks
  async getUserDecks(userId: string) {
    const { data, error } = await supabase
      .from('decks')
      .select(`
        *,
        leader_card:cards!decks_leader_card_id_fkey(*),
        deck_cards(
          id,
          card_id,
          quantity,
          card:cards(*)
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as Deck[];
  },

  // Get a specific deck
  async getDeck(deckId: string) {
    const { data, error } = await supabase
      .from('decks')
      .select(`
        *,
        leader_card:cards!decks_leader_card_id_fkey(*),
        deck_cards(
          id,
          card_id,
          quantity,
          card:cards(*)
        )
      `)
      .eq('id', deckId)
      .single();
    
    if (error) throw error;
    return data as Deck;
  },

  // Create a new deck
  async createDeck(deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('decks')
      .insert(deck)
      .select()
      .single();
    
    if (error) throw error;
    return data as Deck;
  },

  // Update a deck
  async updateDeck(deckId: string, updates: Partial<Deck>) {
    const { data, error } = await supabase
      .from('decks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', deckId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Deck;
  },

  // Delete a deck
  async deleteDeck(deckId: string) {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);
    
    if (error) throw error;
  },

  // Add card to deck
  async addCardToDeck(deckId: string, cardId: string, quantity: number = 1) {
    // Check if card already exists in deck
    const { data: existing, error: checkError } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .eq('card_id', cardId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      throw checkError;
    }

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('deck_cards')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as DeckCard;
    } else {
      // Add new card
      const { data, error } = await supabase
        .from('deck_cards')
        .insert({ deck_id: deckId, card_id: cardId, quantity })
        .select()
        .single();
      
      if (error) throw error;
      return data as DeckCard;
    }
  },

  // Remove card from deck
  async removeCardFromDeck(deckId: string, cardId: string, quantity?: number) {
    if (quantity) {
      // Reduce quantity
      const { data: existing, error: checkError } = await supabase
        .from('deck_cards')
        .select('*')
        .eq('deck_id', deckId)
        .eq('card_id', cardId)
        .single();

      if (checkError) throw checkError;

      if (existing.quantity <= quantity) {
        // Remove completely
        const { error } = await supabase
          .from('deck_cards')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Reduce quantity
        const { data, error } = await supabase
          .from('deck_cards')
          .update({ quantity: existing.quantity - quantity })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data as DeckCard;
      }
    } else {
      // Remove all
      const { error } = await supabase
        .from('deck_cards')
        .delete()
        .eq('deck_id', deckId)
        .eq('card_id', cardId);
      
      if (error) throw error;
    }
  }
};

export default supabase;
