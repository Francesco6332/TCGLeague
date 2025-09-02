import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  Save, 
  X,
  Users,
  Target
} from 'lucide-react';
import type { League, Standing, Match } from '../types';

interface ResultsManagerProps {
  event: League;
  onStandingsUpdated: (updatedEvent: League) => void;
}

interface FinalPlacement {
  playerId: string;
  playerName: string;
  finalRank: number;
  points: number;
}

export function ResultsManager({ event, onStandingsUpdated }: ResultsManagerProps) {
  const [showAddStandings, setShowAddStandings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalPlacements, setFinalPlacements] = useState<FinalPlacement[]>([]);

  const calculatePointsFromRank = (rank: number): number => {
    // Points system for top 10 finishers
    const pointsSystem: { [key: number]: number } = {
      1: 25,   // 1st place
      2: 18,   // 2nd place  
      3: 15,   // 3rd place
      4: 12,   // 4th place
      5: 10,   // 5th place
      6: 8,    // 6th place
      7: 6,    // 7th place
      8: 4,    // 8th place
      9: 2,    // 9th place
      10: 1,   // 10th place
    };
    
    return pointsSystem[rank] || 0; // 0 points for 11th place and below
  };

  const calculateStandings = (placements: FinalPlacement[]): Standing[] => {
    const standings: Standing[] = placements.map(placement => ({
      playerId: placement.playerId,
      playerName: placement.playerName,
      points: placement.points,
      wins: 0, // Not applicable for final standings
      losses: 0, // Not applicable for final standings
      draws: 0, // Not applicable for final standings
      matchesPlayed: 1, // Tournament completed
      opponentWinPercentage: 0, // Not applicable
      gameWinPercentage: 0, // Not applicable
      rank: placement.finalRank,
    }));

    // Sort by rank (ascending)
    standings.sort((a, b) => a.rank - b.rank);

    return standings;
  };

  const handleSubmitStandings = async () => {
    if (finalPlacements.length === 0) {
      alert('Please add at least one placement');
      return;
    }

    // Validate no duplicate ranks
    const ranks = finalPlacements.map(p => p.finalRank);
    const uniqueRanks = new Set(ranks);
    if (ranks.length !== uniqueRanks.size) {
      alert('Each player must have a unique rank');
      return;
    }

    setLoading(true);

    try {
      // Calculate new standings based on final placements
      const newStandings = calculateStandings(finalPlacements);

      // Update event in Firestore
      await updateDoc(doc(db, 'events', event.id), {
        standings: newStandings,
        status: 'completed', // Mark tournament as completed
        updatedAt: new Date(),
      });

      // Update local state
      const updatedEvent = {
        ...event,
        standings: newStandings,
        status: 'completed' as const,
      };

      onStandingsUpdated(updatedEvent);

      setShowAddStandings(false);
      setFinalPlacements([]);
      console.log('✅ Final standings updated');
    } catch (error) {
      console.error('❌ Error updating standings:', error);
      alert('Failed to update standings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addPlacement = () => {
    const nextRank = finalPlacements.length + 1;
    setFinalPlacements(prev => [
      ...prev,
      {
        playerId: '',
        playerName: '',
        finalRank: nextRank,
        points: calculatePointsFromRank(nextRank),
      }
    ]);
  };

  const updatePlacement = (index: number, field: keyof FinalPlacement, value: string | number) => {
    setFinalPlacements(prev => {
      const updated = [...prev];
      if (field === 'playerId' && typeof value === 'string') {
        const participant = event.participants.find(p => p.playerId === value);
        if (participant) {
          updated[index] = {
            ...updated[index],
            playerId: value,
            playerName: participant.playerName,
          };
        }
      } else if (field === 'finalRank' && typeof value === 'number') {
        updated[index] = {
          ...updated[index],
          finalRank: value,
          points: calculatePointsFromRank(value),
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const removePlacement = (index: number) => {
    setFinalPlacements(prev => prev.filter((_, i) => i !== index));
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Final Standings for {event.name}</h3>
          <p className="text-white/60 text-sm">Input final tournament rankings from external app</p>
        </div>
        {event.status !== 'completed' && (
          <button
            onClick={() => setShowAddStandings(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Trophy className="h-4 w-4" />
            <span>Input Final Rankings</span>
          </button>
        )}
      </div>

      {/* Current Standings */}
      {event.standings.length > 0 && (
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>Current Standings</span>
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2 px-3 text-white/80">Rank</th>
                  <th className="text-left py-2 px-3 text-white/80">Player</th>
                  <th className="text-center py-2 px-3 text-white/80">Points</th>
                  <th className="text-center py-2 px-3 text-white/80">Bandai ID</th>
                </tr>
              </thead>
              <tbody>
                {event.standings.map((standing) => {
                  const participant = event.participants.find(p => p.playerId === standing.playerId);
                  return (
                    <tr key={standing.playerId} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-2 px-3 font-bold text-white">#{standing.rank}</td>
                      <td className="py-2 px-3 text-white">{standing.playerName}</td>
                      <td className="py-2 px-3 text-center font-bold text-yellow-400">{standing.points}</td>
                      <td className="py-2 px-3 text-center text-white/60">
                        {participant?.bandaiMembershipId || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Points System Info */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="h-5 w-5 text-green-400" />
          <span>Points System</span>
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">25</div>
            <div className="text-white/60">1st Place</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-300">18</div>
            <div className="text-white/60">2nd Place</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">15</div>
            <div className="text-white/60">3rd Place</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">12...1</div>
            <div className="text-white/60">4th-10th</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white/40">0</div>
            <div className="text-white/60">11th+</div>
          </div>
        </div>
      </div>

      {/* Add Final Rankings Modal */}
      {showAddStandings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl border border-white/20 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Input Final Tournament Rankings</h3>
              <button
                onClick={() => {
                  setShowAddStandings(false);
                  setFinalPlacements([]);
                }}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white/70">Add players in their final ranking order</p>
                <button
                  onClick={addPlacement}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Player</span>
                </button>
              </div>

              {finalPlacements.length > 0 && (
                <div className="space-y-3">
                  {finalPlacements.map((placement, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <label className="block text-sm text-white/80 mb-1">Rank</label>
                          <input
                            type="number"
                            min="1"
                            value={placement.finalRank}
                            onChange={(e) => updatePlacement(index, 'finalRank', parseInt(e.target.value) || 1)}
                            className="input-field w-full"
                          />
                        </div>
                        
                        <div className="col-span-5">
                          <label className="block text-sm text-white/80 mb-1">Player</label>
                          <select
                            value={placement.playerId}
                            onChange={(e) => updatePlacement(index, 'playerId', e.target.value)}
                            className="input-field w-full"
                          >
                            <option value="">Select Player</option>
                            {event.participants
                              .filter(p => !finalPlacements.some((fp, fpIndex) => fp.playerId === p.playerId && fpIndex !== index))
                              .map((participant) => (
                                <option key={participant.playerId} value={participant.playerId}>
                                  {participant.playerName}
                                </option>
                              ))}
                          </select>
                        </div>
                        
                        <div className="col-span-3">
                          <label className="block text-sm text-white/80 mb-1">Points</label>
                          <div className="text-lg font-bold text-yellow-400 py-2">
                            {placement.points}
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <button
                            onClick={() => removePlacement(index)}
                            className="w-full btn-secondary text-red-400 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {finalPlacements.length === 0 && (
                <div className="text-center py-8 text-white/60">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-white/40" />
                  <p>Click "Add Player" to start adding final rankings</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStandings(false);
                  setFinalPlacements([]);
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitStandings}
                disabled={loading || finalPlacements.length === 0}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Final Rankings'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {event.participants.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-white mb-2">No Participants Yet</h4>
          <p className="text-white/60">Players need to register for this event before you can add match results.</p>
        </div>
      )}
    </div>
  );
}
