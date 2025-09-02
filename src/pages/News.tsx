import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  Search, 
  Filter, 
  ExternalLink, 
  Tag,
  Star,
  RefreshCw,
  Clock
} from 'lucide-react';
import type { News } from '../types';
import { getNews, getNewsByCategory, searchNews, clearNewsCache, NEWS_SOURCES } from '../services/newsService';

export function News() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'All News', count: 0 },
    { id: 'product', name: 'Product', count: 0 },
    { id: 'events', name: 'Events', count: 0 },
    { id: 'results', name: 'Results', count: 0 },
    { id: 'tools', name: 'Tools', count: 0 },
    { id: 'stream', name: 'Streams', count: 0 },
  ];

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else {
      fetchNews();
    }
  }, [searchTerm]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      let newsData: News[];
      if (selectedCategory === 'all') {
        newsData = await getNews(20);
      } else {
        newsData = await getNewsByCategory(selectedCategory, 20);
      }
      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchNews(searchTerm, 20);
      setNews(searchResults);
    } catch (error) {
      console.error('Error searching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    clearNewsCache();
    await fetchNews();
    setRefreshing(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      }).format(date);
    }
  };

  const getSourceColor = (source: string) => {
    const sourceConfig = Object.values(NEWS_SOURCES).find(s => s.name === source);
    return sourceConfig?.color || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center space-x-3">
            <Newspaper className="h-8 w-8 text-purple-400" />
            <span>TCG News</span>
          </h1>
          <p className="text-white/70 mt-2">
            Latest news from Limitless TCG, Eggman Events, and official sources
          </p>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="text"
              placeholder="Search news articles..."
              className="input-field w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-white/60" />
            <select
              className="input-field min-w-32"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* News Sources */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-white/60">Sources:</span>
          {Object.values(NEWS_SOURCES).map((source) => (
            <span
              key={source.name}
              className="inline-flex items-center space-x-1 bg-white/10 rounded-full px-3 py-1 text-xs"
              style={{ borderColor: source.color, borderWidth: '1px' }}
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: source.color }}
              />
              <span>{source.name}</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* News Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No articles found' : 'No news available'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Check back later for the latest TCG news'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:scale-105 transition-transform group"
              >
                <a 
                  href={article.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  {/* Article Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-white text-lg line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {article.title}
                    </h3>
                    <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-purple-400 transition-colors ml-2 flex-shrink-0" />
                  </div>

                  {/* Article Excerpt */}
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Article Meta */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-white/60">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getSourceColor(article.source) }}
                        />
                        <span className="text-sm font-medium" style={{ color: getSourceColor(article.source) }}>
                          {article.source}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {article.isOfficial && (
                          <span className="bg-yellow-400/20 text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Official</span>
                          </span>
                        )}
                        <span className="bg-blue-400/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <Tag className="h-3 w-3" />
                          <span>{article.category}</span>
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag} 
                            className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-xs text-white/40">+{article.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
