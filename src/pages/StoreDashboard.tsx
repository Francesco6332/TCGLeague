import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Edit,
  Plus,
  TrendingUp,
  Clock,
  Target,
  Settings
} from 'lucide-react';
import type { League } from '../types';
import { CreateEventModal } from '../components/CreateEventModal';
import { ResultsManager } from '../components/ResultsManager';

export function StoreDashboard() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<League | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'results'>('overview');

  useEffect(() => {
    const fetchStoreEvents = async () => {
      if (!userProfile || userProfile.userType !== 'store') return;
      
      setLoading(true);
      
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('storeId', '==', userProfile.id)
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const storeEvents = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as League[];
        
        // Sort by creation date (newest first)
        storeEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setEvents(storeEvents);
      } catch (error) {
        console.error('Error fetching store events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreEvents();
  }, [userProfile]);

  const handleEventCreated = (newEvent: League) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleStandingsUpdated = (updatedEvent: League) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setSelectedEvent(updatedEvent);
  };

  const getStatusColor = (status: League['status']) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/20';
      case 'ongoing': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
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

  if (!userProfile || userProfile.userType !== 'store') {
    return (
      <div className="text-center py-12">
        <Settings className="h-16 w-16 text-white/40 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-white/60 mb-6">Only store accounts can access the dashboard.</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const ongoingEvents = events.filter(e => e.status === 'ongoing');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Store Dashboard</h1>
          <p className="text-white/70 mt-1">Manage your events and tournaments</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{events.length}</p>
              <p className="text-white/60 text-sm">Total Events</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
              <p className="text-white/60 text-sm">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{ongoingEvents.length}</p>
              <p className="text-white/60 text-sm">Ongoing</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {events.reduce((total, event) => total + event.participants.length, 0)}
              </p>
              <p className="text-white/60 text-sm">Total Players</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-1"
      >
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: Trophy },
            { id: 'events', label: 'My Events', icon: Calendar },
            { id: 'results', label: 'Results Management', icon: Target },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Events */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Events</h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-white/10 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">No events created yet</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary mt-4"
                  >
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <Link 
                      key={event.id} 
                      to={`/events/${event.id}`}
                      className="block p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{event.name}</h4>
                          <p className="text-white/60 text-sm">{formatDate(event.startDate)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                          <span className="text-white/60 text-sm">
                            {event.participants.length} players
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Event</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('results')}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <Target className="h-4 w-4" />
                  <span>Manage Results</span>
                </button>
                
                <Link 
                  to="/profile"
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Store Settings</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">My Events</h3>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-white/10 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">No Events Yet</h4>
                <p className="text-white/60 mb-6">Create your first tournament to get started</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{event.name}</h4>
                        <p className="text-white/60 text-sm">{formatDate(event.startDate)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <Link 
                          to={`/events/${event.id}`}
                          className="btn-secondary p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-white/60">
                        <Users className="h-4 w-4" />
                        <span>{event.participants.length}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/60">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location.city}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/60">
                        <Trophy className="h-4 w-4" />
                        <span>{event.format}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {!selectedEvent ? (
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Select Event to Manage</h3>
                
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-white/40 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">No Events Available</h4>
                    <p className="text-white/60 mb-6">Create an event first to manage results and standings.</p>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary"
                    >
                      Create Event
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white mb-1">{event.name}</h4>
                            <p className="text-white/60 text-sm">{formatDate(event.startDate)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-white/60">
                            <Users className="h-4 w-4" />
                            <span>{event.participants.length} players</span>
                          </div>
                          <div className="flex items-center space-x-2 text-white/60">
                            <Trophy className="h-4 w-4" />
                            <span>{event.standings.length > 0 ? 'Has standings' : 'No results yet'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="btn-secondary"
                  >
                    ← Back to Events
                  </button>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedEvent.name}</h3>
                    <p className="text-white/60 text-sm">{selectedEvent.participants.length} participants</p>
                  </div>
                </div>
                
                <ResultsManager 
                  event={selectedEvent} 
                  onStandingsUpdated={handleStandingsUpdated}
                />
              </div>
            )}
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
