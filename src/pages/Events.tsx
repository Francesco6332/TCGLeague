import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
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
  Edit
} from 'lucide-react';
import type { League } from '../types';

export function Events() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    // Simulate fetching user's events
    const fetchEvents = async () => {
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
          startDate: new Date('2024-01-20'),
          endDate: new Date('2024-01-20'),
          maxParticipants: 16,
          entryFee: 5,
          participants: [],
          rounds: [],
          standings: [],
          status: 'completed',
          location: {
            address: '456 Anime Ave',
            city: 'Osaka',
            state: 'Osaka',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setTimeout(() => {
        setEvents(mockEvents);
        setLoading(false);
      }, 1000);
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
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
            {userProfile?.userType === 'store' ? 'My Organized Events' : 'My Events'}
          </h1>
          <p className="text-white/70 mt-2">
            {userProfile?.userType === 'store' 
              ? 'Manage and organize your tournaments'
              : 'Track your tournament participation and results'
            }
          </p>
        </div>
        
        {userProfile?.userType === 'store' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
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
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="text"
              placeholder="Search events..."
              className="input-field w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-white/60" />
            <select
              className="input-field"
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
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : userProfile?.userType === 'store'
                  ? 'Create your first event to get started'
                  : 'Join some events to see them here'
              }
            </p>
            {userProfile?.userType === 'store' && !searchTerm && filterStatus === 'all' && (
              <button className="btn-primary flex items-center space-x-2 mx-auto">
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
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <MapPin className="h-4 w-4" />
                    <span>{event.storeName}</span>
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
                    {userProfile?.userType === 'store' && (
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
    </div>
  );
}
