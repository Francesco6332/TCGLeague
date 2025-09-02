import type { News } from '../types';

// External news source configurations
const NEWS_SOURCES = {
  limitless: {
    name: 'Limitless TCG',
    baseUrl: 'https://limitlesstcg.com',
    color: '#3b82f6', // blue
  },
  eggman: {
    name: 'Eggman Events',
    baseUrl: 'https://egmanevents.com',
    color: '#f59e0b', // yellow
  },
  optcg: {
    name: 'OP TCG Official',
    baseUrl: 'https://onepiece-cardgame.com',
    color: '#ef4444', // red
  },
};

// News cache to reduce API calls
let newsCache: { data: News[]; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Real news data from official sources
const simulatedNews: News[] = [
  {
    id: 'optcg-anniversary-2025',
    title: 'ONE PIECE CARD GAME Japanese 3rd ANNIVERSARY SET Updated',
    excerpt: 'Special anniversary set celebrating 3 years of One Piece Card Game with exclusive content and commemorative cards.',
    content: 'The Japanese 3rd Anniversary Set has been updated with new cards and special promotional content to celebrate the milestone.',
    author: 'Bandai Namco',
    publishedAt: new Date('2025-09-01T10:00:00Z'),
    source: 'OP TCG Official',
    sourceUrl: 'https://en.onepiece-cardgame.com/',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
    category: 'Product',
    isOfficial: true,
    tags: ['anniversary', 'japanese', 'special-set', 'commemorative'],
  },
  {
    id: 'optcg-promotion-cards-2025',
    title: 'New Promotion Card Distribution Announcement',
    excerpt: 'Official announcement for the distribution of new promotional cards across participating stores.',
    content: 'Details about upcoming promotional card distributions and how players can obtain these exclusive cards.',
    author: 'Bandai Namco',
    publishedAt: new Date('2025-08-29T14:00:00Z'),
    source: 'OP TCG Official',
    sourceUrl: 'https://en.onepiece-cardgame.com/',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
    category: 'Promotions',
    isOfficial: true,
    tags: ['promotion', 'cards', 'distribution', 'exclusive'],
  },
  {
    id: 'optcg-championship-25-26',
    title: 'Championship 25-26 Online Regionals Season 2 Updated',
    excerpt: 'Latest updates for the Championship 25-26 Online Regionals tournament series with new format and prize information.',
    content: 'Championship series continues with Season 2 featuring updated tournament structure and enhanced prize pools.',
    author: 'Bandai Namco Tournament Team',
    publishedAt: new Date('2025-08-29T12:00:00Z'),
    source: 'OP TCG Official',
    sourceUrl: 'https://en.onepiece-cardgame.com/',
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=200&fit=crop',
    category: 'Events',
    isOfficial: true,
    tags: ['championship', 'online', 'regionals', 'season-2'],
  },
  {
    id: 'optcg-store-championship-sept',
    title: 'Store Championship September (Season 2) Updated',
    excerpt: 'Store Championship events for September have been updated with new participating locations and tournament schedules.',
    content: 'Local game stores can now host official Store Championship events with updated prize support and tournament kits.',
    author: 'Bandai Namco Organized Play',
    publishedAt: new Date('2025-08-29T11:00:00Z'),
    source: 'OP TCG Official',
    sourceUrl: 'https://en.onepiece-cardgame.com/',
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=200&fit=crop',
    category: 'Events',
    isOfficial: true,
    tags: ['store-championship', 'september', 'local-events', 'organized-play'],
  },
  {
    id: 'optcg-official-sleeves-12',
    title: 'Official Sleeves 12 Released',
    excerpt: 'New set of official card sleeves featuring popular One Piece characters and artwork from recent story arcs.',
    content: 'The 12th series of official One Piece Card Game sleeves is now available with stunning artwork and premium quality.',
    author: 'Bandai Namco Products',
    publishedAt: new Date('2025-08-29T09:00:00Z'),
    source: 'OP TCG Official',
    sourceUrl: 'https://en.onepiece-cardgame.com/',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
    category: 'Product',
    isOfficial: true,
    tags: ['sleeves', 'accessories', 'artwork', 'premium'],
  },
  {
    id: 'optcg-booster-op12',
    title: 'BOOSTER PACK [OP-12] Now Available',
    excerpt: 'The latest booster pack OP-12 brings new characters, mechanics, and strategies to the One Piece Card Game.',
    content: 'Booster Pack OP-12 introduces fresh gameplay elements with cards from recent One Piece story arcs.',
    author: 'Bandai Namco',
    publishedAt: new Date('2025-08-25T10:00:00Z'),
    source: 'OP TCG Official',
    sourceUrl: 'https://en.onepiece-cardgame.com/',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
    category: 'Product',
    isOfficial: true,
    tags: ['booster-pack', 'op-12', 'new-cards', 'mechanics'],
  },
  {
    id: 'optcg-starter-deck-ace-newgate',
    title: 'STARTER DECK-Ace & Newgate- Available Now',
    excerpt: 'New starter deck featuring Portgas D. Ace and Edward Newgate (Whitebeard) with pre-constructed competitive decks.',
    content: 'Perfect entry point for new players featuring two powerful leaders and their signature strategies.',
    author: 'Bandai Namco',
    publishedAt: new Date('2025-08-20T10:00:00Z'),
    source: 'OP TCG Official',
    sourceUrl: 'https://en.onepiece-cardgame.com/',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
    category: 'Product',
    isOfficial: true,
    tags: ['starter-deck', 'ace', 'whitebeard', 'newgate', 'beginner'],
  },
  {
    id: 'limitless-op12-meta',
    title: 'OP-12 Meta Analysis: Early Tournament Results',
    excerpt: 'Comprehensive analysis of the emerging meta following the release of Booster Pack OP-12.',
    content: 'Deep dive into tournament performance data and deck archetypes dominating the current format.',
    author: 'Limitless Analytics Team',
    publishedAt: new Date('2025-08-28T15:00:00Z'),
    source: 'Limitless TCG',
    sourceUrl: 'https://limitlesstcg.com',
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=200&fit=crop',
    category: 'Results',
    isOfficial: false,
    tags: ['meta', 'analysis', 'op-12', 'tournament-results'],
  },
];

// Function to fetch news from external sources
async function fetchExternalNews(): Promise<News[]> {
  try {
    // In a real implementation, you would make actual API calls here
    // For now, we'll simulate the API calls and return mock data
    
    // Example of how you might fetch from real APIs:
    /*
    const limitlessResponse = await fetch(`${NEWS_SOURCES.limitless.baseUrl}/api/news`);
    const eggmanResponse = await fetch(`${NEWS_SOURCES.eggman.baseUrl}/api/events`);
    
    const limitlessNews = await limitlessResponse.json();
    const eggmanNews = await eggmanResponse.json();
    
    return [...limitlessNews, ...eggmanNews];
    */
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return simulatedNews;
  } catch (error) {
    console.error('Error fetching external news:', error);
    return simulatedNews; // Fallback to simulated data
  }
}

// Function to get news with caching
export async function getNews(limit: number = 10): Promise<News[]> {
  const now = Date.now();
  
  // Check cache validity
  if (newsCache && (now - newsCache.timestamp) < CACHE_DURATION) {
    return newsCache.data.slice(0, limit);
  }
  
  try {
    const news = await fetchExternalNews();
    
    // Sort by publication date (newest first)
    const sortedNews = news.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    // Update cache
    newsCache = {
      data: sortedNews,
      timestamp: now,
    };
    
    return sortedNews.slice(0, limit);
  } catch (error) {
    console.error('Error getting news:', error);
    
    // Return cached data if available, otherwise empty array
    return newsCache?.data.slice(0, limit) || [];
  }
}

// Function to get news by category
export async function getNewsByCategory(category: string, limit: number = 5): Promise<News[]> {
  const allNews = await getNews(50); // Get more news to filter
  return allNews
    .filter(news => news.category.toLowerCase() === category.toLowerCase())
    .slice(0, limit);
}

// Function to search news
export async function searchNews(query: string, limit: number = 10): Promise<News[]> {
  const allNews = await getNews(50);
  const searchTerm = query.toLowerCase();
  
  return allNews
    .filter(news => 
      news.title.toLowerCase().includes(searchTerm) ||
      news.excerpt.toLowerCase().includes(searchTerm) ||
      news.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
    .slice(0, limit);
}

// Function to clear cache (useful for manual refresh)
export function clearNewsCache(): void {
  newsCache = null;
}

export { NEWS_SOURCES };
