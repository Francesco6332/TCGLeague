import { useState } from 'react';
import { doc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
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
import type { League, Standing } from '../types';

interface ResultsManagerProps {
  event: League;
  onStandingsUpdated: (updatedEvent: League) => void;
}

interface FinalPlacement {
  playerId: string;
  playerName: string;
  finalRank: number;
  points: number;
  wins: number;
  losses: number;
}

export function ResultsManager({ event, onStandingsUpdated }: ResultsManagerProps) {
  const [showAddStandings, setShowAddStandings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalPlacements, setFinalPlacements] = useState<FinalPlacement[]>([]);
  const [selectedStage, setSelectedStage] = useState<number>(
    event.stages?.length > 0 ? Math.max(0, event.currentStage) : 0
  );

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

  const calculateCumulativeStandings = (stageResults: FinalPlacement[], stageNumber: number): Standing[] => {
    // Get all previous stage results
    const allResults = new Map<string, { points: number, totalWins: number, totalLosses: number, stagesPlayed: number }>();
    
    // Initialize all participants
    event.participants.forEach(participant => {
      allResults.set(participant.playerId, {
        points: 0,
        totalWins: 0,
        totalLosses: 0,
        stagesPlayed: 0
      });
    });

    // Add points from all completed stages (including current)
    for (let i = 0; i < stageNumber; i++) {
      const stage = event.stages[i];
      if (stage && stage.standings) {
        stage.standings.forEach(standing => {
          const current = allResults.get(standing.playerId);
          if (current) {
            current.points += standing.points;
            current.totalWins += standing.wins;
            current.totalLosses += standing.losses;
            current.stagesPlayed++;
          }
        });
      }
    }

    // Add current stage results
    stageResults.forEach(result => {
      const current = allResults.get(result.playerId);
      if (current) {
        current.points += result.points;
        current.totalWins += result.wins;
        current.totalLosses += result.losses;
        current.stagesPlayed++;
      }
    });

    // Convert to standings array
    const standings: Standing[] = Array.from(allResults.entries()).map(([playerId, data]) => {
      const participant = event.participants.find(p => p.playerId === playerId);
      return {
        playerId,
        playerName: participant?.playerName || 'Unknown',
        points: data.points,
        wins: data.totalWins,
        losses: data.totalLosses,
        draws: 0,
        matchesPlayed: data.stagesPlayed,
        opponentWinPercentage: 0,
        gameWinPercentage: data.totalWins + data.totalLosses > 0 ? data.totalWins / (data.totalWins + data.totalLosses) : 0,
        rank: 0, // Will be calculated after sorting
      };
    });

    // Sort by points (descending), then by wins (descending)
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });

    // Assign ranks
    standings.forEach((standing, index) => {
      standing.rank = index + 1;
    });

    return standings.filter(s => s.points > 0 || s.matchesPlayed > 0); // Only show participants with results
  };

  const updateParticipantStats = async (participants: any[]) => {
    // Update stats for all participants in the background
    try {
      const updatePromises = participants.map(async (participant) => {
        // Get all events this player participated in
        const eventsQuery = query(collection(db, 'events'));
        const eventsSnapshot = await getDocs(eventsQuery);
        
        let totalWins = 0;
        let totalLosses = 0;
        let eventsJoined = 0;
        
        eventsSnapshot.docs.forEach(doc => {
          const event = doc.data();
          
          // Check if player participated in this event
          const isParticipant = event.participants?.some((p: any) => p.playerId === participant.playerId);
          if (!isParticipant) return;
          
          eventsJoined++;
          
          // Calculate wins and losses from all stages if event has stages
          if (event.stages && event.stages.length > 0) {
            event.stages.forEach((stage: any) => {
              if (stage.standings) {
                const playerStageStanding = stage.standings.find((s: any) => s.playerId === participant.playerId);
                if (playerStageStanding) {
                  totalWins += playerStageStanding.wins || 0;
                  totalLosses += playerStageStanding.losses || 0;
                }
              }
            });
          } else {
            // Fallback to overall standings if no stages
            const playerStanding = event.standings?.find((s: any) => s.playerId === participant.playerId);
            if (playerStanding) {
              totalWins += playerStanding.wins || 0;
              totalLosses += playerStanding.losses || 0;
            }
          }
        });

        // Update user stats in Firestore (if they exist)
        try {
          await updateDoc(doc(db, 'users', participant.playerId), {
            totalWins,
            totalLosses,
            eventsJoined,
            winRate: totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0,
            updatedAt: new Date(),
          });
        } catch (error) {
          // User document might not exist, that's okay
          console.log(`Could not update stats for user ${participant.playerId}`);
        }
      });

      await Promise.all(updatePromises);
      console.log('✅ Participant stats updated');
    } catch (error) {
      console.error('❌ Error updating participant stats:', error);
    }
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
      // Create stage standings (just for this stage)
      const stageStandings: Standing[] = finalPlacements.map(placement => ({
        playerId: placement.playerId,
        playerName: placement.playerName,
        points: placement.points,
        wins: placement.wins,
        losses: placement.losses,
        draws: 0,
        matchesPlayed: placement.wins + placement.losses,
        opponentWinPercentage: 0,
        gameWinPercentage: placement.wins + placement.losses > 0 ? placement.wins / (placement.wins + placement.losses) : 0,
        rank: placement.finalRank,
      }));

      // Calculate cumulative standings
      const cumulativeStandings = calculateCumulativeStandings(finalPlacements, selectedStage + 1);

      // Update the stages array
      const updatedStages = [...event.stages];
      updatedStages[selectedStage] = {
        ...updatedStages[selectedStage],
        isCompleted: true,
        standings: stageStandings,
      };

      // Determine if tournament is completed
      const isLastStage = selectedStage === event.stages.length - 1;
      const newStatus = isLastStage ? 'completed' : event.status;

      // Update event in Firestore
      await updateDoc(doc(db, 'events', event.id), {
        stages: updatedStages,
        standings: cumulativeStandings, // Overall cumulative standings
        currentStage: selectedStage + 1, // Move to next stage
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      const updatedEvent = {
        ...event,
        stages: updatedStages,
        standings: cumulativeStandings,
        currentStage: selectedStage + 1,
        status: newStatus as any,
      };

      onStandingsUpdated(updatedEvent);

      setShowAddStandings(false);
      setFinalPlacements([]);
      
      // Update participant stats in the background
      updateParticipantStats(event.participants);
      
      console.log('✅ Stage standings updated');
    } catch (error) {
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
        wins: 0,
        losses: 0,
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Tournament Standings - {event.name}</h3>
            <p className="text-white/60 text-sm">
              {event.stages?.length > 0 ? `Multi-stage tournament (${event.stages.length} stages)` : 'Single tournament'}
            </p>
          </div>
          {event.status !== 'completed' && event.stages?.length > 0 && (
            <button
              onClick={() => setShowAddStandings(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Trophy className="h-4 w-4" />
              <span>Input Stage Results</span>
            </button>
          )}
        </div>

        {/* Stage Selection */}
        {event.stages?.length > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-white/80 font-medium">View Stage:</span>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(parseInt(e.target.value))}
                className="input-field"
              >
                {event.stages.map((stage, index) => (
                  <option key={index} value={index}>
                    {stage.name} {stage.isCompleted ? '✓' : '⏳'}
                  </option>
                ))}
                <option value={-1}>Overall Standings</option>
              </select>
            </div>
            
            <div className="text-sm text-white/60">
              Current Stage: {event.currentStage < event.stages.length ? event.stages[event.currentStage]?.name : 'Tournament Complete'}
            </div>
          </div>
        )}
      </div>

      {/* Current Standings */}
      {((selectedStage === -1 && event.standings.length > 0) || 
        (selectedStage >= 0 && event.stages?.[selectedStage]?.standings?.length > 0)) && (
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>
              {selectedStage === -1 ? 'Overall Standings' : `${event.stages?.[selectedStage]?.name} Results`}
            </span>
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2 px-3 text-white/80">Rank</th>
                  <th className="text-left py-2 px-3 text-white/80">Player</th>
                  <th className="text-center py-2 px-3 text-white/80">Points</th>
                  <th className="text-center py-2 px-3 text-white/80">W-L</th>
                  <th className="text-center py-2 px-3 text-white/80">Win Rate</th>
                  {selectedStage === -1 && (
                    <th className="text-center py-2 px-3 text-white/80">Stages</th>
                  )}
                  <th className="text-center py-2 px-3 text-white/80">Bandai ID</th>
                </tr>
              </thead>
              <tbody>
                {(selectedStage === -1 ? event.standings : event.stages?.[selectedStage]?.standings || [])
                  .map((standing) => {
                    const participant = event.participants.find(p => p.playerId === standing.playerId);
                    return (
                      <tr key={standing.playerId} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-2 px-3 font-bold text-white">#{standing.rank}</td>
                        <td className="py-2 px-3 text-white">{standing.playerName}</td>
                        <td className="py-2 px-3 text-center font-bold text-yellow-400">{standing.points}</td>
                        <td className="py-2 px-3 text-center text-white/80">
                          {standing.wins}-{standing.losses}
                        </td>
                        <td className="py-2 px-3 text-center text-green-400">
                          {(standing.gameWinPercentage * 100).toFixed(1)}%
                        </td>
                        {selectedStage === -1 && (
                          <td className="py-2 px-3 text-center text-blue-400">
                            {standing.matchesPlayed}
                          </td>
                        )}
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
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Input Stage Results - {event.stages?.[selectedStage]?.name}
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  Stage Date: {event.stages?.[selectedStage]?.date 
                    ? new Date(event.stages[selectedStage].date).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
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
                <p className="text-white/70">Add players in their final ranking order for this stage</p>
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
                      <div className="space-y-4">
                        {/* First Row - Basic Info */}
                        <div className="grid grid-cols-12 gap-4 items-end">
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
                          
                          <div className="col-span-6">
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
                            <div className="text-lg font-bold text-yellow-400 py-2 px-3 bg-white/5 rounded border border-white/10 text-center">
                              {placement.points}
                            </div>
                          </div>
                          
                          <div className="col-span-1">
                            <button
                              onClick={() => removePlacement(index)}
                              className="w-full btn-secondary text-red-400 hover:text-red-300 p-2"
                              title="Remove player"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Second Row - Statistics */}
                        <div className="grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-4">
                            <label className="block text-sm text-white/80 mb-1">Wins</label>
                            <input
                              type="number"
                              min="0"
                              value={placement.wins}
                              onChange={(e) => updatePlacement(index, 'wins', parseInt(e.target.value) || 0)}
                              className="input-field w-full"
                              placeholder="0"
                            />
                          </div>
                          
                          <div className="col-span-4">
                            <label className="block text-sm text-white/80 mb-1">Losses</label>
                            <input
                              type="number"
                              min="0"
                              value={placement.losses}
                              onChange={(e) => updatePlacement(index, 'losses', parseInt(e.target.value) || 0)}
                              className="input-field w-full"
                              placeholder="0"
                            />
                          </div>
                          
                          <div className="col-span-4">
                            <label className="block text-sm text-white/80 mb-1">Win Rate</label>
                            <div className="text-sm font-medium text-green-400 py-2 px-3 bg-white/5 rounded border border-white/10 text-center">
                              {placement.wins + placement.losses > 0 
                                ? `${((placement.wins / (placement.wins + placement.losses)) * 100).toFixed(1)}%`
                                : '0.0%'
                              }
                            </div>
                          </div>
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
                <span>{loading ? 'Saving...' : 'Save Stage Results'}</span>
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
          <p className="text-white/60">Players need to register for this event before you can add stage results.</p>
        </div>
      )}
    </div>
  );
}
