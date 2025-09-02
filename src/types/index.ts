export type UserType = 'player' | 'store';

export interface User {
  id: string;
  email: string;
  username: string;
  userType: UserType;
  bandaiMembershipId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player extends User {
  userType: 'player';
  participatingEvents: string[];
  decks: Deck[];
}

export interface Store extends User {
  userType: 'store';
  storeName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  website?: string;
  description?: string;
  organizedEvents: string[];
}

export interface League {
  id: string;
  name: string;
  description: string;
  storeId: string;
  storeName: string;
  format: 'Constructed' | 'Limited' | 'Championship' | 'Casual';
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  entryFee?: number;
  prizePool?: string;
  participants: Participant[];
  rounds: Round[];
  standings: Standing[];
  stages: Stage[];
  currentStage: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  playerId: string;
  playerName: string;
  bandaiMembershipId?: string;
  deckName?: string;
  registeredAt: Date;
  dropped?: boolean;
}

export interface Stage {
  stageNumber: number;
  name: string;
  date: Date;
  isCompleted: boolean;
  standings: Standing[];
}

export interface Round {
  roundNumber: number;
  matches: Match[];
  isCompleted: boolean;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  winnerId?: string;
  isDraw: boolean;
  isCompleted: boolean;
  table?: number;
}

export interface Standing {
  playerId: string;
  playerName: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  matchesPlayed: number;
  opponentWinPercentage: number;
  gameWinPercentage: number;
  rank: number;
}

export interface Deck {
  id: string;
  name: string;
  playerId: string;
  format: string;
  leader: Card;
  mainDeck: DeckCard[];
  don: DeckCard[];
  totalCards: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

export interface Card {
  id: string;
  name: string;
  cost?: number;
  power?: number;
  counter?: number;
  color: Color[];
  type: CardType[];
  attribute?: string;
  rarity: Rarity;
  set: string;
  cardNumber: string;
  imageUrl?: string;
  effect?: string;
}

export interface DeckCard {
  card: Card;
  quantity: number;
}

export type Color = 'Red' | 'Blue' | 'Green' | 'Purple' | 'Yellow' | 'Black';
export type CardType = 'Leader' | 'Character' | 'Event' | 'Stage' | 'DON!!';
export type Rarity = 'C' | 'UC' | 'R' | 'SR' | 'SEC' | 'L' | 'P';

export interface News {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  author: string;
  publishedAt: Date;
  source: string;
  sourceUrl: string;
  category: string;
  tags: string[];
  isOfficial: boolean;
}
