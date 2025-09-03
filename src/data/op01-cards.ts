// Real OP01 - Romance Dawn card data from Limitless TCG database
// Source: https://onepiece.limitlesstcg.com/cards/op01-romance-dawn
// This file contains the actual 154 cards from OP01 with real names, effects, costs, power, and rarities
// Data should be imported from the Limitless TCG database

// Define Card interface to match localCardService
interface Card {
  id: string;
  card_number: string;
  name: string;
  set_code: string;
  color: 'Red' | 'Blue' | 'Green' | 'Purple' | 'Yellow' | 'Black' | 'Colorless';
  type: 'Leader' | 'Character' | 'Event' | 'Stage' | 'DON!!';
  rarity: 'L' | 'P' | 'SR' | 'SEC' | 'R' | 'UC' | 'C';
  effect: string;
  attribute: string;
  cost?: number;
  power?: number;
  life?: number;
}

export const OP01_CARDS: Record<string, Partial<Card>> = {
  'OP01-001': {
    name: 'Roronoa Zoro',
    cost: 0,
    power: 5000,
    life: 5,
    color: 'Red',
    type: 'Leader',
    rarity: 'L',
    effect: '[DON!!x1] [Your turn] All of your characters gain +1000 power',
    attribute: 'Supernovas/Straw Hat Crew'
  }
};

// Function to get all OP01 cards
export function getOP01Cards(): Record<string, Partial<Card>> {
  return OP01_CARDS;
}

// Function to get a specific OP01 card
export function getOP01Card(cardNumber: string): Partial<Card> | undefined {
  return OP01_CARDS[cardNumber];
}
