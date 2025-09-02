import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Star,
  ArrowRight,
  Newspaper,
  ExternalLink,
  Navigation,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import type { League, News } from '../types';
import { useGeolocation, calculateDistance } from '../hooks/useGeolocation';
import { getNews, clearNewsCache } from '../services/newsService';
import { getAppUpdates, clearAppUpdatesCache, getUpdateTypeColor, getUpdateTypeIcon, type AppUpdate } from '../services/appUpdatesService';

interface LeagueWithDistance extends League {
  distance?: number | null;
}

export function Home() {
  const { userProfile } = useAuth();
  const [nearbyEvents, setNearbyEvents] = useState<LeagueWithDistance[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [appUpdates, setAppUpdates] = useState<AppUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();

  useEffect(() => {
    // Fetch real events and news from Firestore
    const fetchData = async () => {
      setLoading(true);
      
      try {
        
        // Simplified query first - remove orderBy to avoid index issues
        const eventsQuery = query(
          collection(db, 'events'),
          where('status', 'in', ['upcoming', 'ongoing']),
          limit(10)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        
        let events = eventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate() || new Date(),
            endDate: data.endDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            // Convert stage dates from Firestore timestamps to Date objects
            stages: data.stages?.map((stage: any) => ({
              ...stage,
              date: stage.date?.toDate ? stage.date.toDate() : new Date(stage.date)
            })) || []
          };
        }) as League[];


        // Sort by distance if user location is available
        if (latitude && longitude) {
          events = events
            .map(event => ({
              ...event,
              distance: event.location.coordinates
                ? calculateDistance(
                    latitude,
                    longitude,
                    event.location.coordinates.lat,
                    event.location.coordinates.lng
                  )
                : null,
            }))
            .sort((a, b) => {
              // Events with coordinates come first, sorted by distance
              if (a.distance !== null && b.distance !== null) {
                return a.distance - b.distance;
              }
              if (a.distance !== null && b.distance === null) return -1;
              if (a.distance === null && b.distance !== null) return 1;
              // If neither has coordinates, sort by date
              return a.startDate.getTime() - b.startDate.getTime();
            });
        }
        
        setNearbyEvents(events);

        // Fetch news from external sources
        try {
          const newsData = await getNews(5);
          setNews(newsData);
        } catch (newsError) {
          console.error('Error fetching news:', newsError);
          setNews([]);
        }

        // Fetch app updates
        try {
          const updatesData = await getAppUpdates(3);
          setAppUpdates(updatesData);
        } catch (updatesError) {
          console.error('Error fetching app updates:', updatesError);
          setAppUpdates([]);
        }
      } catch (error) {
        
        // Check if it's a Firestore index error
        if (error instanceof Error && error.message.includes('index')) {
        }
        
        // Set empty arrays on error
        setNearbyEvents([]);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [latitude, longitude]); // Re-fetch when location changes

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
                {locationLoading && (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                )}
                {locationError && (
                  <span title={locationError}>
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                  </span>
                )}
                {latitude && longitude && !locationLoading && (
                  <span title="Location enabled">
                    <Navigation className="h-4 w-4 text-green-400" />
                  </span>
                )}
              </h2>
              <Link 
                to="/events" 
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
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
                  <Link key={event.id} to={`/events/${event.id}`}>
                    <motion.div
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
                            {event.distance && (
                              <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                                {event.distance} km
                              </span>
                            )}
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
                  </Link>
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
              <div className="flex items-center space-x-2">
                <button 
                  onClick={async () => {
                    clearNewsCache();
                    const newsData = await getNews(5);
                    setNews(newsData);
                  }}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                  title="Refresh news"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
                <span className="text-purple-400 text-xs">•</span>
                <Link 
                  to="/news" 
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
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
                    className="group cursor-pointer"
                  >
                    <a 
                      href={article.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block border-l-2 border-purple-400 pl-3 hover:border-purple-300 transition-colors"
                    >
                      <h4 className="font-medium text-white text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-white/50 mt-1 line-clamp-1">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-white/60">
                            {formatDate(article.publishedAt)}
                          </span>
                          <span className="text-xs text-purple-400 font-medium">
                            {article.source}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {article.isOfficial && (
                            <span className="bg-yellow-400/20 text-yellow-400 text-xs px-2 py-0.5 rounded">
                              Official
                            </span>
                          )}
                          <span className="bg-blue-400/20 text-blue-400 text-xs px-2 py-0.5 rounded">
                            {article.category}
                          </span>
                          <ExternalLink className="h-3 w-3 text-white/40 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* App Updates Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-green-400" />
                <span>App Updates</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={async () => {
                    clearAppUpdatesCache();
                    const updatesData = await getAppUpdates(3);
                    setAppUpdates(updatesData);
                  }}
                  className="text-green-400 hover:text-green-300 text-sm flex items-center space-x-1"
                  title="Refresh updates"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
                <span className="text-green-400 text-xs">•</span>
                <span className="text-green-400 text-xs">Internal</span>
              </div>
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
                {appUpdates.map((update) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group cursor-pointer"
                  >
                    <div className="block border-l-2 border-green-400 pl-3 hover:border-green-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">{getUpdateTypeIcon(update.type)}</span>
                            <h4 className="font-medium text-white text-sm line-clamp-1 group-hover:text-green-400 transition-colors">
                              {update.title}
                            </h4>
                            <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded">
                              v{update.version}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mb-2 line-clamp-1">
                            {update.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-white/60">
                            {formatDate(new Date(update.date))}
                          </span>
                          <span className="text-xs text-green-400 font-medium">
                            {update.author}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ 
                              backgroundColor: `${getUpdateTypeColor(update.type)}20`,
                              color: getUpdateTypeColor(update.type)
                            }}
                          >
                            {update.type}
                          </span>
                          {update.priority === 'high' && (
                            <span className="bg-red-400/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                              Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {appUpdates.length === 0 && (
                  <div className="text-center py-6">
                    <RefreshCw className="h-8 w-8 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">No recent updates</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
