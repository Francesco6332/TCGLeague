import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  DollarSign,
  Edit,
  UserPlus,
  Award,
  Star
} from 'lucide-react';
import type { League } from '../types';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const [event, setEvent] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'standings' | 'participants'>('overview');

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        const eventDoc = await getDoc(doc(db, 'events', id));
        
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          const event: League = {
            id: eventDoc.id,
            ...eventData,
            startDate: eventData.startDate?.toDate() || new Date(),
            endDate: eventData.endDate?.toDate() || new Date(),
            createdAt: eventData.createdAt?.toDate() || new Date(),
            updatedAt: eventData.updatedAt?.toDate() || new Date(),
          } as League;
          
          setEvent(event);
        } else {
          console.error('Event not found');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Check if user is already registered
  const isUserRegistered = event?.participants.some(
    participant => participant.playerId === userProfile?.id
  );

  // Handle player registration
  const handleRegisterForEvent = async () => {
    if (!event || !userProfile || userProfile.userType !== 'player' || isUserRegistered) {
      return;
    }

    setRegistering(true);
    
    try {
      const participant = {
        playerId: userProfile.id,
        playerName: userProfile.username,
        bandaiMembershipId: userProfile.bandaiMembershipId || '',
        registeredAt: new Date(),
        dropped: false,
      };

      await updateDoc(doc(db, 'events', event.id), {
        participants: arrayUnion(participant),
        updatedAt: new Date(),
      });

      // Update local state
      setEvent(prev => prev ? {
        ...prev,
        participants: [...prev.participants, participant]
      } : null);

      console.log('✅ Successfully registered for event');
    } catch (error) {
      console.error('❌ Error registering for event:', error);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          Return to Home
        </Link>
      </div>
    );
  }



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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isStore = userProfile?.userType === 'store';
  const canEdit = isStore && event?.storeId === userProfile?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-white/40 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-white/60 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/events" className="btn-primary">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <Link to="/events" className="btn-secondary p-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold gradient-text">{event.name}</h1>
          <p className="text-white/70 mt-1">Organized by {event.storeName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
          {/* Register Button for Players */}
          {userProfile?.userType === 'player' && event.status === 'upcoming' && (
            <button 
              onClick={handleRegisterForEvent}
              disabled={isUserRegistered || registering || (event.maxParticipants != null && event.participants.length >= event.maxParticipants)}
              className={`btn-primary flex items-center space-x-2 ${
                isUserRegistered ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>
                {registering ? 'Registering...' : 
                 isUserRegistered ? 'Already Registered' : 'Register for Event'}
              </span>
            </button>
          )}
          
          {/* Edit Button for Store Owners */}
          {canEdit && (
            <Link 
              to="/dashboard"
              className="btn-primary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Manage in Dashboard</span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Event Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-white/60 text-sm">Date & Time</p>
              <p className="text-white font-medium">{formatDate(event.startDate)}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-white/60 text-sm">Location</p>
              <p className="text-white font-medium">{event.location.city}</p>
              <p className="text-white/70 text-sm">{event.location.address}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-white/60 text-sm">Participants</p>
              <p className="text-white font-medium">
                {event.participants.length}/{event.maxParticipants || '∞'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-white/60 text-sm">Entry Fee</p>
              <p className="text-white font-medium">${event.entryFee || 'Free'}</p>
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
            { id: 'standings', label: 'Standings', icon: Award },
            { id: 'participants', label: 'Participants', icon: Users },
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Description */}
            <div className="lg:col-span-2 card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Event Description</h3>
              <p className="text-white/80 leading-relaxed mb-6">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Format</h4>
                  <p className="text-white/70">{event.format}</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Duration</h4>
                  <p className="text-white/70">
                    {Math.ceil((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60))} hours
                  </p>
                </div>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span>Prize Pool</span>
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">{event.prizePool}</p>
            </div>
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Current Standings</h3>
              {userProfile?.userType === 'store' && canEdit && (
                <div className="text-sm text-white/60">
                  💡 Update standings through your store dashboard
                </div>
              )}
            </div>
            
            {event.standings.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No standings available yet</p>
                <p className="text-white/40 text-sm">
                  {userProfile?.userType === 'store' && canEdit 
                    ? 'Use your store dashboard to input match results and update standings'
                    : 'Standings will appear once the tournament begins'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-2 text-white/80">Rank</th>
                      <th className="text-left py-3 px-2 text-white/80">Player</th>
                      <th className="text-center py-3 px-2 text-white/80">Points</th>
                      <th className="text-center py-3 px-2 text-white/80">W-L-D</th>
                      <th className="text-center py-3 px-2 text-white/80">OMW%</th>
                      <th className="text-center py-3 px-2 text-white/80">GW%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.standings.map((standing, index) => (
                      <tr key={standing.playerId} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">#{standing.rank}</span>
                            {index < 3 && <Star className="h-4 w-4 text-yellow-400" />}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-white font-medium">{standing.playerName}</td>
                        <td className="py-3 px-2 text-center font-bold text-blue-400">{standing.points}</td>
                        <td className="py-3 px-2 text-center text-white/80">
                          {standing.wins}-{standing.losses}-{standing.draws}
                        </td>
                        <td className="py-3 px-2 text-center text-white/60">
                          {(standing.opponentWinPercentage * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-2 text-center text-white/60">
                          {(standing.gameWinPercentage * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Participants</h3>
              <span className="text-white/60 text-sm">
                {event.participants.length} / {event.maxParticipants || '∞'} registered
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.participants.map((participant) => (
                <div key={participant.playerId} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {participant.playerName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{participant.playerName}</p>
                      {participant.deckName && (
                        <p className="text-white/60 text-sm">{participant.deckName}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </motion.div>
    </div>
  );
}
