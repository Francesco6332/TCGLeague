import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
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
  AlertCircle
} from 'lucide-react';
import type { League, News } from '../types';
import { useGeolocation, calculateDistance } from '../hooks/useGeolocation';

interface LeagueWithDistance extends League {
  distance?: number | null;
}

export function Home() {
  const { userProfile } = useAuth();
  const [nearbyEvents, setNearbyEvents] = useState<LeagueWithDistance[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();

  useEffect(() => {
    // Fetch real events and news from Firestore
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch events
        const eventsQuery = query(
          collection(db, 'events'),
          where('status', 'in', ['upcoming', 'ongoing']),
          orderBy('startDate', 'asc'),
          limit(10)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        let events = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as League[];

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

        // Fetch news
        const newsQuery = query(
          collection(db, 'news'),
          where('isVisible', '==', true),
          orderBy('publishedAt', 'desc'),
          limit(5)
        );
        const newsSnapshot = await getDocs(newsQuery);
        const newsData = newsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          publishedAt: doc.data().publishedAt?.toDate() || new Date(),
        })) as News[];
        
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays on error
        setNearbyEvents([]);
        setNews([]);
      } finally {
        setLoading(false);
      }
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
