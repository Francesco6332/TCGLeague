import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Star,
  ArrowRight,
  Newspaper,
  ExternalLink
} from 'lucide-react';
import type { League, News } from '../types';

export function Home() {
  const { userProfile } = useAuth();
  const [nearbyEvents, setNearbyEvents] = useState<League[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching nearby events and news
    const fetchData = async () => {
      setLoading(true);
      
      // Mock data for demonstration
      const mockEvents: League[] = [
        {
          id: '1',
          name: 'One Piece Championship Series',
          description: 'Official tournament series with exclusive prizes',
          storeId: 'store1',
          storeName: 'Dragon Ball TCG Center',
          format: 'Championship',
          startDate: new Date('2024-02-15'),
          endDate: new Date('2024-02-15'),
          maxParticipants: 32,
          entryFee: 15,
          prizePool: 'Booster packs and exclusive playmat',
          participants: [],
          rounds: [],
          standings: [],
          status: 'upcoming',
          location: {
            address: '123 Main St',
            city: 'Tokyo',
            state: 'Tokyo',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Weekly One Piece League',
          description: 'Casual weekly tournaments for all skill levels',
          storeId: 'store2',
          storeName: 'Anime Cards Paradise',
          format: 'Standard',
          startDate: new Date('2024-02-10'),
          endDate: new Date('2024-02-10'),
          maxParticipants: 16,
          entryFee: 5,
          participants: [],
          rounds: [],
          standings: [],
          status: 'ongoing',
          location: {
            address: '456 Anime Ave',
            city: 'Osaka',
            state: 'Osaka',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockNews: News[] = [
        {
          id: '1',
          title: 'New OP-07 Set "500 Years in the Future" Announced!',
          content: 'Bandai announces the latest One Piece Card Game expansion featuring time-skip characters and new mechanics.',
          imageUrl: undefined,
          author: 'Bandai Official',
          publishedAt: new Date('2024-02-01'),
          tags: ['announcement', 'new-set'],
          isOfficial: true,
        },
        {
          id: '2',
          title: 'World Championship 2024 Registration Opens',
          content: 'Registration for the One Piece TCG World Championship is now open. Compete for the ultimate prize!',
          imageUrl: undefined,
          author: 'Tournament Officials',
          publishedAt: new Date('2024-01-28'),
          tags: ['tournament', 'championship'],
          isOfficial: true,
        },
      ];

      setTimeout(() => {
        setNearbyEvents(mockEvents);
        setNews(mockNews);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const getStatusColor = (status: League['status']) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/20';
      case 'ongoing': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold gradient-text">
          Welcome to TCG League
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          {userProfile?.userType === 'store' 
            ? 'Manage your tournaments and grow your community'
            : 'Discover tournaments, build decks, and compete with fellow duelists'
          }
        </p>
        <div className="flex items-center justify-center space-x-2 text-white/60">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span>Hello, {userProfile?.username}!</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nearby Events */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-blue-400" />
                <span>Nearby Events</span>
              </h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-white/10 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {event.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm mb-3">{event.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-white/60">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-white/60">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location.city}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-white/60">
                            <Users className="h-4 w-4" />
                            <span>{event.participants.length}/{event.maxParticipants || '∞'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-white/60">
                            <Trophy className="h-4 w-4" />
                            <span>{event.format}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          ${event.entryFee || 'Free'}
                        </div>
                        <div className="text-xs text-white/60">Entry Fee</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {nearbyEvents.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No events found in your area</p>
                    <p className="text-white/40 text-sm">Check back later or explore other regions</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* News & Updates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Quick Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>Your Stats</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Events Joined</span>
                <span className="font-medium text-white">
                  {userProfile?.userType === 'player' ? '12' : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">
                  {userProfile?.userType === 'player' ? 'Win Rate' : 'Events Organized'}
                </span>
                <span className="font-medium text-white">
                  {userProfile?.userType === 'player' ? '68%' : '8'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Current Rank</span>
                <span className="font-medium text-blue-400">#247</span>
              </div>
            </div>
          </div>

          {/* News Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Newspaper className="h-5 w-5 text-purple-400" />
                <span>Latest News</span>
              </h3>
              <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1">
                <span>More</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-white/10 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((article) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-l-2 border-purple-400 pl-3 hover:border-purple-300 transition-colors cursor-pointer"
                  >
                    <h4 className="font-medium text-white text-sm line-clamp-2 hover:text-purple-400 transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-white/60">
                        {formatDate(article.publishedAt)}
                      </span>
                      {article.isOfficial && (
                        <span className="bg-yellow-400/20 text-yellow-400 text-xs px-2 py-0.5 rounded">
                          Official
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
