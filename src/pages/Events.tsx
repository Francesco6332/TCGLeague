import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Navigation,
  AlertCircle
} from 'lucide-react';
import type { League } from '../types';
import { CreateEventModal } from '../components/CreateEventModal';
import { useGeolocation, calculateDistance } from '../hooks/useGeolocation';

interface LeagueWithDistance extends League {
  distance?: number | null;
}

export function Events() {
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<LeagueWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [locationSearch, setLocationSearch] = useState(searchParams.get('location') || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>(
    (searchParams.get('status') as any) || 'all'
  );
  const [viewMode, setViewMode] = useState<'all' | 'my'>(
    userProfile?.userType === 'store' ? 'my' : 'all'
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();

  useEffect(() => {
    // Update URL parameters when search state changes
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (locationSearch) params.set('location', locationSearch);
    if (filterStatus !== 'all') params.set('status', filterStatus);
    setSearchParams(params);
  }, [searchTerm, locationSearch, filterStatus, setSearchParams]);

  useEffect(() => {
    // Fetch events from Firestore
    const fetchEvents = async () => {
      if (!userProfile) return;
      
      setLoading(true);
      
      try {
        let eventsQuery;
        
        if (viewMode === 'my') {
          // Fetch user's specific events
          if (userProfile.userType === 'store') {
            // For stores: fetch events they created
            eventsQuery = query(
              collection(db, 'events'),
              where('storeId', '==', userProfile.id)
            );
          } else {
            // For players: fetch ALL events and filter client-side for their participation
            eventsQuery = query(collection(db, 'events'));
          }
        } else {
          // Fetch ALL events for discovery
          eventsQuery = query(
            collection(db, 'events'),
            limit(50) // Limit for performance
          );
        }
        
        const eventsSnapshot = await getDocs(eventsQuery);
        
        let fetchedEvents = eventsSnapshot.docs.map(doc => {
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

        // Filter for player's events if needed
        if (viewMode === 'my' && userProfile.userType === 'player') {
          fetchedEvents = fetchedEvents.filter(event => 
            event.participants.some(p => p.id === userProfile.id)
          );
        }

        // Calculate distances and sort if location is available
        if (latitude && longitude) {
          fetchedEvents = fetchedEvents
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
        } else {
          // Sort by date if no location
          fetchedEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        }
        
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userProfile, viewMode, latitude, longitude]);

  // Filter events based on search criteria
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationSearch ||
      event.location.city.toLowerCase().includes(locationSearch.toLowerCase()) ||
      event.location.state.toLowerCase().includes(locationSearch.toLowerCase()) ||
      event.location.address.toLowerCase().includes(locationSearch.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400';
      case 'ongoing':
        return 'bg-green-500/20 text-green-400';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header - Mobile responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8"
        >
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2 sm:mb-3">
              {viewMode === 'all' ? 'Discover Events' : userProfile?.userType === 'store' ? 'My Organized Events' : 'My Events'}
            </h1>
            <p className="text-white/70 text-sm sm:text-base mb-4 sm:mb-6">
              {viewMode === 'all' 
                ? 'Find and join tournaments in your area'
                : userProfile?.userType === 'store' 
                  ? 'Manage and organize your tournaments'
                  : 'Track your tournament participation and results'
              }
            </p>
            
            {/* View Mode Toggle - Mobile responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    viewMode === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => setViewMode('my')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    viewMode === 'my' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {userProfile?.userType === 'store' ? 'My Events' : 'Joined Events'}
                </button>
              </div>
              
              {/* Geolocation Status - Mobile responsive */}
              {viewMode === 'all' && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/60">
                  {locationLoading && (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                      <span>Getting location...</span>
                    </>
                  )}
                  {locationError && (
                    <>
                      <AlertCircle className="h-3 w-3 text-yellow-400" />
                      <span>Location disabled</span>
                    </>
                  )}
                  {latitude && longitude && !locationLoading && (
                    <>
                      <Navigation className="h-3 w-3 text-green-400" />
                      <span>Location enabled</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {userProfile?.userType === 'store' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0 w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </motion.button>
          )}
        </motion.div>

        {/* Filters and Search - Mobile responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="space-y-3 sm:space-y-4">
            {/* Primary Search Row - Mobile responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Event Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search events, stores, descriptions..."
                  className="input-field w-full pl-10 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Location Search */}
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="City, state, or address..."
                  className="input-field w-full pl-10 text-sm sm:text-base"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-white/60" />
                <select
                  className="input-field min-w-32 text-sm sm:text-base"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Search Results Info - Mobile responsive */}
            {(searchTerm || locationSearch || filterStatus !== 'all') && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-white/60 bg-white/5 rounded-lg px-3 sm:px-4 py-2 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span>
                    {filteredEvents.length} events found
                    {viewMode === 'all' && latitude && longitude && (
                      <span className="ml-1 sm:ml-2 text-green-400">• Sorted by distance</span>
                    )}
                  </span>
                </div>
                {(searchTerm || locationSearch || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setLocationSearch('');
                      setFilterStatus('all');
                    }}
                    className="text-blue-400 hover:text-blue-300 underline text-xs sm:text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Events Grid - Mobile responsive */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse card p-4 sm:p-6">
                  <div className="h-4 sm:h-6 bg-white/10 rounded mb-3 sm:mb-4"></div>
                  <div className="h-3 sm:h-4 bg-white/10 rounded mb-2 sm:mb-3"></div>
                  <div className="h-3 sm:h-4 bg-white/10 rounded mb-3 sm:mb-4"></div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 sm:h-4 bg-white/10 rounded w-1/3"></div>
                      <div className="h-3 sm:h-4 bg-white/10 rounded w-1/4"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 sm:h-4 bg-white/10 rounded w-1/2"></div>
                      <div className="h-3 sm:h-4 bg-white/10 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-white/40 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                {searchTerm || locationSearch || filterStatus !== 'all' ? 'No events found' : 'No events available'}
              </h3>
              <p className="text-white/60 text-sm sm:text-base mb-4 sm:mb-6">
                {searchTerm || locationSearch || filterStatus !== 'all' 
                  ? 'Try adjusting your search criteria'
                  : 'Check back later for new tournaments'
                }
              </p>
              {(searchTerm || locationSearch || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setLocationSearch('');
                    setFilterStatus('all');
                  }}
                  className="btn-secondary text-sm sm:text-base"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-4 sm:p-6 hover:scale-105 transition-transform cursor-pointer"
                >
                  <Link to={`/events/${event.id}`}>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Event Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2 mb-1 sm:mb-2">
                            {event.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                            {event.distance && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                                {event.distance} km
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-base sm:text-lg font-bold text-green-400">
                            ${event.entryFee || 'Free'}
                          </div>
                          <div className="text-xs text-white/60">Entry Fee</div>
                        </div>
                      </div>

                      {/* Event Description */}
                      <p className="text-white/70 text-xs sm:text-sm line-clamp-2">
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-white/60">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-white/60">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{event.participants.length}/{event.maxParticipants || '∞'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-white/60">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">{event.location.city}, {event.location.state}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-white/60">
                            <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{event.format}</span>
                          </div>
                        </div>
                      </div>

                      {/* Store Info */}
                      <div className="pt-2 sm:pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-white/60">Organized by</span>
                          <span className="text-white font-medium truncate ml-2">
                            {event.storeName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Event Modal */}
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  );
}
