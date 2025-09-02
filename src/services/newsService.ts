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

// Simulated news data (replace with real API calls when available)
const simulatedNews: News[] = [
  {
    id: 'limitless-1',
    title: 'Limitless Labs Launch: New Tournament Analytics Tool',
    excerpt: 'Explore comprehensive tournament data with our newest addition to the Limitless ecosystem.',
    content: 'Limitless Labs provides in-depth analysis of tournament results, deck performance, and meta trends.',
    author: 'Limitless TCG Team',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    source: 'Limitless TCG',
    sourceUrl: 'https://labs.limitlesstcg.com',
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=200&fit=crop',
    category: 'Tools',
    isOfficial: false,
    tags: ['analytics', 'tournaments', 'tools'],
  },
  {
    id: 'eggman-1',
    title: 'Fusion World SB01 Triple Win-A-Box Tournament',
    excerpt: 'Join us for an exciting Dragon Ball Super Card Game tournament with amazing prizes.',
    content: 'Multiple win-a-box prizes up for grabs in this special tournament event.',
    author: 'Eggman Events',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    source: 'Eggman Events',
    sourceUrl: 'https://egmanevents.com/community-events',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
    category: 'Events',
    isOfficial: false,
    tags: ['tournament', 'dragon-ball', 'prizes'],
  },
  {
    id: 'optcg-1',
    title: 'One Piece Card Game - New Set OP09 Preview',
    excerpt: 'Get ready for the newest expansion featuring characters from the Egghead Island arc.',
    content: 'Discover new mechanics and powerful cards in the upcoming OP09 set release.',
    author: 'Bandai Namco',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    source: 'OP TCG Official',
    sourceUrl: 'https://onepiece-cardgame.com',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
    category: 'Product',
    isOfficial: true,
    tags: ['one-piece', 'new-set', 'egghead'],
  },
  {
    id: 'limitless-2',
    title: 'Championship Series Results: Regional Tournament Analysis',
    excerpt: 'Comprehensive breakdown of the latest regional tournament results and meta shifts.',
    content: 'Analysis of deck performance, popular strategies, and emerging meta trends.',
    author: 'Limitless Analytics',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    source: 'Limitless TCG',
    sourceUrl: 'https://limitlesstcg.com',
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=200&fit=crop',
    category: 'Results',
    isOfficial: false,
    tags: ['tournament', 'results', 'meta'],
  },
  {
    id: 'eggman-2',
    title: 'Weekly Community Stream: Deck Building Workshop',
    excerpt: 'Join our weekly stream where we build competitive decks and discuss strategies.',
    content: 'Interactive deck building session with community participation and Q&A.',
    author: 'Eggman Events Team',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    source: 'Eggman Events',
    sourceUrl: 'https://egmanevents.com',
    imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=200&fit=crop',
    category: 'Stream',
    isOfficial: false,
    tags: ['stream', 'deck-building', 'community'],
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
