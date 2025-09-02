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
        
        // For "my" mode with players: filter events where they are participants
        if (viewMode === 'my' && userProfile.userType === 'player') {
          fetchedEvents = fetchedEvents.filter(event => 
            event.participants.some(participant => 
              participant.playerId === userProfile.id
            )
          );
        }

        // Add distance calculation if geolocation is available
        if (latitude && longitude) {
          fetchedEvents = fetchedEvents.map(event => ({
            ...event,
            distance: event.location.coordinates
              ? calculateDistance(
                  latitude,
                  longitude,
                  event.location.coordinates.lat,
                  event.location.coordinates.lng
                )
              : null,
          }));
        }
        
        // Sort events
        fetchedEvents.sort((a, b) => {
          // If in "all" mode and we have distances, sort by distance first
          if (viewMode === 'all' && 
              (a as LeagueWithDistance).distance !== null && 
              (b as LeagueWithDistance).distance !== null) {
            return ((a as LeagueWithDistance).distance || 0) - ((b as LeagueWithDistance).distance || 0);
          }
          
          // Default sort by date
          if (userProfile.userType === 'store' && viewMode === 'my') {
            return b.createdAt.getTime() - a.createdAt.getTime(); // newest first for store's own events
          } else {
            return a.startDate.getTime() - b.startDate.getTime(); // upcoming first
          }
        });
        
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userProfile, viewMode, latitude, longitude]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.format.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationSearch || 
                           event.location.city.toLowerCase().includes(locationSearch.toLowerCase()) ||
                           event.location.state.toLowerCase().includes(locationSearch.toLowerCase()) ||
                           event.location.address.toLowerCase().includes(locationSearch.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesLocation && matchesFilter;
  });

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleEventCreated = (newEvent: League) => {
    setEvents(prev => [newEvent, ...prev]);
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
          <h1 className="text-3xl font-bold gradient-text">
            {viewMode === 'all' ? 'Discover Events' : userProfile?.userType === 'store' ? 'My Organized Events' : 'My Events'}
          </h1>
          <p className="text-white/70 mt-2">
            {viewMode === 'all' 
              ? 'Find and join tournaments in your area'
              : userProfile?.userType === 'store' 
                ? 'Manage and organize your tournaments'
                : 'Track your tournament participation and results'
            }
          </p>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setViewMode('my')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'my' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {userProfile?.userType === 'store' ? 'My Events' : 'Joined Events'}
              </button>
            </div>
            
            {/* Geolocation Status */}
            {viewMode === 'all' && (
              <div className="flex items-center space-x-2 text-sm text-white/60">
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
            className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </motion.button>
        )}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="space-y-4">
          {/* Primary Search Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Event Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Search events, stores, descriptions..."
                className="input-field w-full pl-10"
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
                className="input-field w-full pl-10"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-white/60" />
              <select
                className="input-field min-w-32"
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

          {/* Search Results Info */}
          {(searchTerm || locationSearch || filterStatus !== 'all') && (
            <div className="flex items-center justify-between text-sm text-white/60 bg-white/5 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-4">
                <span>
                  {filteredEvents.length} events found
                  {viewMode === 'all' && latitude && longitude && (
                    <span className="ml-2 text-green-400">• Sorted by distance</span>
                  )}
                </span>
                {(searchTerm || locationSearch || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setLocationSearch('');
                      setFilterStatus('all');
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Events Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No events found' : 'No events yet'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm || locationSearch || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : viewMode === 'all'
                  ? 'No events available right now. Check back later!'
                  : userProfile?.userType === 'store'
                    ? 'Create your first event to get started'
                    : 'Join some events to see them here'
              }
            </p>
            {userProfile?.userType === 'store' && viewMode === 'my' && !searchTerm && !locationSearch && filterStatus === 'all' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Event</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-white text-lg line-clamp-2">
                    {event.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                <p className="text-white/70 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location.city || event.storeName}</span>
                    </div>
                    {event.distance && (
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                        {event.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <Users className="h-4 w-4" />
                    <span>{event.participants.length}/{event.maxParticipants || '∞'} participants</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <Trophy className="h-4 w-4" />
                    <span>{event.format}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-green-400 font-semibold">
                    ${event.entryFee || 'Free'}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/events/${event.id}`}
                      className="btn-secondary flex items-center space-x-1 px-3 py-1 text-sm"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </Link>
                    {userProfile?.userType === 'store' && viewMode === 'my' && event.storeId === userProfile.id && (
                      <button className="btn-primary flex items-center space-x-1 px-3 py-1 text-sm">
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
